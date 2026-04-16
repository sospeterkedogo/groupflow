'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { 
  Send, MessageSquare, X, Paperclip, CheckCheck, Clock,
  Trash2, Shield
} from 'lucide-react'
import { usePresence } from './PresenceProvider'
import { logActivity } from '@/utils/logging'

type ChatPayload = {
  type: 'image' | 'file'
  url: string
  name?: string
}

interface ChatMessage {
  id: string
  group_id: string
  user_id: string
  content: string
  created_at: string
  is_deleted: boolean
  profiles?: {
    full_name: string
    avatar_url: string
    role: string
  }
  payload?: {
    type: 'image' | 'file'
    url: string
    name?: string
  }
  pending?: boolean // For Optimistic UI
}

export default function TeamChat({ groupId, user }: { groupId: string, user: any }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createBrowserSupabaseClient()
  const { onlineUsers, typingUsers, setTypingStatus } = usePresence()

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  // Request Notification Permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }
  }, [])

  // Real-time Subscription
  useEffect(() => {
    if (isOpen || !isOpen) { // Monitor even if closed for notifications
      const channel = supabase
        .channel(`chat:${groupId}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'messages',
          filter: `group_id=eq.${groupId}`
        }, (payload) => {
          if (payload.eventType === 'INSERT') {
            const incoming = payload.new as ChatMessage
            
            // Notification logic
            if (incoming.user_id !== user.id && (!isOpen || document.hidden)) {
               if ('Notification' in window && Notification.permission === 'granted') {
                 new Notification('New Team Message', {
                   body: incoming.content || 'Sent an attachment',
                   icon: '/logo.png'
                 })
               }
            }

            setMessages((prev) => {
               if (prev.find(m => m.id === incoming.id)) return prev
               return [...prev.filter(m => !m.pending || m.content !== incoming.content), incoming]
                  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                  .slice(-50) // Maintain 50 message limit
            })
            setTimeout(() => scrollToBottom('smooth'), 100)
          } else if (payload.eventType === 'UPDATE') {
             setMessages(prev => prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m))
          }
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [groupId, isOpen, user.id])

  async function fetchMessages() {
    setLoading(true)
    const { data } = await supabase
      .from('messages')
      .select('*, profiles(full_name, avatar_url, role)')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })
      .limit(50) // Strict 50 message limit
    
    if (data) setMessages(data as ChatMessage[])
    setLoading(false)
    setTimeout(() => scrollToBottom('auto'), 50)
  }

  useEffect(() => {
    if (isOpen) {
      fetchMessages()
    }
  }, [isOpen, groupId])

  useEffect(() => {
    if (messages.length > 0 && isOpen) scrollToBottom('smooth')
  }, [messages, isOpen])

  const handleTyping = (text: string) => {
    setNewMessage(text)
    setTypingStatus(true)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
       setTypingStatus(false)
    }, 2000)
  }

  const handleSendMessage = async (e: React.FormEvent | null, contentOverride?: string, payload?: ChatPayload) => {
    e?.preventDefault()
    const content = contentOverride || newMessage.trim()
    if (!content && !payload) return

    setTypingStatus(false)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    const tempId = Math.random().toString(36).substring(7)
    const optimisticMsg: ChatMessage = {
       id: tempId,
       group_id: groupId,
       user_id: user.id,
       content,
       is_deleted: false,
       created_at: new Date().toISOString(),
       profiles: { full_name: user.full_name, avatar_url: user.avatar_url, role: user.role },
       payload,
       pending: true
    }

    setMessages(prev => [...prev, optimisticMsg].slice(-50))
    setNewMessage('')
    scrollToBottom('smooth')

    const { data, error } = await supabase
      .from('messages')
      .insert({
        group_id: groupId,
        user_id: user.id,
        content,
        payload
      })
      .select()
      .single()

    if (error) {
       setMessages(prev => prev.filter(m => m.id !== tempId))
    } else if (data) {
       setMessages(prev => prev.map(m => m.id === tempId ? { ...data, profiles: optimisticMsg.profiles } : m))
       
       // Verifiable Logging
       logActivity(
         user.id, 
         groupId, 
         'message_sent', 
         `Sent a ${payload?.type || 'text'} message`,
         { message_id: data.id }
       )
    }
  }

  const handleDeleteMessage = async (msgId: string) => {
     if (!confirm('Are you sure you want to delete this message for everyone?')) return
     
     const { error } = await supabase
       .from('messages')
       .update({ is_deleted: true, content: 'This message was deleted' })
       .eq('id', msgId)
     
     if (error) console.error("Deletion failed", error)
     else {
       // Verifiable Logging
       logActivity(
         user.id, 
         groupId, 
         'message_deleted', 
         'Deleted a message',
         { message_id: msgId }
       )
     }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0]
     if (!file) return
     
     setUploading(true)
     const fileName = `${groupId}/chat-${Date.now()}-${file.name}`
     const { error: uploadError } = await supabase.storage.from('groupflow_assets').upload(fileName, file)
     
     if (uploadError) {
        setUploading(false)
        return
     }

     const { data: publicUrlData } = supabase.storage.from('groupflow_assets').getPublicUrl(fileName)
     await handleSendMessage(
        null,
        '',
        {
          type: file.type.startsWith('image/') ? 'image' : 'file',
          url: publicUrlData.publicUrl,
          name: file.name
        }
     )
     setUploading(false)
  }

  const groupedMessages = useMemo(() => {
     const groups: { date: string, msgs: ChatMessage[] }[] = []
     messages.forEach(m => {
        const date = new Date(m.created_at).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
        const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
        const label = date === today ? 'Today' : date
        
        const lastGroup = groups[groups.length - 1]
        if (lastGroup && lastGroup.date === label) {
           lastGroup.msgs.push(m)
        } else {
           groups.push({ date: label, msgs: [m] })
        }
     })
     return groups
  }, [messages])

  const othersTyping = Array.from(typingUsers).filter(id => id !== user.id)

  if (!isOpen) {
     return (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed', 
            bottom: 'calc(var(--h-mobile-bottom) + 1.25rem + env(safe-area-inset-bottom))', 
            right: '1.25rem', 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            background: 'var(--brand)', 
            color: 'white', 
            border: 'none', 
            cursor: 'pointer', 
            boxShadow: 'var(--shadow-xl)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 1000, 
            transition: 'all 0.3s'
          }}
          className="chat-toggle"
        >
          <MessageSquare size={24} />
          <div style={{ position: 'absolute', top: '2px', right: '2px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)', border: '2px solid white' }} />
       </button>
     )
  }

  return (
    <div 
      style={{
        position: 'fixed', 
        bottom: 'calc(var(--h-mobile-bottom) + 1rem + env(safe-area-inset-bottom))', 
        right: 'min(2rem, 0.5rem)', 
        width: 'min(400px, calc(100vw - 1rem))', 
        height: 'min(650px, calc(100vh - (var(--h-mobile-bottom) + 5rem)))', 
        background: 'var(--surface)', 
        borderRadius: '24px', 
        boxShadow: '0 24px 48px rgba(0,0,0,0.2)', 
        border: '1px solid var(--border)', 
        display: 'flex', 
        flexDirection: 'column', 
        zIndex: 1000, 
        overflow: 'hidden', 
        animation: 'whatsappIn 0.4s ease-out'
      }}
      className="responsive-chat"
    >
       {/* Chat Header */}
       <div style={{ padding: '0.75rem 1rem', background: 'var(--brand)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
             <MessageSquare size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
             <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Team Chat</h3>
             <div style={{ fontSize: '0.68rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {othersTyping.length > 0 ? (
                  <span style={{ fontStyle: 'italic', fontWeight: 600 }}>typing...</span>
                ) : (
                  <>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} />
                    {onlineUsers.size} online
                  </>
                )}
             </div>
          </div>
          <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', color: 'white', borderRadius: '8px', padding: '0.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}><X size={18} /></button>
       </div>

       {/* Messages */}
       <div className="chat-viewport" style={{ 
          flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
          background: 'var(--bg-sub)',
       }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem' }}>
              {[85, 60, 75, 50, 90].map((w, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: i % 2 === 0 ? 'flex-end' : 'flex-start' }}>
                  <div style={{ width: `${w}%`, height: '44px', borderRadius: '12px', background: 'var(--border)', animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%' }} />
                </div>
              ))}
            </div>
          ) : (
            <>
              {messages.length === 0 && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--text-sub)', padding: '2rem' }}>
                  <MessageSquare size={36} style={{ opacity: 0.3 }} />
                  <p style={{ textAlign: 'center', fontSize: '0.85rem', margin: 0 }}>No messages yet.<br/>Be the first to say something!</p>
                </div>
              )}
              {groupedMessages.map((group) => (
                <div key={group.date} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                   <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
                      <span style={{ padding: '0.3rem 0.8rem', background: 'var(--surface)', color: 'var(--text-sub)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '0.68rem', fontWeight: 700 }}>{group.date}</span>
                   </div>
                   
                   {group.msgs.map((m) => {
                     const isOwn = m.user_id === user.id
                     const canDelete = isOwn || user.role === 'admin'
                     
                     return (
                       <div key={m.id} style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', marginBottom: '2px' }}>
                          <div 
                            className={`msg-bubble ${isOwn ? 'own' : 'other'} ${m.pending ? 'pending' : ''} ${m.is_deleted ? 'deleted' : ''}`}
                            style={{
                              padding: '0.45rem 0.75rem', borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                              maxWidth: '82%', fontSize: '0.875rem', lineHeight: 1.45,
                              position: 'relative', boxShadow: 'var(--shadow-sm)',
                              background: isOwn ? 'var(--brand)' : 'var(--surface)',
                              color: isOwn ? 'white' : 'var(--text-main)',
                              border: isOwn ? 'none' : '1px solid var(--border)',
                              minWidth: '60px',
                              fontStyle: m.is_deleted ? 'italic' : 'normal',
                              opacity: m.is_deleted ? 0.6 : 1,
                              transition: 'opacity 0.2s',
                            }}
                          >
                             {!isOwn && (
                               <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--brand)', marginBottom: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                 <span>{m.profiles?.full_name || 'Student'}</span>
                                 {m.profiles?.role === 'admin' && <Shield size={10} style={{ marginLeft: '4px', opacity: 0.7 }} />}
                               </div>
                             )}
                             
                             {!m.is_deleted && m.payload?.type === 'image' && (
                               <img src={m.payload.url} style={{ width: '100%', borderRadius: '8px', marginBottom: '0.25rem' }} />
                             )}
                             {!m.is_deleted && m.payload?.type === 'file' && (
                               <a href={m.payload.url} target="_blank" className="file-attachment" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.08)', padding: '0.4rem 0.6rem', borderRadius: '8px', textDecoration: 'none', color: 'inherit', marginBottom: '0.25rem' }}>
                                  <Paperclip size={12} /> <span style={{ fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.payload.name}</span>
                               </a>
                             )}

                             <div style={{ wordBreak: 'break-word' }}>
                                {m.is_deleted ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}><Trash2 size={11} /> Message deleted</div>
                                ) : m.content}
                             </div>
                             
                             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px', marginTop: '3px' }}>
                                <span style={{ fontSize: '0.62rem', opacity: 0.65 }}>
                                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {isOwn && !m.is_deleted && (
                                  <span style={{ display: 'inline-flex', opacity: 0.8 }}>
                                     {m.pending ? <Clock size={10} /> : <CheckCheck size={11} />}
                                  </span>
                                )}
                                {canDelete && !m.is_deleted && !m.pending && (
                                  <button onClick={() => handleDeleteMessage(m.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', opacity: 0, transition: 'opacity 0.2s' }} className="delete-btn">
                                    <Trash2 size={10} />
                                  </button>
                                )}
                             </div>
                          </div>
                       </div>
                     )
                   })}
                </div>
              ))}
              {othersTyping.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '0.25rem 0' }}>
                   <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '0.4rem 0.9rem', borderRadius: '16px', fontSize: '0.8rem', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="typing-dots"><span>•</span><span>•</span><span>•</span></div>
                   </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
       </div>

       {/* Input Bar */}
       <div style={{ padding: '0.6rem 0.75rem', background: 'var(--bg-sub)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ display: 'flex', gap: '0.35rem', color: 'var(--text-sub)' }}>
             <label style={{ cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', padding: '0.3rem', borderRadius: '8px', transition: 'background 0.2s' }} className="icon-btn">
                <Paperclip size={20} />
                <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
             </label>
          </div>
          <form onSubmit={handleSendMessage} style={{ flex: 1 }}>
             <input 
               type="text" value={newMessage} onChange={e => handleTyping(e.target.value)}
               placeholder="Type a message..."
               style={{ 
                 width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px',
                 padding: '0.55rem 1rem', fontSize: '0.875rem', outline: 'none', color: 'var(--text-main)',
                 transition: 'border-color 0.2s'
               }}
             />
          </form>
          <button 
             onClick={(e) => handleSendMessage(e as any)}
             disabled={!newMessage.trim() && !uploading}
             style={{ 
               background: newMessage.trim() ? 'var(--brand)' : 'var(--bg-main)', 
               color: newMessage.trim() ? 'white' : 'var(--text-sub)', 
               border: `1px solid ${newMessage.trim() ? 'transparent' : 'var(--border)'}`,
               borderRadius: '50%', width: '38px', height: '38px', flexShrink: 0,
               display: 'flex', alignItems: 'center', justifyContent: 'center', 
               cursor: newMessage.trim() ? 'pointer' : 'default',
               transition: 'all 0.2s',
             }}
          >
             <Send size={17} />
          </button>
       </div>

       <style jsx>{`
          @keyframes whatsappIn { 
            from { opacity: 0; transform: translateY(40px) scale(0.9); } 
            to { opacity: 1; transform: translateY(0) scale(1); } 
          }
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .msg-bubble.pending { opacity: 0.65; }
          .chat-viewport::-webkit-scrollbar { display: block; width: 4px; }
          .chat-viewport::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
          .chat-viewport { scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
          .typing-dots span { animation: blink 1.4s infinite; opacity: 0; font-size: 1.1rem; margin: 0 0.5px; }
          .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
          .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
          @keyframes blink { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
          .msg-bubble:hover .delete-btn { opacity: 0.7 !important; }
          .icon-btn:hover { background: var(--border); }
          .chat-toggle:hover { transform: scale(1.08) translateY(-2px); box-shadow: 0 12px 24px rgba(0,0,0,0.3); }

          @media (min-width: 769px) {
            .chat-toggle {
              bottom: 2rem !important;
              right: 2rem !important;
            }
            .responsive-chat {
              bottom: 2rem !important;
              right: 2rem !important;
              height: min(650px, calc(100vh - 6rem)) !important;
            }
          }
       `}</style>
    </div>
  )
}
