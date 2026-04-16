'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { Bell, X, Info, CheckCircle, AlertTriangle, UserPlus } from 'lucide-react'
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
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUnlockedRef = useRef(false)

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
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
    audio.preload = 'auto'
    audioRef.current = audio

    const unlockAudio = () => {
      if (!audioRef.current || audioUnlockedRef.current) return
      audioRef.current.currentTime = 0
      audioRef.current.play().then(() => {
        audioUnlockedRef.current = true
      }).catch(() => {
        audioUnlockedRef.current = false
      })
    }

    window.addEventListener('pointerdown', unlockAudio, { once: true })
    return () => window.removeEventListener('pointerdown', unlockAudio)
  }, [])

  useEffect(() => {
    let channel: RealtimeChannel | null = null
    let active = true

    const playDing = async () => {
      if (!audioRef.current) return
      try {
        audioRef.current.currentTime = 0
        await audioRef.current.play()
        audioUnlockedRef.current = true
      } catch (err) {
        console.warn('Notification sound blocked or unavailable:', err)
      }
    }

    const setupSubscription = async () => {
      await fetchNotifications()
      const { data: { user } } = await supabase.auth.getUser()
      if (user && active) {
        channel = supabase
          .channel(`notifications_${user.id}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          }, (payload) => {
            const newNotif = payload.new as Notification
            setNotifications(prev => [newNotif, ...prev])
            addToast(newNotif.title, newNotif.message, newNotif.type)
            playDing()
          })
          .subscribe()
      }
    }

    setupSubscription()

    return () => {
      active = false
      if (channel) supabase.removeChannel(channel)
    }
  }, [fetchNotifications, supabase])

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    await supabase.from('notifications').update({ read: true }).eq('id', id)
  }

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id)
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
