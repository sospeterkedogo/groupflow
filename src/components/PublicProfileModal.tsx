'use client'

import { X, UserCircle, ShieldCheck, Mail, Target, Award, Hash, GraduationCap, Calendar, UserPlus, Check } from 'lucide-react'
import { Profile } from '@/types/database'
import { useState } from 'react'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'

interface PublicProfileModalProps {
  member: Profile;
  onClose: () => void;
  isConnected?: boolean;
  onConnect?: () => void;
}

export default function PublicProfileModal({ member, onClose, isConnected: initialConnected = false, onConnect }: PublicProfileModalProps) {
  const [isConnected, setIsConnected] = useState(initialConnected)
  const [loading, setLoading] = useState(false)
  const supabase = createBrowserSupabaseClient()

  const handleConnect = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('user_connections')
      .upsert({ 
        user_id: user.id, 
        target_id: member.id,
        status: 'connected'
      })

    if (!error) {
      setIsConnected(true)
      if (onConnect) onConnect()
    }
    setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div 
        className="glass"
        style={{ 
          background: 'var(--surface)', 
          borderRadius: '28px', 
          width: '100%', 
          maxWidth: '500px', 
          overflow: 'hidden', 
          border: '1px solid var(--border)',
          boxShadow: '0 25px 70px -12px rgba(0,0,0,0.6)',
          animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        {/* Header Visual with Gradient */}
        <div style={{ height: '140px', background: 'linear-gradient(135deg, var(--brand), #6366f1, #a855f7)', position: 'relative' }}>
           <button 
             onClick={onClose}
             style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', border: 'none', borderRadius: '50%', padding: '0.6rem', cursor: 'pointer', color: 'white', transition: 'all 0.2s' }}
             onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(90deg)'}
             onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
           >
             <X size={20} />
           </button>
           
           <div style={{ position: 'absolute', bottom: '-45px', left: '2rem', display: 'flex', alignItems: 'flex-end', gap: '1.5rem' }}>
              <div style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '24px', 
                background: 'var(--surface)', 
                border: '4px solid var(--surface)', 
                boxShadow: 'var(--shadow-xl)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                 {member.avatar_url ? (
                   <img src={member.avatar_url} alt={member.full_name || 'avatar'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 ) : (
                   <UserCircle size={70} color="var(--text-sub)" />
                 )}
              </div>
           </div>
        </div>

        {/* Profile Info */}
        <div style={{ padding: '3.5rem 2rem 2rem' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.25rem', letterSpacing: '-0.03em' }}>{member.full_name || 'Anonymous Student'}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-sub)', fontSize: '0.9rem' }}>
                   <GraduationCap size={16} color="var(--brand)" /> 
                   <span>{member.course_name || 'General Studies'}</span>
                </div>
              </div>
              <button 
                onClick={handleConnect}
                disabled={isConnected || loading}
                style={{ 
                  padding: '0.6rem 1.25rem', 
                  borderRadius: '12px', 
                  border: 'none', 
                  background: isConnected ? 'var(--bg-sub)' : 'var(--brand)', 
                  color: isConnected ? 'var(--text-sub)' : 'white',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: isConnected ? 'default' : 'pointer',
                  boxShadow: isConnected ? 'none' : '0 4px 14px rgba(var(--brand-rgb), 0.3)',
                  transition: 'all 0.2s'
                }}
              >
                {isConnected ? <Check size={18} /> : <UserPlus size={18} />}
                {isConnected ? 'Connected' : 'Connect'}
              </button>
           </div>

           {/* Info Cards */}
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-sub)', marginBottom: '0.5rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    <Hash size={14} /> School ID
                 </div>
                 <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{member.school_id || 'N/A'}</div>
              </div>
              <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-sub)', marginBottom: '0.5rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    <Calendar size={14} /> Batch
                 </div>
                 <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{member.enrollment_year} - {member.completion_year}</div>
              </div>
              <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand)', marginBottom: '0.5rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    <Target size={14} /> Total Score
                 </div>
                 <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>{member.total_score} pts</div>
              </div>
              <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', marginBottom: '0.5rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    <ShieldCheck size={14} /> Global Rank
                 </div>
                 <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>#{member.rank || 'Student'}</div>
              </div>
           </div>

           <div style={{ padding: '0.75rem 1rem', background: 'rgba(var(--brand-rgb), 0.05)', borderRadius: '14px', border: '1px solid rgba(var(--brand-rgb), 0.1)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <Award size={20} color="var(--brand)" />
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand)' }}>Achievements</span>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-sub)' }}>{member.badges_count || 0} Verifiable Digital Credentials earned</p>
              </div>
           </div>

           <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={onClose}
                className="btn btn-secondary" 
                style={{ flex: 1, borderRadius: '14px' }}
              >
                Close
              </button>
              <a 
                href={`mailto:${member.email}`}
                className="btn btn-primary" 
                style={{ flex: 1, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Mail size={18} /> Send Message
              </a>
           </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
