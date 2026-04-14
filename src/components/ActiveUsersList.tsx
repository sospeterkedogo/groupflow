'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { usePresence } from './PresenceProvider'
import { User, Clock, Shield, Circle } from 'lucide-react'

export default function ActiveUsersList({ groupId, currentUser }: { groupId: string, currentUser: any }) {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { onlineUsers, typingUsers } = usePresence()

  useEffect(() => {
    fetchMembers()
    
    const channel = supabase.channel(`presence_list_${groupId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `group_id=eq.${groupId}` }, () => {
         fetchMembers()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [groupId])

  const fetchMembers = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('group_id', groupId)
      .order('last_seen', { ascending: false })
    
    if (data) setMembers(data)
    setLoading(false)
  }

  const formatLastSeen = (timestamp: string | null) => {
    if (!timestamp) return 'Never'
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Seconds ago'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  if (loading && members.length === 0) return <div style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>Loading pulse...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {members.map(member => {
        const isOnline = onlineUsers.has(member.id)
        const isTyping = typingUsers.has(member.id)
        const isMe = member.id === currentUser.id

        return (
          <div 
            key={member.id} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '1rem', 
              background: 'var(--bg-main)', 
              borderRadius: '16px',
              border: '1px solid var(--border)',
              opacity: isOnline ? 1 : 0.7,
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {member.avatar_url ? (
                    <img src={member.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={24} color="var(--text-sub)" />
                  )}
                </div>
                {isOnline && (
                  <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)', border: '2px solid var(--bg-main)', boxShadow: '0 0 8px var(--success)' }} />
                )}
              </div>
              
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <span style={{ fontWeight: 700, fontSize: '1rem' }}>{member.full_name} {isMe && '(You)'}</span>
                   {member.role === 'admin' && <Shield size={14} color="var(--brand)" />}
                </div>
                <div style={{ fontSize: '0.75rem', color: isTyping ? 'var(--brand)' : 'var(--text-sub)', fontWeight: isTyping ? 700 : 500 }}>
                   {isTyping ? (
                     <span style={{ fontStyle: 'italic' }}>is typing...</span>
                   ) : (
                     isOnline ? 'Online now' : `Last active ${formatLastSeen(member.last_seen)}`
                   )}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
               <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Impact</div>
               <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--brand)' }}>{member.total_score}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
