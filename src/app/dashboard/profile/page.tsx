'use client'

import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { User, MapPin, Activity, Award, Mail, Calendar, ShieldCheck } from 'lucide-react'
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
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 var(--p-safe)', animation: 'fadeIn 0.5s ease-out' }}>

         {/* Profile Header Block */}
         <div className="profile-header-card" style={{ maxWidth: '100%', marginBottom: '1.5rem', padding: 'var(--header-p)', position: 'relative', overflow: 'hidden', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', opacity: 0.05, filter: 'blur(40px)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--header-gap)', flexWrap: 'wrap', justifyContent: 'center', textAlign: 'center' }}>
               <div style={{ position: 'relative' }}>
                  <div style={{ width: 'var(--avatar-size)', height: 'var(--avatar-size)', borderRadius: '50%', background: 'var(--bg-sub)', border: '4px solid var(--surface)', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                     {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt={`${profile.full_name || 'User'} avatar`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     ) : (
                        <User size={40} color="var(--text-sub)" />
                     )}
                  </div>
                  <div style={{ position: 'absolute', bottom: '5px', right: '5px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--success)', border: '3px solid var(--surface)', boxShadow: 'var(--shadow-sm)' }} />
               </div>

                <div style={{ flex: '1 1 280px' }}>
                   <h1 className="fluid-h1" style={{ fontWeight: 950, margin: 0 }}>{profile?.full_name}</h1>
                   {profile?.tagline && (
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', fontStyle: 'italic', margin: '0.25rem 0 0.5rem', fontWeight: 600 }}>
                         "{profile.tagline}"
                      </p>
                   )}
                   <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', margin: '0.5rem 0 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap', fontWeight: 600 }}>
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

         <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--brand)', color: 'white', borderRadius: '24px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '140px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8, marginBottom: '0.5rem' }}>
                   <Award size={16} />
                   <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Peer Verification Index</span>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 950, lineHeight: 1, letterSpacing: '-0.04em' }}>{profile?.total_score || 0}</div>
                <p style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.5rem', fontWeight: 600 }}>Institutional Contribution Score</p>
            </div>

            <div style={{ background: 'var(--surface)', borderRadius: '24px', padding: '1.5rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ color: 'var(--text-sub)', fontSize: '0.8rem', fontWeight: 700 }}>ACADEMIC STANDING</span>
                   <span style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--success)' }}>#{profile?.rank || 'Researcher'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ color: 'var(--text-sub)', fontSize: '0.8rem', fontWeight: 700 }}>INSTITUTIONAL ID</span>
                   <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{profile?.school_id || 'N/A'}</span>
                </div>
            </div>
         </div>

         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="card-item" style={{ background: 'var(--surface)', borderRadius: '24px', padding: '1.5rem', border: '1px solid var(--border)' }}>
               <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-sub)', letterSpacing: '0.05em' }}>
                  Researcher Narrative
               </h3>
               <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6, opacity: 0.8 }}>
                  {profile?.biography || `Active specialist within the GroupFlow environment. Focused on ${profile?.course_name || 'Project Disciplines'}, maintaining high collaborative throughput.`}
               </p>
            </div>

            <div className="card-item" style={{ background: 'linear-gradient(135deg, var(--bg-sub), var(--surface))', borderRadius: '24px', padding: '1.5rem', border: '1px solid var(--border)', position: 'relative' }}>
               <h3 style={{ fontSize: '0.9rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-sub)', letterSpacing: '0.05em' }}>
                  Academic Roadmap
               </h3>
               
               {(() => {
                 const currentYear = new Date().getFullYear();
                 const start = parseInt(String(profile?.enrollment_year)) || currentYear - 1;
                 const end = parseInt(String(profile?.completion_year)) || currentYear + 2;
                 const total = end - start || 1;
                 const elapsed = currentYear - start;
                 const percentage = Math.max(0, Math.min(100, (elapsed / total) * 100));
                 
                 return (
                   <div style={{ padding: '0.25rem 0' }}>
                      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                         <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{percentage >= 100 ? 'Degree Completed' : `Year ${Math.max(1, elapsed + 1)} of ${total}`}</div>
                         <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', fontWeight: 600 }}>{Math.round(percentage)}%</div>
                      </div>
                      <div style={{ position: 'relative', height: '6px', background: 'var(--border)', borderRadius: '10px' }}>
                         <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${percentage}%`, background: 'var(--brand)', borderRadius: '10px' }} />
                      </div>
                   </div>
                 )
               })()}
            </div>
         </div>

         </div>

         <div className="card-item" style={{ maxWidth: '100%', marginTop: '1.5rem', background: 'var(--surface)', borderRadius: '24px', padding: '2rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
                   <Award size={22} color="var(--brand)" />
                   Credential Repository
                </h3>
            </div>
            {(!profile?.badges_count) ? (
               <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'var(--bg-sub)', borderRadius: '20px', border: '1px dashed var(--border)' }}>
                  <Award size={48} color="var(--text-sub)" style={{ opacity: 0.1, marginBottom: '1rem' }} />
                  <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 600 }}>Earnings verifiable credentials will appear here.</p>
                  <Link href="/dashboard" className="btn btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>Secure First Badge</Link>
               </div>
            ) : (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                  {[...Array(profile.badges_count)].map((_, i) => (
                     <div key={i} style={{ padding: '1.25rem', background: 'var(--bg-sub)', border: '1px solid var(--border)', borderRadius: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Award size={20} /></div>
                        <div>
                           <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>Credential #{i + 1}</div>
                           <div style={{ fontSize: '0.65rem', color: 'var(--text-sub)', marginTop: '0.2rem', fontWeight: 600 }}>VERIFIED</div>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
   )
}
