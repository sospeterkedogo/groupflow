'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  Send, User, MessageSquare, X, ChevronRight, Hash, 
  Paperclip, Image as ImageIcon, Smile, Check, CheckCheck, Clock,
  Trash2, Shield
} from 'lucide-react'
import { usePresence } from './PresenceProvider'
import { logActivity } from '@/utils/logging'

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
  const supabase = createClient()
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

  useEffect(() => {
    if (isOpen) {
      fetchMessages()
    }
  }, [isOpen, groupId])

  useEffect(() => {
    if (messages.length > 0 && isOpen) scrollToBottom('smooth')
  }, [messages, isOpen])

  const fetchMessages = async () => {
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

  const handleTyping = (text: string) => {
    setNewMessage(text)
    setTypingStatus(true)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
       setTypingStatus(false)
    }, 2000)
  }

  const handleSendMessage = async (e: React.FormEvent, contentOverride?: string, payload?: any) => {
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
        null as any, 
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
           position: 'fixed', bottom: '2rem', right: '2rem', width: '60px', height: '60px', borderRadius: '50%', background: 'var(--brand)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, transition: 'all 0.3s'
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
        bottom: 'min(2rem, 1rem)', 
        right: 'min(2rem, 0.5rem)', 
        width: 'min(400px, calc(100vw - 1rem))', 
        height: 'min(650px, calc(100vh - 4rem))', 
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
       {/* WhatsApp Header */}
       <div style={{ padding: '0.75rem 1rem', background: '#075e54', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
             <User size={24} />
          </div>
          <div style={{ flex: 1 }}>
             <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Team Dispatch</h3>
             <div style={{ fontSize: '0.7rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {othersTyping.length > 0 ? (
                  <span style={{ fontStyle: 'italic', fontWeight: 600 }}>typing...</span>
                ) : (
                  <>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} />
                    {onlineUsers.size} active
                  </>
                )}
             </div>
          </div>
          <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', opacity: 0.8 }}><X size={20} /></button>
       </div>

       {/* Messages List with Wallpaper */}
       <div className="chat-viewport" style={{ 
          flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
          backgroundColor: '#e5ddd5', backgroundImage: `url('https://w0.peakpx.com/wallpaper/580/630/wallpaper-whatsapp-plain-background.jpg')`, backgroundSize: 'cover', backgroundBlendMode: 'overlay'
       }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#667781', fontSize: '0.75rem', padding: '1rem', background: 'rgba(255,255,255,0.8)', borderRadius: '8px', width: 'fit-content', margin: '1rem auto' }}>Loading history...</div>
          ) : (
            <>
              {groupedMessages.map((group) => (
                <div key={group.date} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                   <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                      <span style={{ padding: '0.4rem 0.8rem', background: '#d1f4ff', color: '#111b21', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' }}>{group.date}</span>
                   </div>
                   
                   {group.msgs.map((m) => {
                     const isOwn = m.user_id === user.id
                     const canDelete = isOwn || user.role === 'admin'
                     
                     return (
                       <div key={m.id} style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', marginBottom: '4px' }}>
                          <div 
                            className={`msg-bubble ${isOwn ? 'own' : 'other'} ${m.pending ? 'pending' : ''} ${m.is_deleted ? 'deleted' : ''}`}
                            style={{
                              padding: '0.5rem 0.75rem', borderRadius: '8px', maxWidth: '85%', fontSize: '0.9rem', lineHeight: 1.4,
                              position: 'relative', boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                              background: isOwn ? '#dcf8c6' : '#ffffff',
                              color: m.is_deleted ? '#667781' : '#111b21',
                              minWidth: '60px',
                              fontStyle: m.is_deleted ? 'italic' : 'normal'
                            }}
                          >
                             {!isOwn && (
                               <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#27ae60', marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
                                 <span>{m.profiles?.full_name || 'Student'}</span>
                                 {m.profiles?.role === 'admin' && <Shield size={10} style={{ marginLeft: '4px' }} />}
                               </div>
                             )}
                             
                             {!m.is_deleted && m.payload?.type === 'image' && (
                               <img src={m.payload.url} style={{ width: '100%', borderRadius: '4px', marginTop: '0.25rem' }} />
                             )}
                             {!m.is_deleted && m.payload?.type === 'file' && (
                               <a href={m.payload.url} target="_blank" className="file-attachment" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.05)', padding: '0.5rem', borderRadius: '4px', textDecoration: 'none', color: '#111b21' }}>
                                  <Paperclip size={14} /> <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.payload.name}</span>
                               </a>
                             )}

                             <div style={{ wordBreak: 'break-word', marginTop: m.payload ? '0.5rem' : '0' }}>
                                {m.is_deleted ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Trash2 size={12} /> This message was deleted</div>
                                ) : m.content}
                             </div>
                             
                             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', marginTop: '4px' }}>
                                <span style={{ fontSize: '0.65rem', color: '#667781' }}>
                                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {isOwn && !m.is_deleted && (
                                  <span style={{ display: 'inline-flex' }}>
                                     {m.pending ? <Clock size={10} color="#667781" /> : <CheckCheck size={12} color="#34b7f1" />}
                                  </span>
                                )}
                                {canDelete && !m.is_deleted && !m.pending && (
                                  <button onClick={() => handleDeleteMessage(m.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#667781', opacity: 0, transition: 'opacity 0.2s' }} className="delete-btn">
                                    <Trash2 size={10} />
                                  </button>
                                )}
                             </div>
                             
                             <div style={{
                               position: 'absolute', top: 0,
                               [isOwn ? 'right' : 'left']: '-8px',
                               width: 0, height: 0,
                               borderTop: `10px solid ${isOwn ? '#dcf8c6' : '#ffffff'}`,
                               borderLeft: isOwn ? '12px solid transparent' : 'none',
                               borderRight: isOwn ? 'none' : '12px solid transparent',
                               zIndex: 1
                             }} />
                          </div>
                       </div>
                     )
                   })}
                </div>
              ))}
              {othersTyping.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '0.5rem 0' }}>
                   <div style={{ background: 'white', padding: '0.4rem 0.8rem', borderRadius: '12px', fontSize: '0.8rem', color: '#667781', boxShadow: '0 1px 1px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="typing-dots"><span>.</span><span>.</span><span>.</span></div>
                      Someone is typing
                   </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
       </div>

       {/* WhatsApp Input Bar */}
       <div style={{ padding: '0.5rem 0.75rem', background: '#f0f2f5', borderTop: '1px solid #d1d7db', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', color: '#54656f' }}>
             <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><Smile size={24} /></button>
             <label style={{ cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                <Paperclip size={24} />
                <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
             </label>
          </div>
          <form onSubmit={handleSendMessage} style={{ flex: 1, position: 'relative' }}>
             <input 
               type="text" value={newMessage} onChange={e => handleTyping(e.target.value)}
               placeholder="Type a message..."
               style={{ 
                 width: '100%', background: 'white', border: 'none', borderRadius: '8px', padding: '0.6rem 1rem', fontSize: '0.95rem', outline: 'none', color: '#111b21',
                 boxShadow: '0 1px 1px rgba(0,0,0,0.1)'
               }}
             />
          </form>
          <button 
             onClick={(e) => handleSendMessage(e as any)}
             style={{ 
               background: newMessage.trim() ? '#00a884' : 'none', 
               color: newMessage.trim() ? 'white' : '#54656f', 
               border: 'none', borderRadius: '50%', width: '40px', height: '40px', 
               display: 'flex', alignItems: 'center', justifyContent: 'center', 
               cursor: 'pointer', transition: 'all 0.2s'
             }}
          >
             <Send size={20} fill={newMessage.trim() ? 'currentColor' : 'none'} />
          </button>
       </div>

       <style jsx>{`
          @keyframes whatsappIn { 
            from { opacity: 0; transform: translateY(40px) scale(0.9); } 
            to { opacity: 1; transform: translateY(0) scale(1); } 
          }
          .msg-bubble.pending { opacity: 0.7; }
          .file-attachment:hover { background: rgba(0,0,0,0.1) !important; }
          .chat-viewport::-webkit-scrollbar { width: 6px; }
          .chat-viewport::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 10px; }
          .typing-dots span { animation: blink 1.4s infinite; opacity: 0; margin: 0 1px; }
          .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
          .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
          @keyframes blink { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
          .msg-bubble:hover .delete-btn { opacity: 1 !important; }
       `}</style>
    </div>
  )
}
