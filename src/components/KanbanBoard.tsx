'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { FileUp, GitCommit, AlertCircle } from 'lucide-react'
import { Task, TaskStatus, Profile } from '@/types/database'

type MemberProfileStats = {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  total_score: number
  role: string
}
import TaskModal from './TaskModal'
import confetti from 'canvas-confetti'
import { distributeTaskScore } from '@/app/dashboard/actions'
import { usePresence } from './PresenceProvider'
import TeamChat from './TeamChat'
import { logActivity } from '@/utils/logging'
import MemberProfileModal from './MemberProfileModal'

const COLUMNS: TaskStatus[] = ['To Do', 'In Progress', 'In Review', 'Done']

export default function KanbanBoard({ groupId }: { groupId: string }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [groupMembers, setGroupMembers] = useState<MemberProfileStats[]>([])
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [boardError, setBoardError] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60000)
    return () => window.clearInterval(interval)
  }, [])
  
  // Modal Orchestration State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedMember, setSelectedMember] = useState<any>(null)
  
  const supabase = useMemo(() => createClient(), [])
  const { onlineUsers } = usePresence()

  const fetchTasks = useCallback(async () => {
    setBoardError(null)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      
    if (error) {
      console.error('Task fetch error:', error)
      setBoardError('Failed to synchronize tasks with the server.')
    }
    
    if (data) setTasks(data as Task[])
    setLoading(false)
  }, [supabase, groupId])

  const fetchGroupMembers = useCallback(async () => {
     const { data } = await supabase
       .from('profiles')
       .select('id, full_name, email, avatar_url, role, total_score')
       .eq('group_id', groupId)
       
     if (data) {
       setGroupMembers(data.map(item => ({
         id: item.id,
         full_name: item.full_name ?? null,
         email: item.email ?? null,
         avatar_url: item.avatar_url ?? null,
         role: item.role ?? 'Member',
         total_score: typeof item.total_score === 'number' ? item.total_score : 0,
       })))
     }
  }, [supabase, groupId])

  const fetchCurrentUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setCurrentUserProfile(data)
    }
  }, [supabase])

  useEffect(() => {
    fetchTasks()
    fetchGroupMembers()
    fetchCurrentUser()
    
    const channel = supabase
      .channel('tasks_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `group_id=eq.${groupId}`
        },
        () => {
          fetchTasks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTasks, fetchGroupMembers, fetchCurrentUser, groupId, supabase])

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() 
    e.currentTarget.classList.add('drag-over')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drag-over')
  }

  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')
    
    const taskId = e.dataTransfer.getData('taskId')
    if (!taskId) return

    // Optimistically update UI
    const originalTasks = [...tasks]
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))

    // Update DB
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)

    if (error) {
       console.error("Failed to move task", error)
       setTasks(originalTasks) // Revert on failure
       setBoardError(`Could not move task: ${error.message}`)
       setTimeout(() => setBoardError(null), 5000)
    } else if (newStatus === 'Done') {
       // Fire secure anti-farming Score Node pipeline
       const targetTask = originalTasks.find(t => t.id === taskId)
       if (targetTask && targetTask.assignees) {
          distributeTaskScore(taskId, targetTask.assignees).catch(err => console.error("Score Distribution error", err))
       }
    }

    // Verifiable Logging
    if (!error && currentUserProfile) {
       logActivity(
          currentUserProfile.id,
          groupId,
          'task_updated',
          `Moved task to ${newStatus}`,
          { task_id: taskId, new_status: newStatus }
       )
    }
  }

  // ALGORITHMIC COMPLETION ENGINE (Enhanced with Evidence Weight)
  const calculateProbability = (task: Task) => {
     if (task.status === 'Done') return 100
     let base = task.status === 'In Review' ? 85 : task.status === 'In Progress' ? 50 : 10
     
     // 1. Evidence Boost (Max +15% for comprehensive documentation)
     const artifactBoost = Math.min((task.artifacts?.length || 0) * 5, 15)
     base += artifactBoost

     if (task.due_date) {
        const remainingHours = (new Date(task.due_date).getTime() - now) / (1000 * 60 * 60)
        if (remainingHours < 0) {
            base = Math.max(0, base - 50) 
        } else if (remainingHours < 48) {
            base = Math.max(0, base - 10) 
        }
     }
     return Math.min(base, 99) // Cannot reach 100 without being 'Done'
  }

  const globalProbability = tasks.length > 0 
    ? Math.round(tasks.reduce((acc, t) => acc + calculateProbability(t), 0) / tasks.length)
    : 0

  const overdueCount = tasks.filter(t => t.due_date && new Date(t.due_date).getTime() < now && t.status !== 'Done').length
  const [hasCelebrated, setHasCelebrated] = useState(false)

  // IMMERSIVE GAMIFICATION REWARD MATRIX
  useEffect(() => {
     const sessionKey = `celebrated_${groupId}`
     const alreadyCelebrated = sessionStorage.getItem(sessionKey)

     if (tasks.length > 0 && globalProbability === 100 && !hasCelebrated && !alreadyCelebrated) {
        setHasCelebrated(true)
        sessionStorage.setItem(sessionKey, 'true')
        const duration = 3000
        const end = Date.now() + duration

        const frame = () => {
          confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0 }, colors: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#ffffff'] })
          confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1 }, colors: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#ffffff'] })
          if (Date.now() < end) requestAnimationFrame(frame)
        }
        frame()
     } else if (tasks.length > 0 && globalProbability < 100) {
        setHasCelebrated(false)
        sessionStorage.removeItem(sessionKey) // ONLY reset if they add more tasks (pipeline actually decays)
     }
  }, [globalProbability, tasks.length, hasCelebrated, groupId])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', marginTop: '1rem' }}>
        {/* HUD skeleton */}
        <div className="skeleton" style={{ height: '110px', borderRadius: '16px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skeleton skeleton-title" style={{ width: '30%', margin: 0 }} />
          <div className="skeleton" style={{ width: '100px', height: '38px', borderRadius: '14px' }} />
        </div>
        {/* Columns skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="skeleton skeleton-title" style={{ width: '40%', height: '1.2rem', marginBottom: '0.2rem' }} />
              <div className="skeleton skeleton-card" style={{ height: '120px' }} />
              {i % 2 === 0 && <div className="skeleton skeleton-card" style={{ height: '90px' }} />}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {boardError && (
        <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
           <AlertCircle size={16} />
           <span>{boardError}</span>
        </div>
      )}
      
      {/* Master Milestone HUD */}
      <div style={{ backgroundColor: 'var(--bg-sub)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '0.5rem' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
             <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Project Progress</h3>
             {overdueCount > 0 && (
               <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <AlertCircle size={14} /> {overdueCount} Overdue Tasks
               </span>
             )}
         </div>
         <div style={{ width: '100%', backgroundColor: 'var(--surface)', height: '12px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ width: `${globalProbability}%`, height: '100%', backgroundColor: globalProbability < 30 ? 'var(--error)' : 'var(--brand)', transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
         </div>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-sub)', fontWeight: 600 }}>Overall Progress: <span style={{ color: 'var(--text-main)' }}>{globalProbability}%</span></span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-sub)', fontWeight: 600 }}>{tasks.length} Tasks</span>
         </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-sub)' }}>Drag and drop tasks. Progress updates automatically based on deadlines.</p>
        <button className="btn btn-primary" onClick={() => { setSelectedTask(null); setIsModalOpen(true); }} style={{ width: 'auto' }}>
           + New Task
        </button>
      </div>

      <div className="kanban-board scroll-x-allowed">
        {COLUMNS.map((col) => (
          <div key={col} className="kanban-column">
            <div className="kanban-column-header">
              {col}
              <span className="badge" style={{ backgroundColor: 'var(--bg-sub)', color: 'var(--text-sub)' }}>
                {tasks.filter(t => t.status === col).length}
              </span>
            </div>
            
            <div 
              className="kanban-task-list"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col)}
            >
              {tasks.filter(t => t.status === col).map(task => (
                <div 
                  key={task.id} 
                  className="kanban-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onClick={() => { setSelectedTask(task); setIsModalOpen(true); }}
                >
                  <div className="kanban-card-title">{task.title}</div>
                  
                  {/* DYNAMIC PROGRESS BAR */}
                  <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <span>Completion Chance</span>
                      <span style={{ color: calculateProbability(task) < 30 ? 'var(--error)' : 'var(--text-sub)' }}>
                        {calculateProbability(task)}% 
                        {(task.artifacts?.length ?? 0) > 0 && <span style={{ color: 'var(--success)', marginLeft: '0.25rem', fontSize: '0.6rem' }}>(+{Math.min((task.artifacts?.length ?? 0) * 5, 15)}% Boost)</span>}
                      </span>
                    </div>
                    <div style={{ width: '100%', backgroundColor: 'var(--bg-sub)', height: '4px', borderRadius: '4px' }}>
                      <div style={{ width: `${calculateProbability(task)}%`, height: '100%', backgroundColor: calculateProbability(task) < 30 ? 'var(--error)' : calculateProbability(task) === 100 ? 'var(--success)' : 'var(--brand)', borderRadius: '4px', transition: 'width 0.4s ease' }}></div>
                    </div>
                  </div>

                  <div className="kanban-card-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span 
                        className="badge" 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.25rem',
                          background: task.category === 'Implementation' ? 'rgba(var(--brand-rgb), 0.1)' : 
                                      task.category === 'Architecture' ? 'rgba(139, 92, 246, 0.1)' :
                                      task.category === 'UX/UI Design' ? 'rgba(236, 72, 153, 0.1)' :
                                      task.category === 'Quality Assurance' ? 'rgba(16, 185, 129, 0.1)' :
                                      task.category === 'Research' ? 'rgba(245, 158, 11, 0.1)' :
                                      task.category === 'Mentorship' ? 'rgba(99, 102, 241, 0.1)' :
                                      task.category === 'Documentation' ? 'rgba(100, 116, 139, 0.1)' :
                                      task.category === 'DevOps' ? 'rgba(6, 182, 212, 0.1)' :
                                      'rgba(239, 68, 68, 0.1)',
                          color: task.category === 'Implementation' ? 'var(--brand)' : 
                                 task.category === 'Architecture' ? '#8b5cf6' :
                                 task.category === 'UX/UI Design' ? '#ec4899' :
                                 task.category === 'Quality Assurance' ? '#10b981' :
                                 task.category === 'Research' ? '#f59e0b' :
                                 task.category === 'Mentorship' ? '#6366f1' :
                                 task.category === 'Documentation' ? '#64748b' :
                                 task.category === 'DevOps' ? '#06b6d4' :
                                 'var(--error)',
                          border: 'none',
                          fontSize: '0.65rem',
                          fontWeight: 800
                        }}
                      >
                        {task.category || 'Legacy'}
                      </span>
                      {task.due_date && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: new Date(task.due_date).getTime() < Date.now() && task.status !== 'Done' ? 'var(--error)' : 'var(--text-sub)' }}>
                          Due: {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    
                    {/* AVATAR RENDER MATRIX */}
                    <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '40%' }}>
                      {(!task.assignees || task.assignees.length === 0) ? (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>Unassigned</span>
                      ) : (
                        task.assignees.map(userId => {
                          const user = groupMembers.find(m => m.id === userId)
                          const initial = user?.full_name ? user.full_name.substring(0, 1).toUpperCase() : '?'
                          const isOnline = onlineUsers.has(userId)
                          
                          return (
                            <button 
                              key={userId} 
                              onClick={(e) => { e.stopPropagation(); setSelectedMember(user); }}
                              style={{ 
                                position: 'relative', 
                                padding: 0, 
                                background: 'none', 
                                border: 'none', 
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                              }}
                              className="avatar-bubble"
                            >
                              {user?.avatar_url ? (
                                <img 
                                  src={user.avatar_url} 
                                  title={user.full_name || 'View Profile'} 
                                  style={{ 
                                    width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', 
                                    border: '1.5px solid var(--surface)', boxShadow: 'var(--shadow-sm)' 
                                  }} 
                                />
                              ) : (
                                <div 
                                  title={user?.full_name || 'View Profile'} 
                                  style={{ 
                                    width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--brand)', color: 'white', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold',
                                    border: '1.5px solid var(--surface)', boxShadow: 'var(--shadow-sm)'
                                  }}
                                >
                                  {initial}
                                </div>
                              )}
                              {isOnline && (
                                <div style={{
                                  position: 'absolute',
                                  bottom: '-1px',
                                  right: '-1px',
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: 'var(--success)',
                                  border: '1.5px solid var(--surface)',
                                  boxShadow: '0 0 4px var(--success)'
                                }} />
                              )}
                            </button>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Real-time Team Communications */}
        {groupId && currentUserProfile && (
          <TeamChat groupId={groupId} user={currentUserProfile} />
        )}
      </div>
      
      {isModalOpen && (
        <TaskModal 
          task={selectedTask} 
          groupId={groupId} 
          onRefresh={fetchTasks}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedTask(null)
          }} 
        />
      )}

      {selectedMember && (
        <MemberProfileModal 
          member={selectedMember}
          groupMembers={groupMembers}
          tasks={tasks}
          onClose={() => setSelectedMember(null)}
        />
      )}

      <style jsx>{`
        .avatar-bubble:hover { transform: scale(1.15) translateY(-2px); z-index: 10; filter: brightness(1.1); }
        .kanban-board {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          min-height: 70vh;
        }
        
        @media (max-width: 1024px) {
          .kanban-board {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            padding-bottom: 2rem;
            min-height: auto;
          }
          .kanban-column {
            flex: 0 0 calc(100vw - 3rem);
            scroll-snap-align: center;
          }
        }

        .kanban-column {
          background: var(--bg-main);
          border-radius: var(--radius);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          border: 1px solid var(--border);
        }
        .kanban-column-header {
          font-weight: 800;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-sub);
          display: flex;
          justify-content: space-between;
          padding: 0.5rem;
          border-bottom: 2px solid var(--border);
          margin-bottom: 0.5rem;
        }
        .kanban-task-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          min-height: 200px;
        }
        .kanban-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.25rem;
          cursor: grab;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--shadow-sm);
        }
        .kanban-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--brand);
        }
        .kanban-card-title {
          font-weight: 700;
          font-size: 1rem;
          color: var(--text-main);
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }
      `}</style>
    </div>
  )
}
