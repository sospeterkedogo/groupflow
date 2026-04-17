'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { 
  X, UserCircle, ShieldCheck, Mail, Target, Award, Hash, 
  GraduationCap, Calendar, UserPlus, Check, MessageSquare, 
  Video, Info, Clock, ChevronLeft, ExternalLink, Activity
} from 'lucide-react'
import Link from 'next/link'
import { Profile } from '@/types/database'
import ChatRoom from '@/components/ChatRoom'
import { useSmartLoading } from '@/components/GlobalLoadingProvider'

export default function StudentProfilePage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string
  const supabase = createBrowserSupabaseClient()

  const [member, setMember] = useState<Profile | null>(null)
  const [me, setMe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'pending' | 'connected'>('idle')
  const [activeTab, setActiveTab] = useState<'info' | 'accomplishments'>('info')
  const { withLoading, showConfirmation } = useSmartLoading()

  const formatRelativeTime = (date: string | null) => {
    if (!date) return 'Unknown'
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return new Date(date).toLocaleDateString()
  }

  useEffect(() => {
    fetchProfileData()
  }, [studentId])

  const fetchProfileData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    setMe(user)

    const { data: profile } = await supabase
      .from('profiles')
      .select('*, groups(*)')
      .eq('id', studentId)
      .single()

    if (profile) {
      setMember(profile as any)
      if (user) {
        const { data: conn } = await supabase
          .from('user_connections')
          .select('status')
          .eq('user_id', user.id)
          .eq('target_id', studentId)
          .single()

        if (conn?.status === 'pending') {
          setConnectionStatus('pending')
        } else if (conn && (conn.status === 'connected' || conn.status === 'accepted')) {
          setConnectionStatus('connected')
        } else {
          setConnectionStatus('idle')
        }
      }
    }

    setLoading(false)
  }

  const handleConnect = async () => {
    if (!me || !member || connectionStatus !== 'idle') return

    await withLoading(async () => {
      // 1. Create a pending connection row
      const { error: connError } = await supabase
        .from('user_connections')
        .upsert({ 
          user_id: me.id, 
          target_id: member.id, 
          status: 'pending' 
        }, { onConflict: 'user_id,target_id' })

      if (connError) {
        console.error('Connection Request Failure:', connError)
        throw connError
      }

      // 2. Insert notification
      await supabase.from('notifications').insert({
        user_id: member.id,
        type: 'connection_request',
        title: 'New Connection Request',
        message: `${me.user_metadata?.full_name || me.email} wants to connect with you.`,
        metadata: { sender_id: me.id }
      })

      setConnectionStatus('pending')
      
      showConfirmation({
        title: 'Request Transmitted',
        message: `Your connection request has been securely sent to ${member.full_name?.split(' ')[0]}. They will be notified immediately.`,
        type: 'success',
        onConfirm: () => {}
      })
    }, 'Authenticating Request...')
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="spinner" style={{ border: '3px solid var(--border)', borderTop: '3px solid var(--brand)', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (!member) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ fontWeight: 800 }}>Student Not Found</h2>
        <Link href="/dashboard/network" className="btn btn-secondary" style={{ width: 'auto', marginTop: '1rem' }}>Back to Network</Link>
      </div>
    )
  }

  const sortedRoomId = [me?.id, member.id].sort().join('_')

  return (
    <div style={{ maxWidth: '100%', width: '1000px', margin: '0 auto', padding: '0 var(--p-safe) 5rem', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Simplified Mobile Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', marginTop: '1rem' }}>
        <button 
          onClick={() => router.back()}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '0.7rem', cursor: 'pointer', color: 'var(--text-main)', boxShadow: 'var(--shadow-sm)' }}
        >
          <ChevronLeft size={22} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 950, margin: 0, letterSpacing: '-0.03em' }}>
            {member.full_name?.split(' ')[0]}'s Profile
          </h1>
        </div>
      </div>

      <div className="profile-main-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 340px) 1fr', gap: '2rem' }}>
        
        {/* Profile Essence Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'var(--surface)', borderRadius: '32px', border: '1px solid var(--border)', padding: '2rem', textAlign: 'center', boxShadow: 'var(--shadow-lg)', position: 'relative', overflow: 'hidden' }}>
            {/* Subtle Gradient Background */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(180deg, rgba(var(--brand-rgb), 0.05) 0%, transparent 100%)' }} />
            
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0.5rem auto 1.5rem' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '42px', background: 'var(--bg-sub)', border: '4px solid var(--surface)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {member.avatar_url ? (
                  <img src={member.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <UserCircle size={80} color="var(--text-sub)" />
                )}
              </div>
              <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '22px', height: '22px', borderRadius: '50%', background: 'var(--success)', border: '4px solid var(--surface)', boxShadow: 'var(--shadow-sm)' }} />
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 950, marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>{member.full_name}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--brand)' }}>
                 <ShieldCheck size={16} />
                 <span style={{ fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{member.rank || 'Active Student'}</span>
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-sub)' }}>
                Member since {new Date(member.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 800 }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: connectionStatus === 'connected' ? 'var(--success)' : 'var(--text-sub)', boxShadow: connectionStatus === 'connected' ? '0 0 8px var(--success)' : 'none' }} />
                <span style={{ color: connectionStatus === 'connected' ? 'var(--success)' : 'var(--text-sub)' }}>
                  {connectionStatus === 'connected' ? 'Connection established' : `Last seen ${formatRelativeTime(member.last_seen || null)}`}
                </span>
              </div>
            </div>

            <button 
              onClick={handleConnect}
              disabled={connectionStatus !== 'idle'}
              style={{ 
                width: '100%', padding: '1.1rem', borderRadius: '18px', border: 'none', 
                background: connectionStatus === 'idle' ? 'var(--brand)' : 'var(--bg-sub)', 
                color: connectionStatus === 'idle' ? 'white' : 'var(--text-sub)',
                fontWeight: 900, fontSize: '1rem', cursor: connectionStatus === 'idle' ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                boxShadow: connectionStatus === 'idle' ? '0 10px 25px rgba(var(--brand-rgb), 0.25)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)'
              }}
              className="action-button-main"
            >
              {connectionStatus === 'connected' ? <Check size={20} /> : connectionStatus === 'pending' ? <Clock size={20} /> : <UserPlus size={20} />}
              {connectionStatus === 'connected' ? 'Connection Live' : connectionStatus === 'pending' ? 'Awaiting approval' : 'Add to Network'}
            </button>
          </div>

          {/* Refactored 3-Tile Action Matrix */}
          <div className="action-matrix-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
             {[
               { id: 'info', icon: Target, label: 'Stats', color: 'var(--brand)' },
               { id: 'chat', icon: MessageSquare, label: 'Message', color: 'var(--success)', disabled: connectionStatus !== 'connected', nav: true },
               { id: 'accomplishments', icon: Award, label: 'Badges', color: '#f59e0b' }
             ].map((item) => (
               <button
                 key={item.id}
                 onClick={async () => {
                   if (item.disabled) return;
                   if (item.id === 'chat') {
                     await withLoading(async () => {
                        await new Promise(r => setTimeout(r, 800));
                        router.push(`/dashboard/network/chat/${studentId}`);
                     }, 'Connecting to Secure Line...');
                   } else {
                     setActiveTab(item.id as any);
                   }
                 }}
                 style={{ 
                   borderRadius: '20px', border: activeTab === item.id ? `2px solid ${item.color}` : '1px solid var(--border)',
                   background: activeTab === item.id ? 'var(--surface)' : 'var(--surface)',
                   color: activeTab === item.id ? item.color : item.disabled ? 'var(--text-sub)' : 'var(--text-main)',
                   display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                   cursor: item.disabled ? 'not-allowed' : 'pointer',
                   fontWeight: 900, fontSize: '0.75rem', opacity: item.disabled ? 0.4 : 1,
                   transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                   padding: '1rem 0',
                   boxShadow: activeTab === item.id ? `0 8px 20px -4px ${item.color}33` : 'var(--shadow-sm)'
                 }}
                 className="matrix-btn"
               >
                 <div style={{ padding: '0.6rem', borderRadius: '12px', background: activeTab === item.id ? `${item.color}15` : 'var(--bg-sub)', color: item.color }}>
                    <item.icon size={18} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                 </div>
                 {item.label}
               </button>
             ))}
          </div>
        </div>

        {/* Dynamic Detail Content */}
        <div style={{ minWidth: 0 }}>
          <div className="detail-panel" style={{ background: 'var(--surface)', borderRadius: '36px', border: '1px solid var(--border)', padding: '2.5rem', boxShadow: 'var(--shadow-xl)', minHeight: '100%' }}>
             {activeTab === 'info' && (
                <div style={{ animation: 'slideUp 0.4s ease-out' }}>
                   <div style={{ marginBottom: '2.5rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 950, letterSpacing: '-0.02em', marginBottom: '1rem' }}>Student Overview</h3>
                      <div style={{ padding: '1.25rem', background: 'var(--bg-sub)', borderRadius: '22px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                         <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <GraduationCap size={20} />
                         </div>
                         <div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Current Track</div>
                            <div style={{ fontSize: '1rem', fontWeight: 850 }}>{member.course_name || 'Independent Study'}</div>
                         </div>
                      </div>
                   </div>

                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2.5rem' }}>
                      <div style={{ background: 'rgba(var(--brand-rgb), 0.03)', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
                         <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Points</div>
                         <div style={{ fontSize: '2.25rem', fontWeight: 950, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>{member.total_score}</div>
                      </div>
                      <div style={{ background: 'rgba(var(--brand-rgb), 0.03)', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
                         <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Grad Class</div>
                         <div style={{ fontSize: '1.1rem', fontWeight: 900, marginTop: '0.5rem' }}>Class of {member.completion_year}</div>
                      </div>
                   </div>

                   <div style={{ marginBottom: '2rem' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-sub)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>About {member.full_name?.split(' ')[0]}</h4>
                      <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--text-main)', opacity: 0.85, whiteSpace: 'pre-wrap' }}>
                        {member.biography || `An active scholar in the GroupFlow network, specializing in ${member.course_name || 'their academic field'} and contributing to collaborative research initiatives.`}
                      </p>
                   </div>

                   <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-sub)' }}>
                         <ShieldCheck size={18} />
                         <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Contact details are private</span>
                      </div>
                   </div>
                </div>
             )}

             {activeTab === 'accomplishments' && (
                <div style={{ animation: 'slideUp 0.4s ease-out' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 950, letterSpacing: '-0.02em', margin: 0 }}>Student Badges</h3>
                      <span style={{ fontSize: '0.7rem', fontWeight: 900, background: 'var(--bg-sub)', padding: '0.4rem 0.8rem', borderRadius: '10px', color: 'var(--text-sub)' }}>
                         {member.badges_count || 0} TOTAL
                      </span>
                   </div>

                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                      {member.badges_count && member.badges_count > 0 ? (
                        [...Array(member.badges_count)].map((_, i) => (
                           <div key={i} style={{ background: 'var(--bg-sub)', padding: '1.5rem', borderRadius: '28px', border: '1px solid var(--border)', textAlign: 'center' }}>
                              <div style={{ width: '54px', height: '54px', background: 'var(--surface)', borderRadius: '18px', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', boxShadow: 'var(--shadow-sm)' }}>
                                 <Award size={28} />
                              </div>
                              <div style={{ fontWeight: 900, fontSize: '0.85rem' }}>Verified</div>
                           </div>
                        ))
                      ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-sub)', borderRadius: '24px', opacity: 0.5 }}>
                           <Award size={48} style={{ marginBottom: '1rem' }} />
                           <p style={{ fontWeight: 700 }}>No badges earned yet.</p>
                        </div>
                      )}
                   </div>
                </div>
             )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .matrix-btn:active { transform: scale(0.95); }
        .hover-link:hover { opacity: 0.7; transform: translateX(4px); transition: all 0.2s; }
        @media (max-width: 900px) {
          .profile-main-layout { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .detail-panel { padding: 1.5rem !important; border-radius: 28px !important; }
          .stat-plate { padding: 1rem !important; }
        }
      `}</style>
    </div>
  )
}
