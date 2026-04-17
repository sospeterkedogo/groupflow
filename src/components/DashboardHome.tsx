'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import KanbanBoard from './KanbanBoard'
import CalendarView from './CalendarView'
import { LayoutDashboard, Calendar, Activity, Zap, TrendingUp, Award, UserCircle } from 'lucide-react'
import TaskModal from './TaskModal'
import { Profile } from '@/types/auth'
import { Group } from '@/types/database'
import { DashboardHomeProps } from '@/types/ui'
import { useProfile } from '@/context/ProfileContext'

export default function DashboardHome({ groupId }: { groupId: string }) {
  const router = useRouter()
  const { profile } = useProfile()
  const [activeTab, setActiveTab] = useState<'board' | 'calendar'>('board')
  const [greeting] = useState(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  })
  const [personalTaskCount, setPersonalTaskCount] = useState(0)
  const [group, setGroup] = useState<Group | null>(null)
  const [newTaskSignal, setNewTaskSignal] = useState(0)
  const [syncToken, setSyncToken] = useState(0)
  const handleCalendarTaskSaved = useCallback(async () => {
    setSyncToken(prev => prev + 1)
  }, [])
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])

  const fetchGroupDetails = useCallback(async () => {
    const { data } = await supabase.from('groups').select('*').eq('id', groupId).single()
    if (data) setGroup(data)
  }, [groupId, supabase])

  const fetchPersonalTaskCount = useCallback(async () => {
    if (!profile?.id || !groupId) return

    const { count, error } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId)
      .contains('assignees', [profile.id])
      .neq('status', 'Done')

    if (error) {
      console.warn('Silent failure on personal task count:', error.message)
      return
    }

    if (count !== null) setPersonalTaskCount(count)
  }, [profile, groupId, supabase])

  useEffect(() => {
    if (profile?.id && groupId) {
      void (async () => {
        await fetchPersonalTaskCount()
        await fetchGroupDetails()
      })()

      const channel = supabase.channel('personal_tasks_count')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `group_id=eq.${groupId}`
          },
          () => {
            void fetchPersonalTaskCount()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [profile?.id, groupId, fetchPersonalTaskCount, fetchGroupDetails, supabase])

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
    <div className="page-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
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
              <img src={profile.avatar_url} alt={profile.full_name ? `${profile.full_name} profile picture` : 'Profile avatar'} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '20px' }}>
                <UserCircle size={40} color="var(--text-sub)" />
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 className="fluid-h1" style={{ fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '8px' }}>
              {greeting}, {profile?.full_name?.split(' ')[0] || 'there'}
            </h2>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
               <span style={{ color: 'var(--brand)', textTransform: 'uppercase' }}>{profile?.role || 'SCHOLAR'}</span>
               <span style={{ opacity: 0.3 }} className="mobile-hide">•</span>
               <span>{profile?.group_id ? `${personalTaskCount} RESEARCH OBJECTIVES` : 'NO ACTIVE PROJECT TRACK'}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%', justifyContent: 'flex-start' }}>
          {[
            { icon: <Zap size={16} />, label: 'Impact Index', value: profile?.total_score || 0, color: 'var(--brand)', badge: 'TOP 5%', tip: 'Cumulative contribution score' },
            { icon: <TrendingUp size={16} />, label: 'Standing', value: profile?.rank || 'Senior Scholar', color: 'var(--success)', tip: 'Based on verified academic output' },
            { icon: <Award size={16} />, label: 'Credentials', value: profile?.badges_count ?? 0, color: '#f59e0b', tip: 'Verified milestones and project honors' }
          ].map((stat, i) => (
            <div key={i} className="stat-pill" data-tooltip={stat.tip} style={{
              padding: '0.75rem 1rem', borderRadius: '18px', background: 'var(--bg-main)', border: '1px solid var(--border)', flex: '1 1 120px',
              transition: 'transform 0.3s ease', minWidth: '100px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-sub)', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
                <span style={{ color: stat.color, filter: 'drop-shadow(0 0 5px currentColor)' }}>{stat.icon}</span> {stat.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)' }}>{stat.value}</div>
                {stat.badge && <span className="mobile-hide" style={{ fontSize: '0.55rem', color: stat.color, fontWeight: 900, padding: '2px 6px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '6px' }}>{stat.badge}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {!profile.subscription_plan && (
        <div style={{ padding: '1rem 1.25rem', borderRadius: '22px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>Support the project mission</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', marginTop: '0.25rem' }}>Help bring GroupFlow to more schools by upgrading to Pro or Premium.</div>
          </div>
          <button
            className="btn-sm btn-primary"
            style={{ padding: '0.8rem 1.2rem', borderRadius: '16px' }}
            onClick={() => router.push('/dashboard/upgrade')}
          >
            Access Tiers
          </button>
        </div>
      )}

      {profile.subscription_plan && (
        <div style={{ padding: '1rem 1.25rem', borderRadius: '22px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>Active plan: {profile.subscription_plan}</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', marginTop: '0.25rem' }}>Your pre-registration is active and your access is secured.</div>
          </div>
          <button
            className="btn-sm btn-secondary"
            style={{ padding: '0.8rem 1.2rem', borderRadius: '16px' }}
            onClick={() => router.push('/dashboard/upgrade')}
          >
            Manage Plan
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
         <div className="stat-pill" style={{ padding: '0.6rem 1rem', borderRadius: '14px', background: 'var(--bg-sub)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }} data-tooltip="Team activity right now">
            <Activity size={16} color="var(--brand)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>SYSTEM STATUS: <span style={{ color: 'var(--success)' }}>OPTIMAL SYNC</span></span>
         </div>
         <div style={{ flex: 1 }} />
         {/* Quick Action Pill Bar */}
         <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
               className="btn-sm btn-primary btn-inline" 
               style={{ padding: '0.5rem 1rem' }} 
               data-tooltip="Add a new task"
               onClick={() => setNewTaskSignal(prev => prev + 1)}
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
               {activeTab === 'board' ? 'Research Canvas' : 'Project Timeline'}
             </h1>
             {group && (
               <div className="badge badge-code" style={{ padding: '0.4rem 0.8rem', background: 'var(--bg-sub)', color: 'var(--brand)', border: '1px solid var(--brand)', fontSize: '0.8rem' }}>
                 ACADEMIC TRACK: {(group.name || 'Unknown').toUpperCase()} ({group.module_code || 'UNIT'})
               </div>
             )}
          </div>
          <p style={{ color: 'var(--text-sub)', marginTop: '0.6rem', fontWeight: 600, fontSize: '1rem' }}>
            {activeTab === 'board'
              ? 'Coordinate collaborative research and task distribution'
              : 'Monitor institutional deadlines and project phases'}
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
          ? <KanbanBoard groupId={groupId} key={`board-${syncToken}`} profile={profile} newTaskSignal={newTaskSignal} /> 
          : <CalendarView groupId={groupId} key={`cal-${syncToken}`} onTaskSaved={handleCalendarTaskSaved} />
        }
      </div>

      {/* Board task creation is handled inside the KanbanBoard room so the modal works reliably. */}

      <style jsx>{`
         .hud-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); border-color: var(--brand); }
         .stat-pill:hover { transform: scale(1.03); background: var(--surface); border-color: var(--brand); }
         @media (max-width: 768px) {
           .mobile-hide { display: none !important; }
           .hud-card { padding: 1.25rem !important; }
         }
       `}</style>
    </div>
  )
}
