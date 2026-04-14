'use client'

import { useState, useMemo } from 'react'
import KanbanBoard from './KanbanBoard'
import CalendarView from './CalendarView'
import { LayoutDashboard, Calendar, History, Activity, Zap, TrendingUp, Award, UserCircle } from 'lucide-react'

export default function DashboardHome({ groupId, profile }: { groupId: string, profile: any }) {
  const [activeTab, setActiveTab ] = useState<'board' | 'calendar'>('board')

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
       {/* Personalized Ownership HUD */}
       <div className="glass" style={{ 
         padding: '1.5rem 2rem', 
         borderRadius: '24px', 
         background: 'linear-gradient(135deg, var(--bg-sub), var(--surface))', 
         border: '1px solid var(--border)',
         display: 'flex',
         justifyContent: 'space-between',
         alignItems: 'center',
         flexWrap: 'wrap',
         gap: '2rem',
         boxShadow: 'var(--shadow-lg)',
         animation: 'slideDown 0.4s ease-out'
       }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
             <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '3px solid var(--brand)', overflow: 'hidden', boxShadow: '0 0 15px rgba(var(--brand-rgb), 0.2)' }}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserCircle size={40} color="var(--text-sub)" />
                  </div>
                )}
             </div>
             <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>{greeting}, {profile?.full_name?.split(' ')[0] || 'Collaborator'}</h2>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em', marginTop: '0.25rem' }}>Your Technical Command</div>
             </div>
          </div>

          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
             <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-sub)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                   <Zap size={14} color="var(--brand)" /> Validity Score
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>{profile?.total_score || 0}</div>
             </div>
             <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-sub)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                   <TrendingUp size={14} color="var(--success)" /> Rank
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>Lead Dev</div>
             </div>
             <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-sub)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                   <Award size={14} color="#f59e0b" /> Achievements
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>14</div>
             </div>
          </div>
       </div>

       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
              {activeTab === 'board' ? 'Sprint Board' : 'Group Calendar'}
            </h1>
            <p style={{ color: 'var(--text-sub)', marginTop: '0.5rem', fontWeight: 500 }}>
              {activeTab === 'board' 
                ? 'Orchestrate tasks and track technical velocity in real-time.' 
                : 'Visualize deadlines and synchronize your team across the project timeline.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-main)', padding: '0.4rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
             <button 
               onClick={() => setActiveTab('board')}
               style={{
                 display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '10px',
                 background: activeTab === 'board' ? 'var(--brand)' : 'transparent',
                 color: activeTab === 'board' ? 'white' : 'var(--text-sub)',
                 border: 'none', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
               }}
             >
               <LayoutDashboard size={18} /> Board
             </button>
             <button 
               onClick={() => setActiveTab('calendar')}
               style={{
                 display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '10px',
                 background: activeTab === 'calendar' ? 'var(--brand)' : 'transparent',
                 color: activeTab === 'calendar' ? 'white' : 'var(--text-sub)',
                 border: 'none', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
               }}
             >
               <Calendar size={18} /> Calendar
             </button>
          </div>
       </div>

       <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
          {activeTab === 'board' ? <KanbanBoard groupId={groupId} /> : <CalendarView groupId={groupId} />}
       </div>

       <style jsx>{`
         @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
         @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
       `}</style>
    </div>
  )
}
