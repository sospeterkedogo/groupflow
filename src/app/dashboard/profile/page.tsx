'use client'

import { useState, useEffect, useMemo } from 'react'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { User, MapPin, Activity, Award, Mail, Calendar, ShieldCheck, Terminal, BookOpen, Fingerprint, Edit2, Check, X } from 'lucide-react'
import Link from 'next/link'
import { useProfile } from '@/context/ProfileContext'

export default function ProfilePage() {
   const { profile, loading, refreshProfile } = useProfile()
   const supabase = createBrowserSupabaseClient()
   const [isEditingBio, setIsEditingBio] = useState(false)
   const [bioText, setBioText] = useState('')
   const [isSaving, setIsSaving] = useState(false)

   const score = profile?.total_score || 0
   const levelData = useMemo(() => {
      if (score < 100) return { level: 1, name: 'Academic Novice', next: 100, color: '#94a3b8' }
      if (score < 500) return { level: 2, name: 'Project Contributor', next: 500, color: 'var(--success)' }
      if (score < 2000) return { level: 3, name: 'Senior Researcher', next: 2000, color: 'var(--brand)' }
      if (score < 5000) return { level: 4, name: 'Lead Analyst', next: 5000, color: 'var(--accent)' }
      return { level: 5, name: 'Principal Scholar', next: 10000, color: '#fbbf24' }
   }, [score])

   const progressToNext = Math.min(100, Math.round((score / levelData.next) * 100))

   useEffect(() => {
      if (profile?.biography) {
         setBioText(profile.biography)
      }
   }, [profile?.biography])

   const handleSaveBio = async () => {
      if (!profile) return
      setIsSaving(true)
      const { error } = await supabase
         .from('profiles')
         .update({ biography: bioText })
         .eq('id', profile.id)
      
      if (!error) {
         await refreshProfile()
         setIsEditingBio(false)
      }
      setIsSaving(false)
   }

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
               <span>Loading Identity...</span>
            </div>
         </div>
      )
   }

   return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--p-safe) 4rem', animation: 'fadeIn 0.5s ease-out' }}>

         {/* Identity Hub Header */}
         <div className="profile-header-card" style={{ maxWidth: '100%', marginBottom: 'var(--gap-lg)', padding: 'var(--section-p)', position: 'relative', overflow: 'hidden', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '250px', height: '250px', background: 'radial-gradient(circle, var(--brand) 0%, transparent 70%)', opacity: 0.08, filter: 'blur(50px)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-lg)', flexWrap: 'wrap', justifyContent: 'center', textAlign: 'center' }}>
               <div style={{ position: 'relative' }}>
                  <div style={{ width: '130px', height: '130px', borderRadius: '50%', background: 'var(--bg-sub)', border: '4px solid var(--surface)', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                     {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt={`${profile.full_name || 'User'} avatar`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     ) : (
                        <User size={60} color="var(--text-sub)" />
                     )}
                  </div>
                  <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '22px', height: '22px', borderRadius: '50%', background: 'var(--success)', border: '3px solid var(--surface)', boxShadow: '0 0 10px var(--success)' }} />
               </div>

                 <div style={{ flex: '1 1 320px' }}>
                    <h1 className="fluid-h1" style={{ fontWeight: 950, margin: 0, fontSize: '2.5rem', letterSpacing: '-0.04em' }}>{profile?.full_name}</h1>
                    {profile?.tagline && (
                       <p style={{ fontSize: '1rem', color: 'var(--brand)', fontStyle: 'italic', margin: '0.4rem 0 0.75rem', fontWeight: 800 }}>
                          "{profile.tagline}"
                       </p>
                    )}
                    <p style={{ color: 'var(--text-sub)', fontSize: '1rem', margin: '0.5rem 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', fontWeight: 700 }}>
                      <ShieldCheck size={18} color="var(--brand)" />
                      {profile?.course_name || 'System Analyst'} &bull; {(profile as any)?.groups?.name || 'Session Node'}
                    </p>
                   <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-sub)', background: 'var(--bg-sub)', padding: '0.4rem 0.8rem', borderRadius: '50px', border: '1px solid var(--border)', fontWeight: 700 }}>
                         <Mail size={14} /> {profile?.email}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-sub)', background: 'var(--bg-sub)', padding: '0.4rem 0.8rem', borderRadius: '50px', border: '1px solid var(--border)', fontWeight: 700 }}>
                         <Calendar size={14} /> Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'N/A'}
                      </span>
                   </div>
                </div>
             </div>
          </div>

          <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--gap-md)' }}>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap-md)', marginBottom: '0.5rem' }}>
                <div style={{ background: 'var(--brand)', color: 'white', borderRadius: '20px', padding: 'var(--card-p)', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '150px', boxShadow: '0 8px 16px rgba(var(--brand-rgb), 0.2)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8, marginBottom: '0.5rem' }}>
                      <Activity size={18} />
                      <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Team Points</span>
                   </div>
                   <div style={{ fontSize: '2.75rem', fontWeight: 950, lineHeight: 1, letterSpacing: '-0.04em' }}>{profile?.total_score || 0}</div>
                   <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.6rem', fontWeight: 700 }}>Contribution score earned</p>
                </div>

                 <div style={{ background: 'var(--surface)', borderRadius: '20px', padding: 'var(--card-p)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ color: 'var(--text-sub)', fontSize: '0.75rem', fontWeight: 850, textTransform: 'uppercase' }}>Academic Standing</span>
                       <span style={{ fontWeight: 950, fontSize: '1rem', color: levelData.color }}>{levelData.name}</span>
                    </div>
                    <div style={{ background: 'var(--bg-sub)', height: '6px', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
                       <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${progressToNext}%`, background: levelData.color, transition: 'width 1s ease-out' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ color: 'var(--text-sub)', fontSize: '0.75rem', fontWeight: 850, textTransform: 'uppercase' }}>Student ID number</span>
                       <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>{profile?.school_id || 'U-ID-01'}</span>
                    </div>
                 </div>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100%, 1fr))', gap: 'var(--gap-md)', marginBottom: '0.5rem' }}>
                 <div className="card-item" style={{ background: 'var(--surface)', borderRadius: '20px', padding: 'var(--section-p)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                       <h3 style={{ fontSize: '0.85rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-sub)', letterSpacing: '0.05em' }}>
                          <Fingerprint size={16} color="var(--brand)" /> 
                          Personal Statement
                       </h3>
                       {!isEditingBio ? (
                          <button 
                             onClick={() => setIsEditingBio(true)}
                             style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 800 }}
                          >
                             <Edit2 size={14} /> EDIT
                          </button>
                       ) : (
                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                             <button 
                                onClick={handleSaveBio}
                                disabled={isSaving}
                                style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 900 }}
                             >
                                <Check size={16} /> {isSaving ? 'SAVING...' : 'SAVE'}
                             </button>
                             <button 
                                onClick={() => {
                                   setIsEditingBio(false)
                                   setBioText(profile?.biography || '')
                                }}
                                style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 900 }}
                             >
                                <X size={16} /> CANCEL
                             </button>
                          </div>
                       )}
                    </div>
                    
                    {isEditingBio ? (
                       <textarea 
                          value={bioText}
                          onChange={(e) => setBioText(e.target.value)}
                          placeholder="Tell your team about your skills and goals..."
                          style={{ 
                             width: '100%', 
                             minHeight: '120px', 
                             background: 'var(--bg-sub)', 
                             border: '1px solid var(--border)', 
                             borderRadius: '12px', 
                             padding: '1rem', 
                             color: 'var(--text-main)', 
                             fontSize: '1rem', 
                             fontFamily: 'inherit',
                             resize: 'vertical',
                             outline: 'none'
                          }}
                       />
                    ) : (
                       <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)', lineHeight: 1.6, opacity: 0.9, fontWeight: 500 }}>
                          {profile?.biography || `A groupflow user working on collaborative projects. My contributions help my team succeed.`}
                       </p>
                    )}
                 </div>

               {profile?.stack && (
                  <div className="card-item" style={{ background: 'var(--surface)', borderRadius: '20px', padding: '1.75rem', border: '1px solid var(--border)' }}>
                     <h3 style={{ fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-sub)', letterSpacing: '0.05em' }}>
                        <Terminal size={16} color="var(--brand)" /> Technical Arsenal
                     </h3>
                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                        {profile.stack.split(',').map((tech, idx) => (
                           <span key={idx} style={{ 
                             padding: '0.5rem 1rem', 
                             background: 'rgba(var(--brand-rgb), 0.05)', 
                             border: '1px solid rgba(var(--brand-rgb), 0.1)', 
                             borderRadius: '10px', 
                             fontSize: '0.8rem', 
                             fontWeight: 850, 
                             color: 'var(--brand)',
                             transition: 'all 0.2s'
                           }}
                           onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(var(--brand-rgb), 0.1)'}
                           onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(var(--brand-rgb), 0.05)'}
                           >
                              {tech.trim()}
                           </span>
                        ))}
                     </div>
                  </div>
               )}
            </div>

         </div>

         {/* Credential Store */}
         <div className="card-item" style={{ maxWidth: '100%', marginTop: 'var(--gap-lg)', background: 'var(--surface)', borderRadius: '20px', padding: 'var(--section-p)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 950, letterSpacing: '-0.02em' }}>
                   <Award size={24} color="var(--brand)" />
                   Achievements & Awards
                </h3>
            </div>
            {(!profile?.badges_count) ? (
               <div style={{ textAlign: 'center', padding: '3rem 2rem', background: 'var(--bg-sub)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                  <BookOpen size={48} color="var(--text-sub)" style={{ opacity: 0.15, marginBottom: '1rem' }} />
                  <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', marginBottom: '1.5rem', fontWeight: 600 }}>Your group project achievements will appear here.</p>
                  <Link href="/dashboard" className="btn btn-primary" style={{ width: 'auto', padding: '0.8rem 2rem', fontWeight: 900 }}>Start First Task</Link>
               </div>
            ) : (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                  {[...Array(profile.badges_count)].map((_, i) => (
                     <div key={i} style={{ padding: '1.5rem 1rem', background: 'var(--bg-sub)', border: '1px solid var(--border)', borderRadius: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', transition: 'all 0.3s' }} className="badge-hover">
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 10px rgba(var(--brand-rgb), 0.3)' }}><Award size={24} /></div>
                        <div>
                           <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-main)' }}>MISSION #{i + 1}</div>
                           <div style={{ fontSize: '0.7rem', color: 'var(--success)', marginTop: '0.2rem', fontWeight: 800, letterSpacing: '0.05em' }}>VERIFIED_UPLINK</div>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>

         <style jsx>{`
            .badge-hover:hover { transform: translateY(-5px); border-color: var(--brand); background: var(--surface); }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
         `}</style>
      </div>
   )
}
