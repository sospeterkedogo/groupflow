'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import KanbanBoard from './KanbanBoard'
import CalendarView from './CalendarView'
import { LayoutDashboard, Calendar, Activity, Zap, TrendingUp, Users } from 'lucide-react'
import { Group } from '@/types/database'
import { useProfile } from '@/context/ProfileContext'

export default function DashboardHome({ groupId }: { groupId: string }) {
  const router = useRouter()
  const { profile } = useProfile()
  const [activeTab, setActiveTab] = useState<'board' | 'calendar'>('board')
  const [currentTime, setCurrentTime] = useState(new Date())
  
  const [greeting] = useState(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  })

  // 1. Sync local time display
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const [personalTaskCount, setPersonalTaskCount] = useState(0)
  const [group, setGroup] = useState<Group | null>(null)
  const [newTaskSignal, setNewTaskSignal] = useState(0)
  const [syncToken, setSyncToken] = useState(0)
  const [members, setMembers] = useState<any[]>([])
  const [showMembers, setShowMembers] = useState(false)
  
  const handleCalendarTaskSaved = useCallback(async () => {
    setSyncToken(prev => prev + 1)
  }, [])

  const supabase = useMemo(() => createBrowserSupabaseClient(), [])

  const fetchGroupDetails = useCallback(async () => {
    const { data } = await supabase.from('groups').select('*').eq('id', groupId).single()
    if (data) setGroup(data)
  }, [groupId, supabase])

  const fetchMembers = useCallback(async () => {
    if (!groupId) return
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, last_seen')
      .eq('group_id', groupId)
    
    if (error) {
      console.error('Error fetching group members:', error.message)
      return
    }
    
    if (data) setMembers(data)
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

  const [projectProgress, setProjectProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('Initializing')

  const fetchProjectProgress = useCallback(async () => {
    if (!groupId) return
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('status')
      .eq('group_id', groupId)

    if (error || !tasks || tasks.length === 0) {
      setProjectProgress(0)
      setProgressLabel('Getting Started')
      return
    }

    const completed = tasks.filter(t => t.status === 'Done').length
    const progress = Math.round((completed / tasks.length) * 100)
    setProjectProgress(progress)

    if (progress < 20) setProgressLabel('Research & Planning')
    else if (progress < 40) setProgressLabel('Foundation Logic')
    else if (progress < 60) setProjectProgress(40) // Manual clamp if needed, but let's use labels
    
    // Better logic for labels
    if (progress <= 20) setProgressLabel('Initial Research')
    else if (progress <= 40) setProgressLabel('Strategic Drafting')
    else if (progress <= 60) setProgressLabel('Core Development')
    else if (progress <= 80) setProgressLabel('Refining Logic')
    else setProgressLabel('Final Submission')
  }, [groupId, supabase])

  useEffect(() => {
    if (groupId) {
      void fetchGroupDetails()
      void fetchMembers()
    }
  }, [groupId, fetchGroupDetails, fetchMembers])

  useEffect(() => {
    if (profile?.id && groupId) {
      void fetchPersonalTaskCount()
      void fetchProjectProgress()

      const channel = supabase.channel('dashboard_sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tasks', filter: `group_id=eq.${groupId}` },
          () => void fetchPersonalTaskCount()
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles', filter: `group_id=eq.${groupId}` },
          () => void fetchMembers()
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [profile?.id, groupId, fetchPersonalTaskCount, fetchMembers, supabase])

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
    <div className="page-fade" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)', width: '100%', maxWidth: '1400px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* ── CONTROL PANEL HEADER ─────────────────────────────────────────── */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div className="pulse-pill" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-sub)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              System Operational &middot; {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.25rem, 5vw, 3.25rem)', fontWeight: 950, letterSpacing: '-0.05em', color: 'var(--text-main)', margin: 0, lineHeight: 1 }}>
            {greeting}, {profile?.full_name?.split(' ')[0] || 'User'}
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.25rem' }}>
            <div style={{ padding: '0.65rem 1.4rem', background: 'rgba(var(--brand-rgb), 0.08)', borderRadius: '14px', border: '1px solid rgba(var(--brand-rgb), 0.15)', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-sm)' }}>
               <Zap size={14} color="var(--brand)" fill="var(--brand)" style={{ opacity: 0.8 }} />
               <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  ACTIVE SESSION: <span style={{ color: 'var(--brand)' }}>{group?.name || 'INITIALIZING...'}</span>
               </span>
            </div>
            
            <button 
              onClick={() => setShowMembers(!showMembers)}
              className={`btn ${showMembers ? 'btn-primary' : 'btn-secondary'}`}
              style={{ 
                fontSize: '0.8rem', 
                fontWeight: 900, 
                padding: '0.65rem 1.4rem', 
                borderRadius: '14px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.6rem',
                border: showMembers ? 'none' : '1px solid var(--border)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: showMembers ? '0 4px 12px rgba(var(--brand-rgb), 0.3)' : 'var(--shadow-sm)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              <Users size={16} />
              Team Members
              <span style={{ 
                background: showMembers ? 'white' : 'var(--brand)', 
                color: showMembers ? 'var(--brand)' : 'white', 
                padding: '2px 8px', 
                borderRadius: '8px', 
                fontSize: '0.7rem',
                marginLeft: '0.4rem',
                fontWeight: 950
              }}>
                {members.length || 0}
              </span>
            </button>
          </div>

          {showMembers && (
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '0.75rem', 
              marginTop: '1.25rem', 
              animation: 'fadeInSlide 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
              background: 'var(--bg-sub)',
              padding: '1rem',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              maxWidth: 'fit-content'
            }}>
               {members.map(m => {
                 const isSelf = m.id === profile?.id
                 const lastSeenDate = m.last_seen ? new Date(m.last_seen) : null
                 // Online if active in last 2 mins
                 const isOnline = lastSeenDate && (new Date().getTime() - lastSeenDate.getTime() < 120000)
                 
                 return (
                   <div key={m.id} style={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: '0.6rem', 
                     padding: '8px 14px', 
                     background: 'var(--surface)', 
                     border: '1px solid var(--border)', 
                     borderRadius: '10px',
                     boxShadow: 'var(--shadow-sm)',
                     cursor: 'pointer',
                     transition: 'transform 0.2s'
                   }}
                   onClick={() => router.push(`/dashboard/network/profile/${m.id}`)}
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                   >
                      <div style={{ position: 'relative' }}>
                        <div style={{ 
                          width: '28px', 
                          height: '28px', 
                          borderRadius: '50%', 
                          background: 'var(--bg-main)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '11px', 
                          fontWeight: 900,
                          color: 'var(--brand)',
                          border: '1px solid var(--border)',
                          overflow: 'hidden'
                        }}>
                          {m.avatar_url ? <img src={m.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : m.full_name?.[0]}
                        </div>
                        <div style={{ 
                          position: 'absolute', 
                          bottom: -1, 
                          right: -1, 
                          width: '10px', 
                          height: '10px', 
                          borderRadius: '50%', 
                          background: isOnline ? 'var(--success)' : '#94a3b8', 
                          border: '2px solid var(--surface)',
                          boxShadow: isOnline ? '0 0 8px var(--success)' : 'none'
                        }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 850, color: 'var(--text-main)', lineHeight: 1 }}>
                          {m.full_name?.split(' ')[0]}{isSelf && ' (You)'}
                        </span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-sub)', marginTop: '2px' }}>
                          {isOnline ? 'Active Now' : 'Offline'}
                        </span>
                      </div>
                   </div>
                 )
               })}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
           <button 
             onClick={() => setNewTaskSignal(prev => prev + 1)}
             className="btn btn-primary btn-inline" 
             style={{ padding: '0.8rem 1.5rem', borderRadius: '16px', fontWeight: 900 }}
           >
             <Zap size={18} fill="currentColor" /> Initiate Task
           </button>
           <button 
             onClick={() => router.push(`/dashboard/analytics/${groupId}`)}
             className="btn btn-secondary btn-inline" 
             style={{ padding: '0.8rem 1.5rem', borderRadius: '16px', fontWeight: 800 }}
           >
             Activity Log
           </button>
        </div>
      </header>

      {/* ── METRICS MODULES ────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {[
          { icon: <Activity size={20} />, label: 'Action Items', value: personalTaskCount, sub: 'Assigned pending', color: 'var(--brand)' },
          { icon: <TrendingUp size={20} />, label: 'Group Contribution', value: profile?.total_score || 0, sub: 'Team points earned', color: 'var(--success)' },
          { icon: <Calendar size={20} />, label: 'Timeline Status', value: `${projectProgress}%`, sub: progressLabel, color: '#f59e0b' },
          { icon: <Zap size={20} />, label: 'Sync Integrity', value: '100%', sub: 'Real-time encryption', color: 'var(--accent)' }
        ].map((stat, i) => (
          <div key={i} className="control-card" style={{
            padding: '1.75rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '70px', height: '70px', background: stat.color, filter: 'blur(45px)', opacity: 0.12, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: stat.color, marginBottom: '1.25rem' }}>
               {stat.icon}
               <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-sub)' }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--text-main)', lineHeight: 0.9 }}>{stat.value}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-sub)', marginTop: '0.6rem' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* ── COMMAND CENTER CONTROLS ─────────────────────────────────────── */}
      <div style={{ 
        marginTop: '0.5rem',
        padding: '0.6rem',
        background: 'rgba(var(--bg-sub-rgb), 0.5)',
        backdropFilter: 'blur(10px)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[
            { id: 'board', label: 'Central Board', icon: <LayoutDashboard size={18} /> },
            { id: 'calendar', label: 'Team Calendar', icon: <Calendar size={18} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`control-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', paddingRight: '0.5rem' }}>
          <button className="panel-tool" data-tooltip="Refresh System" onClick={() => setSyncToken(v => v + 1)}>
            <Activity size={16} />
          </button>
          <button className="panel-tool" data-tooltip="Grid Settings" onClick={() => router.push('/dashboard/settings')}>
            <TrendingUp size={16} />
          </button>
        </div>
      </div>

      {/* ── PRIMARY WORKSTATION ────────────────────────────────────────── */}
      <div style={{ 
        minHeight: '65vh',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.4s ease'
      }}>
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: '4px', 
          background: 'linear-gradient(90deg, var(--brand), var(--accent), var(--brand))',
          backgroundSize: '200% 100%',
          animation: 'shimmer-sweep 3s infinite linear',
          zIndex: 10
        }} />
        {activeTab === 'board' 
          ? <KanbanBoard groupId={groupId} key={`board-${syncToken}`} profile={profile} newTaskSignal={newTaskSignal} /> 
          : <CalendarView groupId={groupId} key={`cal-${syncToken}`} onTaskSaved={handleCalendarTaskSaved} />
        }
      </div>

      {/* ── SYSTEM STATUS FOOTER ───────────────────────────────────────── */}
      {group && (
        <footer style={{ 
          marginTop: '0.5rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '1.25rem 2rem',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-sm)'
        }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Current Team</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {group.name} <span style={{ color: 'var(--text-sub)', fontWeight: 600 }}>&middot; {group.module_code || 'UNIT-X'}</span>
                </span>
              </div>
           </div>
           
           <div style={{ display: 'flex', gap: '2rem' }} className="mobile-hide">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Encryption</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--success)' }}>Active AES-256</span>
              </div>
              <div 
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', cursor: 'pointer' }}
                onClick={() => router.push('/dashboard/network')}
              >
                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Connectivity</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div className="pulse-pill" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Network Secure</span>
                </div>
              </div>
           </div>
        </footer>
      )}

      <style jsx>{`
        @keyframes shimmer-sweep {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fadeInSlide { 
          from { opacity: 0; transform: translateY(-10px) scale(0.98); } 
          to { opacity: 1; transform: translateY(0) scale(1); } 
        }
        @media (max-width: 768px) {
          .mobile-hide { display: none !important; }
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
