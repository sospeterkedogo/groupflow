'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { FileUp, GitCommit, AlertCircle } from 'lucide-react'
import { Task, TaskStatus } from '@/types/database'
import { Profile } from '@/types/auth'
import { KanbanBoardProps } from '@/types/ui'
import TaskModal from './TaskModal'
import confetti from 'canvas-confetti'
import { distributeTaskScore } from '@/app/dashboard/actions'
import TeamChat from './TeamChat'
import { logActivity } from '@/utils/logging'
import MemberProfileModal from './MemberProfileModal'
import { 
  RoomProvider, 
  useStorage, 
  useMutation, 
  useMyPresence, 
  useOthers,
  useUpdateMyPresence
} from "@/liveblocks.config";
import { LiveList } from "@liveblocks/client";
import { ClientSideSuspense } from "@liveblocks/react";

const COLUMNS: TaskStatus[] = ['To Do', 'In Progress', 'In Review', 'Done']

export default function KanbanBoard({ groupId, profile }: KanbanBoardProps) {
  if (!groupId) return <div>Invalid Group</div>;

  return (
    <RoomProvider 
      id={groupId} 
      initialPresence={{ draggingTaskId: null, userName: profile?.full_name || 'Someone' }}
      initialStorage={{ tasks: new LiveList<Task>([]) }}
    >
      <ClientSideSuspense fallback={<KanbanBoardSkeleton />}>
        {() => <KanbanBoardContent groupId={groupId} profile={profile} />}
      </ClientSideSuspense>
    </RoomProvider>
  )
}

