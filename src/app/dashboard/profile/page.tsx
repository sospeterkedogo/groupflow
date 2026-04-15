'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User, MapPin, Activity, Award, Mail, Calendar, ShieldCheck } from 'lucide-react'

import Link from 'next/link'

export default function ProfilePage() {
   const [profile, setProfile] = useState<any>(null)
   const [loading, setLoading] = useState(true)

   const supabase = createClient()

   useEffect(() => {
      fetchProfile()
   }, [])

   const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
         const { data } = await supabase
            .from('profiles')
            .select('*, groups(*)')
            .eq('id', user.id)
            .single()

         if (data) setProfile(data)
      }
      setLoading(false)
   }

   const handleSwitchGroup = async () => {
      const { error } = await supabase.from('profiles').update({ group_id: null }).eq('id', profile.id)
      if (!error) window.location.href = '/dashboard'
   }

   if (loading) {
      return (
         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-sub)' }}>
            <div style={{ textAlign: 'center' }}>
               <div className="spinner" style={{ border: '3px solid var(--border)', borderTop: '3px solid var(--brand)', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
               <span>Loading Profile...</span>
            </div>
         </div>
      )
   }

   return (
      <div style={{ maxWidth: '900px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>

         {/* Profile Header Block */}
         <div className="auth-card" style={{ maxWidth: '100%', marginBottom: '2rem', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
            {/* Subtle Accent pattern */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', opacity: 0.05, filter: 'blur(40px)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
               <div style={{ position: 'relative' }}>
                  <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--bg-sub)', border: '4px solid var(--surface)', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                     {profile?.avatar_url ? (
                        <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     ) : (
                        <User size={60} color="var(--text-sub)" />
                     )}
                  </div>
                  <div style={{ position: 'absolute', bottom: '5px', right: '5px', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--success)', border: '3px solid var(--surface)', boxShadow: 'var(--shadow-sm)' }} />
               </div>

               <div>
                  <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>{profile?.full_name}</h1>
                  <p style={{ color: 'var(--text-sub)', fontSize: '1.1rem', margin: '0.25rem 0 1rem' }}>Software Engineer • {profile?.groups?.name || 'Unassigned Workspace'}</p>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-sub)', background: 'var(--bg-sub)', padding: '0.4rem 0.8rem', borderRadius: '50px', border: '1px solid var(--border)' }}>
                        <Mail size={14} /> {profile?.email}
                     </span>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-sub)', background: 'var(--bg-sub)', padding: '0.4rem 0.8rem', borderRadius: '50px', border: '1px solid var(--border)' }}>
                        <Calendar size={14} /> Joined {new Date(profile?.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                     </span>
                  </div>
               </div>
            </div>
         </div>

         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>

            {/* Validity Engine Stats */}
            <div className="auth-card" style={{ maxWidth: '100%', background: 'var(--brand)', color: 'white', border: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '220px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8, marginBottom: '1rem' }}>
                  <Award size={20} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Points Earned</span>
               </div>
               <div style={{ fontSize: '4.5rem', fontWeight: 900, lineHeight: 1 }}>{profile?.total_score || 0}</div>
               <p style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '1.5rem', lineHeight: 1.5 }}>
                  Composite score derived from peer verification and absolute deadline execution.
               </p>
            </div>

            {/* Core Configuration */}
            <div className="auth-card" style={{ maxWidth: '100%' }}>
               <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={20} color="var(--brand)" />
                  System Parameters
               </h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                     <span style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>Network ID</span>
                     <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-sub)' }}>{profile?.id?.substring(0, 8)}...</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                     <span style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>Module Track</span>
                     <span style={{ fontWeight: 600 }}>{profile?.groups?.module_code || 'None'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                     <span style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>Security Level</span>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--success)', fontSize: '0.85rem' }}>
                        Verified Identity
                     </span>
                  </div>
               </div>
            </div>

         </div>

         {/* Technical Arsenal Gallery */}
         <div className="auth-card" style={{ maxWidth: '100%', marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={20} color="var(--brand)" />
                  Special Badges
               </h3>
               <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand)', background: 'rgba(var(--brand-rgb), 0.1)', padding: '0.25rem 0.75rem', borderRadius: '50px', border: '1px solid var(--brand)' }}>
                  {profile?.achievements?.length || 0} ACHIEVEMENTS
               </div>
            </div>

            {profile?.achievements && profile.achievements.length > 0 ? (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                  {profile.achievements.map((achievement: any) => (
                     <div
                        key={achievement.name}
                        style={{
                           padding: '1rem',
                           background: 'linear-gradient(135deg, var(--bg-sub), var(--surface))',
                           border: '1px solid var(--border)',
                           borderRadius: '16px',
                           textAlign: 'center',
                           position: 'relative',
                           overflow: 'hidden',
                           display: 'flex',
                           flexDirection: 'column',
                           alignItems: 'center',
                           gap: '0.75rem',
                           boxShadow: 'var(--shadow-sm)',
                           animation: 'badgeGlow 3s infinite alternate'
                        }}
                     >
                        <div style={{
                           width: '40px',
                           height: '40px',
                           borderRadius: '10px',
                           background: 'var(--brand)',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           color: 'white',
                           boxShadow: '0 4px 12px rgba(var(--brand-rgb), 0.3)'
                        }}>
                           <Award size={20} />
                        </div>
                        <div>
                           <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>{achievement.name}</div>
                           <div style={{ fontSize: '0.65rem', color: 'var(--text-sub)', marginTop: '0.2rem', fontWeight: 600 }}>Mastered {new Date(achievement.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</div>
                        </div>
                        {/* Corner accent */}
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '30px', height: '30px', background: 'var(--brand)', opacity: 0.1, transform: 'rotate(45deg)' }} />
                     </div>
                  ))}
               </div>
            ) : (
               <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-sub)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
                  <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Your technical arsenal is currently a blank canvas.</p>
                  <button
                     onClick={() => window.location.href = '/dashboard/settings'}
                     className="btn btn-secondary"
                     style={{ width: 'auto' }}
                  >
                     Connect Integrations
                  </button>
               </div>
            )}
         </div>

         {/* Module Context */}
         <div className="auth-card" style={{ maxWidth: '100%', marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <MapPin size={20} color="var(--brand)" />
               My Active Teams
            </h3>
            {profile?.groups ? (
               <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'var(--bg-sub)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                     <MapPin size={24} color="var(--brand)" />
                  </div>
                  <div>
                     <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{profile.groups.name}</h4>
                     <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-sub)' }}>Module Reference: {profile.groups.module_code}</p>
                  </div>
                  <button className="btn btn-secondary" onClick={handleSwitchGroup} style={{ width: 'auto', marginLeft: 'auto' }}>Change Team</button>
               </div>
            ) : (
               <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg-sub)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
                  <p style={{ color: 'var(--text-sub)', marginBottom: '1rem' }}>You are not currently assigned to a module track.</p>
                  <Link href="/dashboard" className="btn btn-secondary" style={{ width: '100%' }}>
                     View Project
                  </Link>
               </div>
            )}
         </div>

         <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
       `}</style>
      </div>
   )
}
