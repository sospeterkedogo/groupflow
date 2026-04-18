'use client'

import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { User, MapPin, Activity, Award, Mail, Calendar, ShieldCheck, Terminal } from 'lucide-react'
import Link from 'next/link'
import { useProfile } from '@/context/ProfileContext'

export default function ProfilePage() {
   const { profile, loading } = useProfile()
   const supabase = createBrowserSupabaseClient()

   const handleSwitchGroup = async () => {
      if (!profile) return
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
      <div style={{ maxWidth: '900px', margin: '1.5rem auto', padding: '0 var(--p-safe)', animation: 'fadeIn 0.5s ease-out' }}>

         {/* Profile Header Block */}
         <div className="profile-header-card" style={{ maxWidth: '100%', marginBottom: '1.5rem', padding: '1.5rem', position: 'relative', overflow: 'hidden', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', opacity: 0.05, filter: 'blur(40px)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', textAlign: 'center' }}>
               <div style={{ position: 'relative' }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-sub)', border: '3px solid var(--surface)', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                     {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt={`${profile.full_name || 'User'} avatar`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     ) : (
                        <User size={40} color="var(--text-sub)" />
                     )}
                  </div>
                  <div style={{ position: 'absolute', bottom: '5px', right: '5px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--success)', border: '2px solid var(--surface)', boxShadow: 'var(--shadow-sm)' }} />
               </div>

                <div style={{ flex: '1 1 280px' }}>
                   <h1 className="fluid-h1" style={{ fontWeight: 950, margin: 0, fontSize: '2rem' }}>{profile?.full_name}</h1>
                   {profile?.tagline && (
                      <p style={{ fontSize: '0.9rem', color: 'var(--brand)', fontStyle: 'italic', margin: '0.25rem 0 0.5rem', fontWeight: 800 }}>
                         "{profile.tagline}"
                      </p>
                   )}
                   <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', margin: '0.5rem 0 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap', fontWeight: 700 }}>
                     <ShieldCheck size={16} color="var(--brand)" />
                     {profile?.course_name || 'Academic Scholar'} • {(profile as any)?.groups?.name || 'Independent Researcher'}
                   </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'var(--text-sub)', background: 'var(--bg-sub)', padding: '0.3rem 0.6rem', borderRadius: '50px', border: '1px solid var(--border)', fontWeight: 600 }}>
                        <Mail size={12} /> {profile?.email}
                     </span>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'var(--text-sub)', background: 'var(--bg-sub)', padding: '0.3rem 0.6rem', borderRadius: '50px', border: '1px solid var(--border)', fontWeight: 600 }}>
                        <Calendar size={12} /> Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'N/A'}
                     </span>
                  </div>
               </div>
            </div>
         </div>

         <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '0.5rem' }}>
               <div style={{ background: 'var(--brand)', color: 'white', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '120px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8, marginBottom: '0.5rem' }}>
                     <Award size={16} />
                     <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Peer Verification</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 950, lineHeight: 1, letterSpacing: '-0.04em' }}>{profile?.total_score || 0}</div>
                  <p style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.5rem', fontWeight: 600 }}>Institutional Score</p>
               </div>

               <div style={{ background: 'var(--surface)', borderRadius: '16px', padding: '1.25rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ color: 'var(--text-sub)', fontSize: '0.7rem', fontWeight: 800 }}>STANDING</span>
                     <span style={{ fontWeight: 900, fontSize: '0.9rem', color: 'var(--success)' }}>#{profile?.rank || 'Researcher'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ color: 'var(--text-sub)', fontSize: '0.7rem', fontWeight: 800 }}>INSTITUTIONAL ID</span>
                     <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>{profile?.school_id || 'N/A'}</span>
                  </div>
               </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '0.5rem' }}>
               <div className="card-item" style={{ background: 'var(--surface)', borderRadius: '16px', padding: '1.25rem', border: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '0.8rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-sub)', letterSpacing: '0.05em' }}>
                     Researcher Narrative
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5, opacity: 0.85 }}>
                     {profile?.biography || `Active specialist in the GroupFlow network, focusing on ${profile?.course_name || 'academic research'} and software implementation.`}
                  </p>
               </div>

               {profile?.stack && (
                  <div className="card-item" style={{ background: 'var(--surface)', borderRadius: '16px', padding: '1.25rem', border: '1px solid var(--border)' }}>
                     <h3 style={{ fontSize: '0.8rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-sub)', letterSpacing: '0.05em' }}>
                        <Terminal size={14} /> Technical Arsenal
                     </h3>
                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {profile.stack.split(',').map((tech, idx) => (
                           <span key={idx} style={{ padding: '0.3rem 0.6rem', background: 'var(--bg-sub)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand)' }}>
                              {tech.trim()}
                           </span>
                        ))}
                     </div>
                  </div>
               )}
            </div>

         </div>

         <div className="card-item" style={{ maxWidth: '100%', marginTop: '0.5rem', background: 'var(--surface)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 900 }}>
                   <Award size={18} color="var(--brand)" />
                   Verified Credentials
                </h3>
            </div>
            {(!profile?.badges_count) ? (
               <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'var(--bg-sub)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                  <Award size={32} color="var(--text-sub)" style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
                  <p style={{ color: 'var(--text-sub)', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: 600 }}>Your verifiable credentials will appear here.</p>
                  <Link href="/dashboard" className="btn btn-primary btn-sm" style={{ width: 'auto' }}>Secure First Badge</Link>
               </div>
            ) : (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                  {[...Array(profile.badges_count)].map((_, i) => (
                     <div key={i} style={{ padding: '1rem', background: 'var(--bg-sub)', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <Award size={20} color="var(--brand)" />
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-main)' }}>Credential #{i + 1}</div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
   )
}
