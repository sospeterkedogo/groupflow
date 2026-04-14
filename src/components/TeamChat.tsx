'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send, User, MessageSquare, X, ChevronRight, Hash } from 'lucide-react'
import { usePresence } from './PresenceProvider'

export default function TeamChat({ groupId, user }: { groupId: string, user: any }) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const { onlineUsers } = usePresence()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      fetchMessages()
      const channel = supabase
        .channel(`chat:${groupId}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `group_id=eq.${groupId}`
        }, (payload) => {
          setMessages((prev) => [...prev, payload.new])
          scrollToBottom()
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [groupId, isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('messages')
      .select('*, profiles(full_name, avatar_url)')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })
      .limit(50)
    
    if (data) setMessages(data)
    setLoading(false)
    scrollToBottom()
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const { error } = await supabase
      .from('messages')
      .insert({
        group_id: groupId,
        user_id: user.id,
        content: newMessage.trim()
      })

    if (!error) {
      setNewMessage('')
    }
  }

  if (!isOpen) {
     return (
       <button 
         onClick={() => setIsOpen(true)}
         style={{
           position: 'fixed', bottom: '2rem', right: '2rem', width: '60px', height: '60px', borderRadius: '50%', background: 'var(--brand)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, transition: 'transform 0.2s'
         }}
         className="chat-toggle"
       >
          <MessageSquare size={24} />
          <div style={{ position: 'absolute', top: '0', right: '0', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)', border: '2px solid white' }} />
       </button>
     )
  }

  return (
    <div 
      style={{
        position: 'fixed', bottom: '2rem', right: '2rem', width: '380px', height: '600px', background: 'var(--surface)', borderRadius: '24px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 1000, overflow: 'hidden', animation: 'slideUp 0.3s ease-out'
      }}
    >
       {/* Chat Header */}
       <div style={{ padding: '1.25rem', background: 'var(--bg-sub)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <div style={{ background: 'var(--brand)', color: 'white', padding: '0.4rem', borderRadius: '8px' }}><Hash size={18} /></div>
             <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Team Dispatch</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700 }}>VERIFIED CHANNEL • {onlineUsers.size} ONLINE</span>
             </div>
          </div>
          <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-sub)' }}><X size={20} /></button>
       </div>

       {/* Messages List */}
       <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-sub)', fontSize: '0.8rem', paddingTop: '2rem' }}>Syncing history...</div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-sub)', fontSize: '0.8rem', paddingTop: '2rem' }}>No telemetry recorded yet. Start the synchronization.</div>
          ) : (
            messages.map((m, idx) => {
              const isOwn = m.user_id === user.id
              const showAvatar = idx === 0 || messages[idx-1].user_id !== m.user_id
              
              return (
                <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                   {showAvatar && (
                     <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                        {isOwn ? 'You' : m.profiles?.full_name || 'Anonymous Peer'}
                     </span>
                   )}
                   <div style={{
                     padding: '0.75rem 1rem', borderRadius: '14px', maxWidth: '85%', fontSize: '0.9rem', lineHeight: 1.5,
                     background: isOwn ? 'var(--brand)' : 'var(--bg-sub)',
                     color: isOwn ? 'white' : 'var(--text-main)',
                     border: isOwn ? 'none' : '1px solid var(--border)',
                     borderTopRightRadius: isOwn ? '2px' : '14px',
                     borderTopLeftRadius: isOwn ? '14px' : '2px',
                   }}>
                      {m.content}
                   </div>
                   <span style={{ fontSize: '0.6rem', color: 'var(--text-sub)', marginTop: '0.2rem', opacity: 0.7 }}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
       </div>

       {/* Message Input */}
       <form onSubmit={handleSendMessage} style={{ padding: '1.25rem', borderTop: '1px solid var(--border)', background: 'var(--bg-sub)' }}>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0.4rem 0.4rem 0.4rem 1rem', alignItems: 'center' }}>
             <input 
               type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
               placeholder="Enter encrypted message..."
               style={{ flex: 1, background: 'none', border: 'none', outline: 'none', padding: '0.5rem 0', fontSize: '0.9rem', color: 'var(--text-main)' }}
             />
             <button type="submit" style={{ background: 'var(--brand)', color: 'white', border: 'none', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Send size={16} />
             </button>
          </div>
       </form>

       <style jsx>{`
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .chat-toggle:hover { transform: scale(1.1); }
       `}</style>
    </div>
  )
}
