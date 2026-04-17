'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { X, Info, UserPlus } from 'lucide-react'
import { Notification, NotificationContextType, Toast } from '@/types/ui'

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useNotifications must be used within NotificationProvider')
  return context
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])
  // Removed unused notificationPermission state
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])

  const addToast = (title: string, message: string, type: string = 'info') => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, title, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }

  const fetchNotifications = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) setNotifications(data)
  }, [supabase])

  useEffect(() => {
    // Only request permission if needed; do not attempt to set Notification.permission (read-only)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (window.Notification.permission === 'default') {
        window.Notification.requestPermission();
      }
    }

    let channel: RealtimeChannel | null = null;
    let active = true;

    const showBrowserAlert = (title: string, message: string) => {
      if (typeof window === 'undefined') return;
      if (window.Notification?.permission !== 'granted') return;
      if (!document.hidden && document.hasFocus()) return;

      const notification = new window.Notification(title, {
        body: message,
        icon: '/favicon.ico',
        silent: true
      });
      notification.onclick = () => window.focus();
    };

    const setupSubscription = async () => {
      // Always clean up previous channel before creating a new one
      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
      await fetchNotifications();
      const { data: { user } } = await supabase.auth.getUser();
      if (user && active) {
        // Use a unique channel name to avoid Supabase callback errors
        const uniqueId = Math.random().toString(36).slice(2) + Date.now();
        const channelName = `notifications_${user.id}_${uniqueId}`;
        const newChannel = supabase
          .channel(channelName)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          }, (payload) => {
            if (!payload.new) return;
            const incoming = payload.new as Notification;
            
            // Update local state for all events (INSERT, UPDATE) to keep tabs in sync
            setNotifications(prev => {
              const exists = prev.some(n => n.id === incoming.id);
              if (exists) {
                return prev.map(n => n.id === incoming.id ? incoming : n);
              }
              return [incoming, ...prev];
            });

            // ONLY trigger active alerts/toasts on NEW notifications
            // This prevents "Clear All" (which triggers multiple UPDATEs) from spamming the user
            if (payload.eventType === 'INSERT') {
              addToast(incoming.title, incoming.message, incoming.type);
              showBrowserAlert(incoming.title, incoming.message);
            }
          });
        await newChannel.subscribe();
        channel = newChannel;
      }
    };

    setupSubscription();

    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchNotifications, supabase]);

  const markAsRead = async (id: string) => {
    const original = notifications.find(n => n.id === id)
    if (!original || original.read) return

    // Optimistic Update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))

    try {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('Persistence error (markAsRead):', err)
      // Rollback
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n))
      addToast('Sync Failed', 'Could not update notification status.', 'error')
    }
  }

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const original = [...notifications]
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))

    try {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', user.id)
      if (error) throw error
    } catch (err) {
      console.error('Persistence error (markAllAsRead):', err)
      setNotifications(original)
      addToast('Sync Failed', 'Could not clear all notifications.', 'error')
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, addToast }}>
      {children}
      
      {/* Absolute Toast Container */}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', zIndex: 9999 }}>
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className="glass"
            style={{ 
              padding: '1.25rem', 
              borderRadius: '16px', 
              minWidth: '320px', 
              maxWidth: '400px', 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '1rem',
              animation: 'slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ 
              padding: '0.5rem', 
              borderRadius: '10px', 
              background: toast.type === 'assignment' ? 'rgba(26, 115, 232, 0.1)' : 'rgba(30, 142, 62, 0.1)',
              color: toast.type === 'assignment' ? 'var(--brand)' : 'var(--success)'
            }}>
               {toast.type === 'assignment' ? <UserPlus size={20} /> : <Info size={20} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{toast.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', lineHeight: 1.4 }}>{toast.message}</div>
            </div>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-sub)' }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%) scale(0.9); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </NotificationContext.Provider>
  )
}


