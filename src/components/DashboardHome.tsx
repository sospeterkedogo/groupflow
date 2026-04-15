'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import KanbanBoard from './KanbanBoard'
import CalendarView from './CalendarView'
import { LayoutDashboard, Calendar, History, Activity, Zap, TrendingUp, Award, UserCircle } from 'lucide-react'
import TaskModal from './TaskModal'
import { useRouter } from 'next/navigation'

export default function DashboardHome({ groupId, profile }: { groupId: string, profile: any }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'board' | 'calendar'>('board')
  const [greeting, setGreeting] = useState('Welcome')
  const [personalTaskCount, setPersonalTaskCount] = useState(0)
  const [group, setGroup] = useState<any>(null)
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)
  const [syncToken, setSyncToken] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')

    if (profile?.id && groupId) {
      fetchPersonalTaskCount()
      fetchGroupDetails()
      
      // Real-time subscription for personalized task count
      const channel = supabase.channel('personal_tasks_count')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'tasks',
          filter: `group_id=eq.${groupId}` 
        }, () => {
          fetchPersonalTaskCount()
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
  }, [profile?.id, groupId])

  const fetchGroupDetails = async () => {
    const { data } = await supabase.from('groups').select('*').eq('id', groupId).single()
    if (data) setGroup(data)
  }

  const fetchPersonalTaskCount = async () => {
    if (!profile?.id || !groupId) return
    const { count } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId)
      .filter('assignees', 'cs', `{"${profile.id}"}`)
      .neq('status', 'Done')
    
    if (count !== null) setPersonalTaskCount(count)
  }

  if (!profile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="skeleton" style={{ height: '140px', borderRadius: '24px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-title" style={{ width: '40%' }} />
            <div className="skeleton skeleton-text" style={{ width: '60%' }} />
          </div>
          <div className="skeleton" style={{ width: '200px', height: '50px', borderRadius: '14px' }} />
        </div>
        <div className="skeleton" style={{ height: '400px', borderRadius: '24px' }} />
      </div>
    )
  }

  return (
    <div className="page-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Personalized Ownership HUD */}
      <div className="hud-card" style={{
        padding: '1.5rem 2rem',
        borderRadius: '24px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '2rem',
        boxShadow: 'var(--shadow-md)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative glow */}
        <div style={{ position: 'absolute', top: -50, right: -50, width: '150px', height: '150px', background: 'var(--brand)', filter: 'blur(80px)', opacity: 0.05, pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '24px', border: '2px solid var(--border)', background: 'var(--bg-sub)', padding: '2px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transform: 'rotate(-3deg)' }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '20px' }}>
                <UserCircle size={40} color="var(--text-sub)" />
              </div>
            )}
          </div>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '6px' }}>{greeting}, {profile?.full_name?.split(' ')[0] || 'there'}</h2>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <span style={{ color: 'var(--brand)' }}>TEAM LEADER</span>
               <span style={{ opacity: 0.3 }}>•</span>
               <span>{profile?.group_id ? `${personalTaskCount} ACTIVE TASKS TO DO` : 'NO ACTIVE PROJECT'}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {[
            { icon: <Zap size={16} />, label: 'Points Earned', value: profile?.total_score || 0, color: 'var(--brand)', badge: 'TOP 5%', tip: 'Total points from your work' },
            { icon: <TrendingUp size={16} />, label: 'Current Level', value: 'Senior', color: 'var(--success)', tip: 'Based on your recent work speed' },
            { icon: <Award size={16} />, label: 'Achievements', value: 14, color: '#f59e0b', tip: 'Badges earned for helping and quality' }
          ].map((stat, i) => (
            <div key={i} className="stat-pill" data-tooltip={stat.tip} style={{
              padding: '0.75rem 1.25rem', borderRadius: '18px', background: 'var(--bg-main)', border: '1px solid var(--border)', minWidth: '140px',
              transition: 'transform 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-sub)', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
                <span style={{ color: stat.color, filter: 'drop-shadow(0 0 5px currentColor)' }}>{stat.icon}</span> {stat.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)' }}>{stat.value}</div>
                {stat.badge && <span style={{ fontSize: '0.6rem', color: stat.color, fontWeight: 900, padding: '2px 6px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '6px' }}>{stat.badge}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
         <div className="stat-pill" style={{ padding: '0.6rem 1rem', borderRadius: '14px', background: 'var(--bg-sub)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }} data-tooltip="Team activity right now">
            <Activity size={16} color="var(--brand)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>LIVE STATUS: <span style={{ color: 'var(--success)' }}>VERY ACTIVE</span></span>
         </div>
         <div style={{ flex: 1 }} />
         {/* Quick Action Pill Bar */}
         <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
               className="btn-sm btn-primary btn-inline" 
               style={{ padding: '0.5rem 1rem' }} 
               data-tooltip="Add a new task"
               onClick={() => setIsNewTaskModalOpen(true)}
            >+ New Task</button>
            <button 
               className="btn-sm btn-secondary btn-inline" 
               style={{ padding: '0.5rem 1rem' }} 
               data-tooltip="View activity and files"
               onClick={() => router.push(`/dashboard/analytics/${groupId}`)}
            >Activity</button>
            <button 
               className="btn-sm btn-ghost btn-inline" 
               style={{ padding: '0.5rem 1rem', background: 'var(--bg-sub)' }} 
               data-tooltip="Update the board"
               onClick={() => setSyncToken(prev => prev + 1)}
            >Sync Board</button>
         </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginTop: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em', margin: 0, lineHeight: 1 }}>
               {activeTab === 'board' ? 'Task Board' : 'Timeline'}
             </h1>
             {group && (
               <div className="badge badge-code" style={{ padding: '0.4rem 0.8rem', background: 'var(--bg-sub)', color: 'var(--brand)', border: '1px solid var(--brand)', fontSize: '0.8rem' }}>
                 ACTIVE TEAM: {group.name.toUpperCase()} ({group.module_code || 'LAB'})
               </div>
             )}
          </div>
          <p style={{ color: 'var(--text-sub)', marginTop: '0.6rem', fontWeight: 600, fontSize: '1rem' }}>
            {activeTab === 'board'
              ? 'Organize your team work'
              : 'Keep track of important dates'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg-sub)', padding: '0.4rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <button
            onClick={() => setActiveTab('board')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 1.5rem', borderRadius: '12px',
              background: activeTab === 'board' ? 'var(--brand)' : 'transparent',
              color: activeTab === 'board' ? 'white' : 'var(--text-sub)',
              border: 'none', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: activeTab === 'board' ? '0 8px 20px -6px var(--brand)' : 'none'
            }}
          >
            <LayoutDashboard size={18} /> Board
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 1.5rem', borderRadius: '12px',
              background: activeTab === 'calendar' ? 'var(--brand)' : 'transparent',
              color: activeTab === 'calendar' ? 'white' : 'var(--text-sub)',
              border: 'none', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: activeTab === 'calendar' ? '0 8px 20px -6px var(--brand)' : 'none'
            }}
          >
            <Calendar size={18} /> Calendar
          </button>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        {activeTab === 'board' 
          ? <KanbanBoard groupId={groupId} key={`board-${syncToken}`} /> 
          : <CalendarView groupId={groupId} key={`cal-${syncToken}`} />
        }
      </div>

      {isNewTaskModalOpen && (
        <TaskModal 
          task={null} 
          groupId={groupId} 
          onClose={() => setIsNewTaskModalOpen(false)} 
          onRefresh={() => fetchPersonalTaskCount()} 
        />
      )}

      <style jsx>{`
         .hud-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); border-color: var(--brand); }
         .stat-pill:hover { transform: scale(1.03); background: var(--surface); border-color: var(--brand); }
       `}</style>
    </div>
  )
}
