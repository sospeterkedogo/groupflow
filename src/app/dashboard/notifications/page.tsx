'use client'

import { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { useNotifications } from '@/components/NotificationProvider'
import type { Notification } from '@/types/ui'
import { Bell, UserPlus, Check, X, Shield, Clock, Inbox, Mail, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

type InboxNotification = Notification & { metadata?: { sender_id?: string } }

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, addToast } = useNotifications()
  const [loading, setLoading] = useState(false)
  const supabase = createBrowserSupabaseClient()

  const handleAcceptConnection = async (notification: InboxNotification) => {
    setLoading(true)
    const { sender_id } = notification.metadata || {}
    if (!sender_id) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1. Update Connection to 'connected'
    const { error: connError } = await supabase
      .from('user_connections')
      .upsert({ user_id: user.id, target_id: sender_id, status: 'connected' })

    if (connError) {
      addToast('Error', 'Failed to accept connection', 'error')
    } else {
      // 2. Mark notification as read
      await markAsRead(notification.id)
      
      // 3. Send reciprocal notification to sender
      await supabase.from('notifications').insert({
        user_id: sender_id,
        type: 'connection_accepted',
        title: 'Connection Accepted',
        message: 'Your connection request was accepted. You can now chat real-time.',
        metadata: { acceptor_id: user.id }
      })

      addToast('Success', 'Connection established!', 'success')
    }
    setLoading(false)
  }

  const handleDeclineConnection = async (notification: InboxNotification) => {
    await markAsRead(notification.id)
    addToast('Success', 'Request ignored', 'info')
  }

  return (
    <div className="page-fade" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 var(--p-safe)' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '10px', background: 'var(--brand)', borderRadius: '14px', boxShadow: '0 8px 16px rgba(var(--brand-rgb), 0.2)' }}>
            <Inbox size={28} color="white" />
          </div>
          <h1 className="fluid-h1" style={{ margin: 0, fontWeight: 900 }}>Inbox Center</h1>
        </div>
        <button 
          onClick={markAllAsRead}
          style={{ 
            fontSize: '0.8rem', fontWeight: 800, color: 'var(--brand)', background: 'rgba(var(--brand-rgb), 0.1)', 
            border: 'none', padding: '0.6rem 1rem', borderRadius: '10px', cursor: 'pointer' 
          }}
        >
          Mark all read
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notifications.length === 0 ? (
          <div style={{ 
            textAlign: 'center', padding: '5rem 2rem', background: 'var(--surface)', 
            borderRadius: '24px', border: '1px solid var(--border)', opacity: 0.8 
          }}>
            <Bell size={48} color="var(--text-sub)" style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
            <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.25rem' }}>Your inbox is clean</h3>
            <p style={{ color: 'var(--text-sub)', marginTop: '0.5rem' }}>New connection requests and project updates will appear here.</p>
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id}
              className="glass"
              onClick={() => !n.read && markAsRead(n.id)}
              style={{ 
                padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)', 
                background: n.read ? 'var(--surface)' : 'rgba(var(--brand-rgb), 0.03)',
                boxShadow: n.read ? 'none' : '0 4px 20px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                position: 'relative',
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'flex-start',
                cursor: n.read ? 'default' : 'pointer'
              }}
            >
              {!n.read && <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand)', boxShadow: '0 0 10px var(--brand)' }} />}
              
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                background: n.type === 'connection_request' ? 'rgba(var(--brand-rgb), 0.1)' : 'var(--bg-sub)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: n.type === 'connection_request' ? 'var(--brand)' : 'var(--text-sub)'
              }}>
                {n.type === 'connection_request' ? <UserPlus size={24} /> : n.type === 'message' ? <MessageSquare size={24} /> : <Mail size={24} />}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 850 }}>{n.title}</h4>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', fontWeight: 600 }}>{formatDistanceToNow(new Date(n.created_at))} ago</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-sub)', lineHeight: 1.5, marginBottom: '1rem' }}>{n.message}</p>
                
                {n.type === 'connection_request' && !n.read && (
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                      onClick={() => handleAcceptConnection(n)}
                      disabled={loading}
                      style={{ 
                        flex: 1, padding: '0.6rem', borderRadius: '10px', background: 'var(--brand)', color: 'white', 
                        border: 'none', fontWeight: 750, cursor: 'pointer', fontSize: '0.85rem' 
                      }}
                    >
                      {loading ? 'Processing...' : 'Accept'}
                    </button>
                    <button 
                      onClick={() => handleDeclineConnection(n)}
                      style={{ 
                        flex: 1, padding: '0.6rem', borderRadius: '10px', background: 'var(--bg-sub)', color: 'var(--text-sub)', 
                        border: 'none', fontWeight: 750, cursor: 'pointer', fontSize: '0.85rem' 
                      }}
                    >
                      Ignore
                    </button>
                  </div>
                )}

                {n.type === 'connection_accepted' && (
                   <button 
                    onClick={() => markAsRead(n.id)}
                    style={{ 
                      padding: '0.5rem 1rem', borderRadius: '8px', background: 'var(--bg-sub)', color: 'var(--brand)', 
                      border: 'none', fontWeight: 750, cursor: 'pointer', fontSize: '0.75rem' 
                    }}
                  >
                    Start Chat
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  )
}