function KanbanBoardContent({ groupId, profile }: KanbanBoardProps) {
  const tasks = useStorage((root) => root.tasks);
  const [groupMembers, setGroupMembers] = useState<Profile[]>([])
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null)
  
  const [boardError, setBoardError] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedMember, setSelectedMember] = useState<any>(null)

  // Presence & Others
  const [{ draggingTaskId }, updateMyPresence] = useMyPresence();
  const others = useOthers();
  const othersDragging = others.filter(o => o.presence?.draggingTaskId);

  const supabase = useMemo(() => createBrowserSupabaseClient(), [])

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60000)
    return () => window.clearInterval(interval)
  }, [])
  
  // Reconcile Liveblocks Storage with Supabase Data
  const reconcileTasks = useMutation(({ storage }, dbTasks: Task[]) => {
    const liveTasks = storage.get("tasks");
    
    // 1. Add missing tasks
    dbTasks.forEach(dbTask => {
      const exists = liveTasks.some(t => t.id === dbTask.id);
      if (!exists) {
        liveTasks.push(dbTask);
      }
    });

    // 2. Remove deleted tasks (optional, but good for robustness)
    const dbTaskIds = new Set(dbTasks.map(t => t.id));
    for (let i = liveTasks.length - 1; i >= 0; i--) {
      if (!dbTaskIds.has(liveTasks.get(i).id)) {
        liveTasks.delete(i);
      }
    }
  }, []);

  const fetchTasksFromDB = useCallback(async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      
    if (data) {
      reconcileTasks(data as Task[]);
    }
  }, [supabase, groupId, reconcileTasks])

  const fetchGroupMembers = useCallback(async () => {
     const { data } = await supabase
       .from('profiles')
       .select('*')
       .eq('group_id', groupId)
       
     if (data) {
       setGroupMembers(data as Profile[])
     }
  }, [supabase, groupId])

  const fetchCurrentUser = useCallback(async () => {
    if (profile) return
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setCurrentUserProfile(data)
    }
  }, [supabase, profile])

  useEffect(() => {
    fetchTasksFromDB()
    fetchGroupMembers()
    fetchCurrentUser()
  }, [fetchTasksFromDB, fetchGroupMembers, fetchCurrentUser])

  // Collaborative Handlers (Liveblocks)
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
    updateMyPresence({ draggingTaskId: taskId });
  }

  const handleDragEnd = () => {
    updateMyPresence({ draggingTaskId: null });
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() 
    e.currentTarget.classList.add('drag-over')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drag-over')
  }

  const moveTask = useMutation(({ storage }, taskId: string, newStatus: TaskStatus) => {
    const liveTasks = storage.get("tasks");
    const index = liveTasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      const task = liveTasks.get(index);
      if (task) {
        liveTasks.set(index, { ...task, status: newStatus });
      }
    }
  }, []);

  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')
    
    const taskId = e.dataTransfer.getData('taskId')
    if (!taskId) return

    // Multiplayer update
    moveTask(taskId, newStatus);
    handleDragEnd();

    // Update DB (Persistent Sync)
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)

    if (error) {
       console.error("Failed to move task in DB", error)
       setBoardError(`Persistence error: ${error.message}`)
       setTimeout(() => setBoardError(null), 5000)
    } else if (newStatus === 'Done') {
       // Fire secure anti-farming Score Node pipeline
       const targetTask = Array.from(tasks).find((t: any) => t.id === taskId)
       if (targetTask && (targetTask as any).assignees) {
          distributeTaskScore(taskId, (targetTask as any).assignees).catch(err => console.error("Score Distribution error", err))
       }
    }

    // Verifiable Logging
    if (!error && (currentUserProfile || profile)) {
       logActivity(
          (currentUserProfile?.id || profile?.id)!,
          groupId,
          'task_updated',
          `Moved task to ${newStatus}`,
          { task_id: taskId, new_status: newStatus }
       )
    }
  }

  const addTask = useMutation(({ storage }, newTask: Task) => {
    storage.get("tasks").push(newTask);
  }, []);

  const updateTask = useMutation(({ storage }, updatedTask: Task) => {
    const liveTasks = storage.get("tasks");
    const index = liveTasks.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
      liveTasks.set(index, updatedTask);
    }
  }, []);

  // ALGORITHMIC COMPLETION ENGINE
  const calculateProbability = (task: Task) => {
     if (task.status === 'Done') return 100
     let base = task.status === 'In Review' ? 85 : task.status === 'In Progress' ? 50 : 10
     const artifactBoost = Math.min((task.artifacts?.length || 0) * 5, 15)
     base += artifactBoost
     if (task.due_date) {
        const remainingHours = (new Date(task.due_date).getTime() - now) / (1000 * 60 * 60)
        if (remainingHours < 0) base = Math.max(0, base - 50) 
        else if (remainingHours < 48) base = Math.max(0, base - 10) 
     }
     return Math.min(base, 99)
  }

  const globalProbability = tasks.length > 0 
    ? Math.round(Array.from(tasks).reduce((acc, t) => acc + calculateProbability(t), 0) / tasks.length)
    : 0

  const overdueCount = Array.from(tasks).filter((t: any) => t.due_date && new Date(t.due_date).getTime() < now && t.status !== 'Done').length
  const [hasCelebrated, setHasCelebrated] = useState(false)

  // Gamification
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
        sessionStorage.removeItem(sessionKey)
     }
  }, [globalProbability, tasks.length, hasCelebrated, groupId])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {boardError && (
        <div className="error-message" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{boardError}</span>
          </div>
          <button className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={fetchTasksFromDB}>
            Retry Sync
          </button>
        </div>
      )}
      
      {/* Master Milestone HUD */}
      <div style={{ backgroundColor: 'var(--bg-sub)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '0.5rem' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
             <div>
               <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Project Progress</h3>
               <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
                 <div style={{ display: 'flex', WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent)' }}>
                    {others.map((other, idx) => {
                      const user = groupMembers.find(m => m.id === other.connectionId.toString()) || { full_name: (other.presence as any)?.userName || 'Someone', avatar_url: '' }
                      return (
                        <div 
                          key={other.connectionId} 
                          style={{ 
                            width: '24px', 
                            height: '24px', 
                            borderRadius: '50%', 
                            border: '2px solid var(--bg-sub)',
                            backgroundColor: 'var(--brand)',
                            marginLeft: idx === 0 ? 0 : '-8px',
                            zIndex: 10 - idx,
                            position: 'relative'
                          }}
                          title={`${(user as any).full_name} is active`}
                        >
                          {(user as any).avatar_url ? (
                            <img src={(user as any).avatar_url} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white' }}>
                              {((user as any).full_name || '?')[0]}
                            </div>
                          )}
                        </div>
                      )
                    })}
                 </div>
                 {others.length > 0 && (
                   <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 600 }}>
                     {others.length} {others.length === 1 ? 'collaborator' : 'collaborators'} active
                   </span>
                 )}
               </div>
             </div>
             {overdueCount > 0 && (
               <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <AlertCircle size(14) /> {overdueCount} Overdue Tasks
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
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-sub)' }}>Multiplayer active. Drag and drop tasks to collaborate in real-time.</p>
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
                {Array.from(tasks).filter((t: any) => t.status === col).length}
              </span>
            </div>
            
            <div 
              className="kanban-task-list"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col)}
            >
              {Array.from(tasks).filter((t: any) => t.status === col).map((task: any) => {
                const draggingOther = othersDragging.find(o => o.presence?.draggingTaskId === task.id)
                
                return (
                  <div 
                    key={task.id} 
                    className={`kanban-card ${draggingOther ? 'remote-dragging' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => { setSelectedTask(task); setIsModalOpen(true); }}
                    style={{
                      position: 'relative',
                      border: draggingOther ? '2px solid var(--brand)' : '1px solid var(--border)'
                    }}
                  >
                    {draggingOther && (
                      <div style={{ 
                        position: 'absolute', 
                        top: '-10px', 
                        right: '10px', 
                        backgroundColor: 'var(--brand)', 
                        color: 'white', 
                        fontSize: '0.65rem', 
                        padding: '2px 8px', 
                        borderRadius: '10px',
                        fontWeight: 700,
                        boxShadow: '0 2px 10px rgba(var(--brand-rgb), 0.3)',
                        zIndex: 2,
                        animation: 'pulse 2s infinite'
                      }}>
                        {(draggingOther.presence as any)?.userName} is moving this
                      </div>
                    )}
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
                    
                    <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '40%' }}>
                      {(!task.assignees || task.assignees.length === 0) ? (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>Unassigned</span>
                      ) : (
                        task.assignees.map((userId: string) => {
                          const user = groupMembers.find(m => m.id === userId)
                          const initial = user?.full_name ? user.full_name.substring(0, 1).toUpperCase() : '?'
                          
                          return (
                            <button 
                              key={userId} 
                              onClick={(e) => { e.stopPropagation(); setSelectedMember(user); }}
                              style={{ 
                                position: 'relative', padding: 0, background: 'none', border: 'none', cursor: 'pointer',
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
                            </button>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </div>
        ))}

        {groupId && (currentUserProfile || profile) && (
          <TeamChat groupId={groupId} user={(currentUserProfile || profile)!} />
        )}
      </div>
      
      {isModalOpen && (
        <TaskModal 
          task={selectedTask} 
          groupId={groupId} 
          onRefresh={() => {
            fetchTasksFromDB();
            // In multiplayer, TaskModal will also need to update Liveblocks storage
            // This is a bridge for now
          }}
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
          tasks={Array.from(tasks) as any}
          onClose={() => setSelectedMember(null)}
        />
      )}

      <style jsx>{`
        .avatar-bubble:hover { transform: scale(1.15) translateY(-2px); z-index: 10; filter: brightness(1.1); }
        .kanban-board { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; min-height: 70vh; }
        @media (max-width: 1024px) {
          .kanban-board { display: flex; overflow-x: auto; padding-bottom: 2rem; }
          .kanban-column { flex: 0 0 calc(100vw - 3rem); }
        }
        .kanban-column { background: var(--bg-main); border-radius: var(--radius); padding: 1rem; display: flex; flex-direction: column; gap: 1rem; border: 1px solid var(--border); }
        .kanban-column-header { font-weight: 800; font-size: 0.875rem; text-transform: uppercase; color: var(--text-sub); display: flex; justify-content: space-between; padding: 0.5rem; border-bottom: 2px solid var(--border); margin-bottom: 0.5rem; }
        .kanban-task-list { flex: 1; display: flex; flex-direction: column; gap: 1rem; min-height: 200px; }
        .kanban-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 1.25rem; cursor: grab; transition: all 0.3s; box-shadow: var(--shadow-sm); }
        .kanban-card:hover { transform: translateY(-4px); border-color: var(--brand); }
        .kanban-card-title { font-weight: 700; font-size: 1rem; color: var(--text-main); margin-bottom: 0.5rem; line-height: 1.4; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
        .remote-dragging { pointer-events: none; opacity: 0.7; filter: grayscale(0.5); }
      `}</style>
    </div>
  )
}

function KanbanBoardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', marginTop: '1rem' }}>
      <div className="skeleton" style={{ height: '110px', borderRadius: '16px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="skeleton skeleton-title" style={{ width: '30%' }} />
        <div className="skeleton" style={{ width: '100px', height: '38px', borderRadius: '14px' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="skeleton skeleton-title" style={{ width: '40%', height: '1.2rem' }} />
            <div className="skeleton skeleton-card" style={{ height: '120px' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
