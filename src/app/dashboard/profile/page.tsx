'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { UserCircle, MapPin, Activity, Award } from 'lucide-react'

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

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading parameters...</div>
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
       <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
         <UserCircle size={28} color="var(--primary-color)" />
         <h1 style={{ fontSize: '2rem', margin: 0, fontWeight: 800 }}>Network Identity</h1>
       </div>
       
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          {/* Identity Card */}
          <div className="auth-card" style={{ margin: 0, maxWidth: '100%' }}>
             <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Algorithm Metrics</h2>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                   <span style={{ color: 'var(--text-secondary)' }}>Registered Alias</span>
                   <strong style={{ fontSize: '1.1rem' }}>{profile?.full_name || 'Anonymous Configuration'}</strong>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                   <span style={{ color: 'var(--text-secondary)' }}>Authentication</span>
                   <strong>{profile?.email || 'Github OAuth Active'}</strong>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ color: 'var(--text-secondary)' }}>Module Assignment</span>
                   {profile?.groups ? (
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <MapPin size={16} color="var(--accent-color)" />
                       <strong>{profile.groups.module_code}</strong>
                     </div>
                   ) : (
                     <span style={{ color: 'var(--warning-color)' }}>Unassigned Node</span>
                   )}
                </div>
             </div>
          </div>
          
          {/* Score Card */}
          <div className="auth-card" style={{ margin: 0, maxWidth: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--accent-color)' }}>
             <Award size={48} color="var(--accent-color)" style={{ marginBottom: '1rem' }} />
             <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>Global Validity Score</h3>
             <span style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--text-color)', lineHeight: 1.2 }}>
                {profile?.total_score || 0}
             </span>
             <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                Mathematical representation of your Github Execution and Peer Pipeline efficiency.
             </p>
          </div>
          
       </div>
    </div>
  )
}
