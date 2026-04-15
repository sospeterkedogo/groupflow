'use client'

import { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { User, MapPin, Activity, Award, Mail, Calendar, ShieldCheck } from 'lucide-react'

import Link from 'next/link'

export default function ProfilePage() {
   const [profile, setProfile] = useState<any>(null)
   const [loading, setLoading] = useState(true)

   const supabase = createBrowserSupabaseClient()

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
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 var(--p-safe)', animation: 'fadeIn 0.5s ease-out' }}>

         {/* Profile Header Block */}
         <div className="profile-header-card" style={{ maxWidth: '100%', marginBottom: '1.5rem', padding: 'var(--header-p)', position: 'relative', overflow: 'hidden', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
            {/* Subtle Accent pattern */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', opacity: 0.05, filter: 'blur(40px)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--header-gap)', flexWrap: 'wrap', justifyContent: 'center', textAlign: 'center' }}>
               <div style={{ position: 'relative' }}>
                  <div style={{ width: 'var(--avatar-size)', height: 'var(--avatar-size)', borderRadius: '50%', background: 'var(--bg-sub)', border: '4px solid var(--surface)', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                     {profile?.avatar_url ? (
                        <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     ) : (
                        <User size={40} color="var(--text-sub)" />
                     )}
                  </div>
                  <div style={{ position: 'absolute', bottom: '5px', right: '5px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--success)', border: '3px solid var(--surface)', boxShadow: 'var(--shadow-sm)' }} />
               </div>

               <div style={{ flex: '1 1 280px' }}>
                  <h1 className="fluid-h1" style={{ fontWeight: 900, margin: 0 }}>{profile?.full_name}</h1>
                  <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', margin: '0.5rem 0 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap', fontWeight: 600 }}>
                    <ShieldCheck size={16} color="var(--brand)" />
                    {profile?.course_name || 'Software Engineer'} • {profile?.groups?.name || 'Unassigned Workspace'}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'var(--text-sub)', background: 'var(--bg-sub)', padding: '0.3rem 0.6rem', borderRadius: '50px', border: '1px solid var(--border)', fontWeight: 600 }}>
                        <Mail size={12} /> {profile?.email}
                     </span>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'var(--text-sub)', background: 'var(--bg-sub)', padding: '0.3rem 0.6rem', borderRadius: '50px', border: '1px solid var(--border)', fontWeight: 600 }}>
                        <Calendar size={12} /> Joined {new Date(profile?.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                     </span>
                  </div>
               </div>
            </div>
         </div>

         <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

            {/* Validity Engine Stats */}
            <div style={{ background: 'var(--brand)', color: 'white', borderRadius: '24px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '180px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8, marginBottom: '0.75rem' }}>
                  <Award size={18} />
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Points Earned</span>
               </div>
               <div style={{ fontSize: 'var(--points-size)', fontWeight: 900, lineHeight: 1 }}>{profile?.total_score || 0}</div>
               <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '1rem', lineHeight: 1.4, fontWeight: 500 }}>
                  Composite score derived from peer verification and absolute deadline execution.
               </p>
            </div>

            {/* Academic Journey Card - Dynamic Roadmap */}
            <div className="card-item" style={{ background: 'linear-gradient(135deg, var(--bg-sub), var(--surface))', borderRadius: '24px', padding: '1.5rem', border: '1px solid var(--border)', position: 'relative' }}>
               <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
                  <Activity size={18} color="var(--brand)" />
                  Academic Roadmap
               </h3>
               
               {(() => {
                 const currentYear = new Date().getFullYear();
                 const start = parseInt(profile?.enrollment_year) || currentYear - 1;
                 const end = parseInt(profile?.completion_year) || currentYear + 2;
                 const total = end - start;
                 const elapsed = currentYear - start;
                 const percentage = Math.max(0, Math.min(100, (elapsed / total) * 100));
                 const isCompleted = currentYear > end;
                 const isFinalYear = currentYear === end;
                 
                 return (
                   <div style={{ padding: '0.25rem 0' }}>
                      <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                         <div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--brand)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                               Progress Track
                            </div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                               {isCompleted ? 'Degree Completed' : isFinalYear ? `Final Year` : `Year ${Math.max(1, elapsed + 1)} of ${total}`}
                            </div>
                         </div>
                         <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', fontWeight: 600 }}>{Math.round(percentage)}%</div>
                      </div>

                      {/* Roadmap Visualizer */}
                      <div style={{ position: 'relative', height: '6px', background: 'var(--border)', borderRadius: '10px', marginBottom: '1.75rem', marginInline: '5px' }}>
                         <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${percentage}%`, background: 'var(--brand)', borderRadius: '10px', transition: 'width 1s ease-in-out' }} />
                         
                         {/* Start Node */}
                         <div style={{ position: 'absolute', left: '0%', top: '50%', transform: 'translateY(-50%)' }}>
                             <div style={{ width: '10px', height: '10px', background: 'var(--brand)', borderRadius: '50%', border: '3px solid var(--surface)', boxShadow: 'var(--shadow-sm)' }} />
                             <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-sub)' }}>{start}</div>
                         </div>

                         {/* End Node */}
                         <div style={{ position: 'absolute', left: '100%', top: '50%', transform: 'translateY(-50%)' }}>
                             <div style={{ width: '10px', height: '10px', background: isCompleted ? 'var(--brand)' : 'var(--border)', borderRadius: '50%', border: '3px solid var(--surface)' }} />
                             <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-sub)' }}>{end}</div>
                         </div>

                         {/* Current Marker */}
                         {percentage > 0 && percentage < 100 && (
                           <div style={{ position: 'absolute', left: `${percentage}%`, top: '-22px', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div style={{ fontSize: '0.55rem', fontWeight: 900, background: 'var(--brand)', color: 'white', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>LIVE</div>
                              <div style={{ width: '2px', height: '8px', background: 'var(--brand)' }} />
                           </div>
                         )}
                      </div>

                      <div style={{ marginTop: '0.75rem', background: 'rgba(var(--brand-rgb), 0.03)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(var(--brand-rgb), 0.1)' }}>
                         <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-main)' }}>{profile?.course_name || 'Enrolled Student'}</div>
                         <div style={{ fontSize: '0.65rem', color: 'var(--text-sub)', marginTop: '0.15rem' }}>Degree path verified via internal registry.</div>
                      </div>
                   </div>
                 )
               })()}
            </div>

            {/* Core Configuration */}
            <div className="card-item" style={{ background: 'var(--surface)', borderRadius: '24px', padding: '1.5rem', border: '1px solid var(--border)' }}>
               <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
                  <ShieldCheck size={18} color="var(--brand)" />
                  System Parameters
               </h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border)' }}>
                     <span style={{ color: 'var(--text-sub)', fontSize: '0.85rem', fontWeight: 600 }}>Network ID</span>
                     <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-sub)' }}>{profile?.id?.substring(0, 8)}...</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border)' }}>
                     <span style={{ color: 'var(--text-sub)', fontSize: '0.85rem', fontWeight: 600 }}>Module Track</span>
                     <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{profile?.groups?.module_code || 'None'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                     <span style={{ color: 'var(--text-sub)', fontSize: '0.85rem', fontWeight: 600 }}>Security Level</span>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 800, color: 'var(--success)', fontSize: '0.8rem' }}>
                        Verified Identity
                     </span>
                  </div>
               </div>
            </div>

         </div>

         {/* Technical Arsenal Gallery */}
         <div className="card-item" style={{ maxWidth: '100%', marginTop: '1.5rem', background: 'var(--surface)', borderRadius: '24px', padding: '1.5rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
               <h3 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
                  <Award size={18} color="var(--brand)" />
                  Achievements
               </h3>
               <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--brand)', background: 'rgba(var(--brand-rgb), 0.1)', padding: '0.2rem 0.6rem', borderRadius: '50px', border: '1px solid var(--brand)' }}>
                  {profile?.achievements?.length || 0} BADGES
               </div>
            </div>

            {profile?.achievements && profile.achievements.length > 0 ? (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                  {profile.achievements.map((achievement: any) => (
                     <div
                        key={achievement.name}
                        className="badge-card"
                        style={{
                           padding: '0.75rem',
                           background: 'var(--bg-sub)',
                           border: '1px solid var(--border)',
                           borderRadius: '16px',
                           textAlign: 'center',
                           position: 'relative',
                           overflow: 'hidden',
                           display: 'flex',
                           flexDirection: 'column',
                           alignItems: 'center',
                           gap: '0.5rem',
                        }}
                     >
                        <div style={{
                           width: '32px',
                           height: '32px',
                           borderRadius: '8px',
                           background: 'var(--brand)',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           color: 'white',
                        }}>
                           <Award size={16} />
                        </div>
                        <div>
                           <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{achievement.name}</div>
                           <div style={{ fontSize: '0.6rem', color: 'var(--text-sub)', marginTop: '0.1rem', fontWeight: 600 }}>{new Date(achievement.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</div>
                        </div>
                     </div>
                  ))}
               </div>
            ) : (
               <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg-sub)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
                  <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', marginBottom: '1rem' }}>No achievements recorded yet.</p>
                  <button
                     onClick={() => window.location.href = '/dashboard/settings'}
                     className="btn btn-secondary"
                     style={{ width: 'auto', fontSize: '0.8rem' }}
                  >
                     Configure Profile
                  </button>
               </div>
            )}
         </div>

         {/* Module Context */}
         <div className="card-item" style={{ maxWidth: '100%', marginTop: '1.5rem', background: 'var(--surface)', borderRadius: '24px', padding: '1.5rem', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
               <MapPin size={18} color="var(--brand)" />
               Active Team
            </h3>
            {profile?.groups ? (
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-sub)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', flexShrink: 0 }}>
                     <MapPin size={20} color="var(--brand)" />
                  </div>
                  <div style={{ flex: 1, minWidth: '150px' }}>
                     <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>{profile.groups.name}</h4>
                     <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 600 }}>{profile.groups.module_code}</p>
                  </div>
                  <button className="btn btn-secondary" onClick={handleSwitchGroup} style={{ width: 'auto', padding: '0.5rem 0.8rem', fontSize: '0.75rem', fontWeight: 700 }}>Switch Team</button>
               </div>
            ) : (
               <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg-sub)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
                  <p style={{ color: 'var(--text-sub)', marginBottom: '1rem', fontSize: '0.85rem' }}>Not assigned to a team track.</p>
                  <Link href="/dashboard" className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem' }}>
                     Join Project
                  </Link>
               </div>
            )}
         </div>

         <style jsx>{`
          }
       `}</style>
      </div>
   )
}
