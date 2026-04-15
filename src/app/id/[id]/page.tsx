'use client'

import { useState, useEffect, use } from 'react'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { 
  User, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Award, 
  TrendingUp,
  FileCheck,
  ExternalLink
} from 'lucide-react'
import { ThemeProvider } from '@/context/ThemeContext'
import { usePresence } from '@/components/PresenceProvider'

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = use(params)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const { onlineUsers } = usePresence()
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    fetchData()
  }, [userId])

  const fetchData = async () => {
    setLoading(true)
    const [profileData, tasksData] = await Promise.all([
      supabase.from('profiles').select('*, groups(name, module_code)').eq('id', userId).single(),
      supabase.from('tasks').select('*').contains('assignees', [userId]).order('created_at', { ascending: false }).limit(5)
    ])

    if (profileData.data) setProfile(profileData.data)
    if (tasksData.data) setTasks(tasksData.data)
    setLoading(false)
  }

  const isOnline = onlineUsers.has(userId)

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0a' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#1a73e8', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }} />
          <p style={{ fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Retrieving Specialist Node...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0a', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '4rem', fontWeight: 900 }}>404</h1>
          <p>Specialist identity not found in the registry.</p>
        </div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '3rem', alignItems: 'center', marginBottom: '4rem' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '180px', height: '180px', borderRadius: '50%', background: 'var(--surface)', border: '4px solid var(--border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-lg)' }}>
                 {profile.avatar_url ? (
                   <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 ) : (
                   <User size={80} color="var(--text-sub)" />
                 )}
              </div>
              <div style={{ 
                position: 'absolute', bottom: '15px', right: '15px', width: '28px', height: '28px', 
                borderRadius: '50%', backgroundColor: isOnline ? 'var(--success)' : '#444', 
                border: '4px solid var(--bg-main)', boxShadow: isOnline ? '0 0 15px var(--success)' : 'none' 
              }} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--brand)', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '1rem' }}>
                <ShieldCheck size={18} />
                <span>Certified Specialist Profile</span>
              </div>
              <h1 style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '-0.05em', margin: 0, lineHeight: 0.9 }}>{profile.full_name || 'Anonymous Node'}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1.5rem', color: 'var(--text-sub)', fontSize: '1.1rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={18} />
                    <span>{profile.groups?.name || 'Independent Specialist'}</span>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp size={18} />
                    <span>Expertise Level: {profile.total_score > 500 ? 'Architect' : 'Lead Specialist'}</span>
                 </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
            <div style={{ background: 'var(--surface)', padding: '2.5rem', borderRadius: '32px', border: '1px solid var(--border)', textAlign: 'center' }}>
               <Award size={40} color="var(--brand)" style={{ marginBottom: '1rem' }} />
               <div style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{profile.total_score}</div>
               <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Validity Score</div>
            </div>
            <div style={{ background: 'var(--surface)', padding: '2.5rem', borderRadius: '32px', border: '1px solid var(--border)', textAlign: 'center' }}>
               <Zap size={40} color="#ff9800" style={{ marginBottom: '1rem' }} />
               <div style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{tasks.length}</div>
               <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Verified Nodes</div>
            </div>
            <div style={{ background: 'var(--surface)', padding: '2.5rem', borderRadius: '32px', border: '1px solid var(--border)', textAlign: 'center' }}>
               <Clock size={40} color="var(--text-sub)" style={{ marginBottom: '1rem' }} />
               <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '1rem' }}>{isOnline ? 'ACTIVE' : 'OFFLINE'}</div>
               <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', marginTop: '0.5rem' }}>Live Presence Status</div>
            </div>
          </div>

          <section style={{ background: 'var(--surface)', borderRadius: '32px', border: '1px solid var(--border)', padding: '3rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <FileCheck size={24} color="var(--brand)" /> 
               Execution Registry
            </h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
               {tasks.length === 0 ? (
                 <p style={{ color: 'var(--text-sub)', fontStyle: 'italic' }}>No certified contributions detected in the public log.</p>
               ) : (
                 tasks.map(task => (
                   <div key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: 'var(--bg-main)', borderRadius: '20px', border: '1px solid var(--border)' }}>
                      <div>
                         <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{task.title}</div>
                         <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '0.25rem' }}>Node Status: {task.status} • {new Date(task.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="badge badge-code" style={{ padding: '0.5rem 1rem' }}>Verified Execution</div>
                   </div>
                 ))
               )}
            </div>
          </section>

          <footer style={{ marginTop: '6rem', textAlign: 'center', opacity: 0.6 }}>
             <p style={{ fontSize: '0.9rem' }}>Academic Protocol ID: <strong>{profile.id}</strong></p>
             <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem' }}>
                <a href="#" style={{ color: 'var(--text-main)' }}><ExternalLink size={20} /></a>
                <a href="#" style={{ color: 'var(--text-main)' }}><User size={20} /></a>
             </div>
          </footer>

        </div>
      </div>
      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </ThemeProvider>
  )
}
