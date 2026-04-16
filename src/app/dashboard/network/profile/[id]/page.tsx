'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { 
  X, UserCircle, ShieldCheck, Mail, Target, Award, Hash, 
  GraduationCap, Calendar, UserPlus, Check, MessageSquare, 
  Video, Info, ChevronLeft, ExternalLink, Activity
} from 'lucide-react'
import Link from 'next/link'
import { Profile } from '@/types/database'
import ChatRoom from '@/components/ChatRoom'

export default function StudentProfilePage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string
  const supabase = createBrowserSupabaseClient()

  const [member, setMember] = useState<Profile | null>(null)
  const [me, setMe] = useState<any>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'chat' | 'video' | 'accomplishments'>('info')

  useEffect(() => {
    fetchProfileData()
  }, [studentId])

  const fetchProfileData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    setMe(user)

    // Fetch student profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, groups(*)')
      .eq('id', studentId)
      .single()

    if (profile) {
      setMember(profile as any)
      
      // Fetch connection status
      if (user) {
        const { data: conn } = await supabase
          .from('user_connections')
          .select('status')
          .eq('user_id', user.id)
          .eq('target_id', studentId)
          .single()
        
        if (conn && (conn.status === 'connected' || conn.status === 'accepted')) {
          setIsConnected(true)
        }
      }
    }
    setLoading(false)
  }

  const handleConnect = async () => {
    if (!me || !member) return
    setActionLoading(true)

    // 1. Create a pending connection
    const { error: connError } = await supabase
      .from('user_connections')
      .upsert({ 
        user_id: me.id, 
        target_id: member.id,
        status: 'pending'
      })

    if (connError) {
      console.error('Connection error:', connError)
      setActionLoading(false)
      return
    }

    // 2. Insert notification
    await supabase.from('notifications').insert({
      user_id: member.id,
      type: 'connection_request',
      title: 'New Connection Request',
      message: `${me.user_metadata?.full_name || me.email} wants to connect.`,
      metadata: { sender_id: me.id }
    })

    setIsConnected(true)
    setActionLoading(false)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-sub)' }}>
        <div className="spinner" style={{ border: '3px solid var(--border)', borderTop: '3px solid var(--brand)', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (!member) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ fontWeight: 800 }}>Student Not Found</h2>
        <p style={{ color: 'var(--text-sub)' }}>This researcher may have restricted their profile visibility.</p>
        <Link href="/dashboard/network" className="btn btn-secondary" style={{ width: 'auto', marginTop: '1rem' }}>Back to Network</Link>
      </div>
    )
  }

  const sortedRoomId = [me?.id, member.id].sort().join('_')

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '5rem', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Top Header Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => router.back()}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0.6rem', cursor: 'pointer', color: 'var(--text-main)', boxShadow: 'var(--shadow-sm)' }}
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>Researcher Profile</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)', margin: 0, fontWeight: 700 }}>STUDENT NETWORK ID: {member.id.substring(0,8)}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem' }} className="profile-page-grid">
        
        {/* Left Column: Identity & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Identity Card */}
          <div style={{ background: 'var(--surface)', borderRadius: '28px', border: '1px solid var(--border)', padding: '2rem', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.5rem' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '40px', background: 'var(--bg-sub)', border: '4px solid var(--surface)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {member.avatar_url ? (
                  <img src={member.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <UserCircle size={80} color="var(--text-sub)" />
                )}
              </div>
              <div style={{ position: 'absolute', bottom: '5px', right: '5px', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--success)', border: '4px solid var(--surface)', boxShadow: 'var(--shadow-sm)' }} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.25rem' }}>{member.full_name}</h2>
            <p style={{ color: 'var(--brand)', fontSize: '0.85rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
               <ShieldCheck size={16} /> {member.rank || 'Senior Participant'}
            </p>

            <button 
              onClick={handleConnect}
              disabled={isConnected || actionLoading}
              style={{ 
                width: '100%', padding: '1rem', borderRadius: '16px', border: 'none', 
                background: isConnected ? 'var(--bg-sub)' : 'var(--brand)', 
                color: isConnected ? 'var(--text-sub)' : 'white',
                fontWeight: 800, fontSize: '0.95rem', cursor: isConnected ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                boxShadow: isConnected ? 'none' : '0 8px 24px rgba(var(--brand-rgb), 0.3)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
              className="hover-lift"
            >
              {isConnected ? <Check size={20} /> : <UserPlus size={20} />}
              {isConnected ? 'Network Connected' : 'Request Connection'}
            </button>
          </div>

          {/* High-End Action Menu */}
          <div style={{ background: 'var(--surface)', borderRadius: '28px', border: '1px solid var(--border)', padding: '0.75rem', boxShadow: 'var(--shadow-sm)' }}>
             {[
               { id: 'info', icon: Info, label: 'Researcher Stats' },
               { id: 'chat', icon: MessageSquare, label: 'Private Laboratory', disabled: !isConnected },
               { id: 'video', icon: Video, label: 'Launch Video Lab', disabled: !isConnected },
               { id: 'accomplishments', icon: Award, label: 'Achievement Wall' }
             ].map((item) => (
               <button
                 key={item.id}
                 onClick={() => !item.disabled && setActiveTab(item.id as any)}
                 style={{ 
                   width: '100%', padding: '1rem 1.25rem', borderRadius: '18px', border: 'none',
                   background: activeTab === item.id ? 'rgba(var(--brand-rgb), 0.08)' : 'transparent',
                   color: activeTab === item.id ? 'var(--brand)' : item.disabled ? 'var(--text-sub)' : 'var(--text-main)',
                   display: 'flex', alignItems: 'center', gap: '1rem', cursor: item.disabled ? 'not-allowed' : 'pointer',
                   fontWeight: 700, fontSize: '0.9rem', opacity: item.disabled ? 0.5 : 1,
                   transition: 'all 0.2s', textAlign: 'left'
                 }}
                 className={!item.disabled ? "hover-card" : ""}
               >
                 <item.icon size={20} style={{ opacity: activeTab === item.id ? 1 : 0.6 }} />
                 {item.label}
                 {!item.disabled && item.id !== activeTab && <ChevronLeft size={16} style={{ marginLeft: 'auto', opacity: 0.3, transform: 'rotate(180deg)' }} />}
               </button>
             ))}
          </div>
        </div>

        {/* Right Column: Dynamic Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Main Content Card */}
          <div className="glass" style={{ background: 'var(--surface)', borderRadius: '32px', border: '1px solid var(--border)', padding: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
             {activeTab === 'info' && (
                <div style={{ animation: 'fadeIn 0.4s' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>Academic Overview</h3>
                      <div style={{ padding: '0.5rem 1rem', background: 'var(--bg-sub)', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-sub)', border: '1px solid var(--border)' }}>
                         {member.course_name || 'Independent Researcher'}
                      </div>
                   </div>

                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                      <div className="stat-plate" style={{ background: 'rgba(var(--brand-rgb), 0.03)', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-sub)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                            <Target size={16} color="var(--brand)" /> Validity Score
                         </div>
                         <div style={{ fontSize: '2rem', fontWeight: 950, color: 'var(--text-main)' }}>{member.total_score}</div>
                      </div>
                      <div className="stat-plate" style={{ background: 'rgba(var(--brand-rgb), 0.03)', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-sub)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                            <Activity size={16} color="var(--brand)" /> Batch Track
                         </div>
                         <div style={{ fontSize: '1.1rem', fontWeight: 850, marginTop: '0.75rem' }}>{member.enrollment_year} — {member.completion_year}</div>
                      </div>
                   </div>

                   <div style={{ marginBottom: '2.5rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-sub)', marginBottom: '1rem', letterSpacing: '0.05em' }}>Researcher Biography</h4>
                      <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--text-main)', opacity: 0.9 }}>
                         A dedicated student specializing in {member.course_name || 'Academic Excellence'}. Focused on collaborative research and high-impact project execution within the GroupFlow ecosystem.
                      </p>
                   </div>

                   <div style={{ padding: '1.5rem', background: 'var(--bg-sub)', borderRadius: '20px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                         <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Institutional Email</div>
                         <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{member.email}</div>
                      </div>
                      <a href={`mailto:${member.email}`} className="btn btn-secondary" style={{ width: 'auto', padding: '0.6rem 1rem' }}>
                         <Mail size={16} /> Send Email
                      </a>
                   </div>
                </div>
             )}

             {activeTab === 'chat' && isConnected && (
                <div style={{ animation: 'fadeIn 0.4s', height: '550px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>Secure Messaging</h3>
                      <Link href={`/dashboard/network/chat/${studentId}`} className="btn btn-secondary btn-sm" style={{ width: 'auto' }}>
                         Full Screen <ExternalLink size={14} style={{ marginLeft: '0.4rem' }} />
                      </Link>
                   </div>
                   <ChatRoom 
                     roomId={sortedRoomId} 
                     currentUser={{ id: me?.id || '', name: me?.user_metadata?.full_name || 'Me' }} 
                   />
                </div>
             )}

             {activeTab === 'video' && isConnected && (
                <div style={{ animation: 'fadeIn 0.4s', textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{ width: '80px', height: '80px', background: 'rgba(var(--brand-rgb), 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                       <Video size={40} color="var(--brand)" />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1rem' }}>Start Video Collaboration</h3>
                    <p style={{ color: 'var(--text-sub)', marginBottom: '2.5rem', maxWidth: '400px', marginInline: 'auto' }}>
                       Launch a private, high-fidelity video session via the GroupFlow Laboratory. Instant peer verification and screen sharing enabled.
                    </p>
                    <button className="btn btn-primary" style={{ width: 'auto', padding: '1rem 2rem' }}>
                       Launch Video LabNow
                    </button>
                </div>
             )}

             {activeTab === 'accomplishments' && (
                <div style={{ animation: 'fadeIn 0.4s' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>Achievement Wall</h3>
                      <div style={{ padding: '0.4rem 0.8rem', background: 'var(--brand)', borderRadius: '8px', color: 'white', fontSize: '0.7rem', fontWeight: 900 }}>
                         {member.badges_count || 0} CREDENTIALS
                      </div>
                   </div>

                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                      {member.badges_count && member.badges_count > 0 ? (
                        [...Array(member.badges_count)].map((_, i) => (
                           <div key={i} style={{ background: 'var(--bg-sub)', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)', textAlign: 'center' }}>
                              <div style={{ width: '48px', height: '48px', background: 'var(--brand)', borderRadius: '16px', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                 <Award size={24} />
                              </div>
                              <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Verifiable Badge</div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-sub)', marginTop: '0.25rem', fontWeight: 700 }}>LEVEL {Math.floor(member.total_score / 100) + 1}</div>
                           </div>
                        ))
                      ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', opacity: 0.5 }}>
                           <Award size={48} style={{ marginBottom: '1rem' }} />
                           <p>No verifiable credentials recorded for this researcher.</p>
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
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          .profile-page-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
