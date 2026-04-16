'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { ChevronLeft, Info, MoreVertical, MessageSquare, Video } from 'lucide-react'
import Link from 'next/link'
import ChatRoom from '@/components/ChatRoom'
import { Profile } from '@/types/database'

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const targetId = params.id as string
  const supabase = createBrowserSupabaseClient()

  const [targetStudent, setTargetStudent] = useState<Profile | null>(null)
  const [me, setMe] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [targetId])

  const fetchData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    setMe(user)

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetId)
      .single()
    
    if (profile) setTargetStudent(profile as any)
    setLoading(false)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="spinner" style={{ border: '3px solid var(--border)', borderTop: '3px solid var(--brand)', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (!targetStudent) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ fontWeight: 800 }}>Conversation Expired</h2>
        <p style={{ color: 'var(--text-sub)' }}>We couldn't establish a link with this researcher.</p>
        <Link href="/dashboard/network" className="btn btn-secondary" style={{ width: 'auto', marginTop: '1rem' }}>Back to Network</Link>
      </div>
    )
  }

  const sortedRoomId = [me?.id, targetStudent.id].sort().join('_')

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Dynamic Chat Header */}
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
            onClick={() => router.back()}
            style={{ background: 'var(--bg-sub)', border: 'none', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer', color: 'var(--text-sub)' }}
          >
            <ChevronLeft size={20} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--brand)', overflow: 'hidden' }}>
              {targetStudent.avatar_url ? (
                <img src={targetStudent.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white', fontWeight: 900 }}>
                  {targetStudent.full_name?.[0]}
                </div>
              )}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>{targetStudent.full_name}</h3>
              <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--success)', fontWeight: 800 }}>SECURE LABORATORY LINE</p>
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

      {/* Main Chat Area */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ChatRoom 
          roomId={sortedRoomId} 
          currentUser={{ id: me?.id || '', name: me?.user_metadata?.full_name || 'Me' }} 
        />
      </div>

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
