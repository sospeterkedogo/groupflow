'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { ChevronLeft, Info, MoreVertical, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import ChatRoom from '@/components/ChatRoom'
import { Profile } from '@/types/database'
import { RoomProvider, useOthers } from '@/liveblocks.config'
import { LiveList } from '@liveblocks/client'
import { usePresence } from '@/components/PresenceProvider'
import { formatDistanceToNow } from 'date-fns'

function ChatHeader({ targetStudent, targetId }: { targetStudent: Profile, targetId: string }) {
  const others = useOthers()
  const { onlineUsers } = usePresence()
  const isOnline = onlineUsers.has(targetId)
  const isTyping = others.some((other) => other.presence.isTyping)

  const getStatusText = () => {
    if (isTyping) return <span style={{ color: 'var(--brand)', fontWeight: 800, animation: 'pulse 1.5s infinite' }}>typing...</span>
    if (isOnline) return <span style={{ color: 'var(--success)' }}>Online</span>
    if (targetStudent.last_seen) {
      return `last seen ${formatDistanceToNow(new Date(targetStudent.last_seen), { addSuffix: true })}`
    }
    return 'Offline'
  }

  return (
    <div style={{ 
      padding: '1rem 1.5rem', 
      background: 'var(--surface)', 
      borderBottom: '1px solid var(--border)', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      borderTopLeftRadius: '24px', 
      borderTopRightRadius: '24px' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={() => window.history.back()}
          style={{ background: 'var(--bg-sub)', border: 'none', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer', color: 'var(--text-sub)' }}
        >
          <ChevronLeft size={20} />
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--brand)', overflow: 'hidden', position: 'relative' }}>
            {targetStudent.avatar_url ? (
              <img src={targetStudent.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white', fontWeight: 900 }}>
                {targetStudent.full_name?.[0]}
              </div>
            )}
            {isOnline && (
              <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)', border: '2px solid var(--surface)' }} />
            )}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>{targetStudent.full_name}</h3>
            <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-sub)', fontWeight: 700 }}>{getStatusText()}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Link href={`/dashboard/network/profile/${targetId}`} style={{ background: 'var(--bg-sub)', padding: '0.6rem', borderRadius: '10px', color: 'var(--text-sub)' }}>
          <Info size={20} />
        </Link>
        <button style={{ background: 'var(--bg-sub)', padding: '0.6rem', border: 'none', borderRadius: '10px', color: 'var(--text-sub)', cursor: 'pointer' }}>
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const params = useParams()
  const targetId = params.id as string
  const supabase = createBrowserSupabaseClient()

  const [targetStudent, setTargetStudent] = useState<Profile | null>(null)
  const [me, setMe] = useState<{ id: string, name: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setMe({ id: user.id, name: user.user_metadata?.full_name || 'Scholar' })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetId)
      .single()
    
    if (profile) setTargetStudent(profile as Profile)
    setLoading(false)
  }, [supabase, targetId])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (!targetStudent || !me) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ fontWeight: 800 }}>Conversation Unavailable</h2>
        <Link href="/dashboard/network" className="btn btn-secondary">Back to Network</Link>
      </div>
    )
  }

  const roomId = [me.id, targetStudent.id].sort().join('_')

  return (
    <RoomProvider
      id={roomId}
      initialPresence={{ draggingTaskId: null, userName: me.name, isTyping: false }}
      initialStorage={{ tasks: new LiveList([]), messages: new LiveList([]) }}
    >
      <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.5s ease-out' }}>
        <ChatHeader targetStudent={targetStudent} targetId={targetId} />
        
        <div style={{ flex: 1, minHeight: 0 }}>
          <ChatRoom roomId={roomId} currentUser={me} />
        </div>

        <style jsx>{`
          @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </RoomProvider>
  )
}
