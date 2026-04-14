'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Task, TaskStatus } from '@/types/database'
import { FileUp, GitCommit, AlertCircle } from 'lucide-react'
import TaskModal from './TaskModal'
import confetti from 'canvas-confetti'
import { distributeTaskScore } from '@/app/dashboard/actions'
import { usePresence } from './PresenceProvider'

const COLUMNS: TaskStatus[] = ['To Do', 'In Progress', 'In Review', 'Done']

export default function KanbanBoard({ groupId }: { groupId: string }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [groupMembers, setGroupMembers] = useState<any[]>([])
  
  const [loading, setLoading] = useState(true)
  const [boardError, setBoardError] = useState<string | null>(null)
  
  // Modal Orchestration State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  
  const supabase = createClient()
  const { onlineUsers } = usePresence()

  useEffect(() => {
    fetchTasks()
    fetchGroupMembers()
    
    // Subscribe to real-time task changes for this specific group
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
        (payload) => {
          fetchTasks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [groupId])

  const fetchGroupMembers = async () => {
     const { data } = await supabase
       .from('profiles')
       .select('id, full_name, email, avatar_url')
       .eq('group_id', groupId)
       
     if (data) setGroupMembers(data)
  }

  const fetchTasks = async () => {
    setBoardError(null)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      
    if (error) {
      setBoardError('Failed to synchronize tasks with the server.')
    }
    
    if (data) setTasks(data as Task[])
    setLoading(false)
  }

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
  }

  // ALGORITHMIC COMPLETION ENGINE
  const calculateProbability = (task: Task) => {
     if (task.status === 'Done') return 100
     let base = task.status === 'In Review' ? 85 : task.status === 'In Progress' ? 50 : 10
     
     if (task.due_date) {
        const remainingHours = (new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60)
        if (remainingHours < 0) {
            base = Math.max(0, base - 50) // Severe penalty for overdue
        } else if (remainingHours < 48) {
            base = Math.max(0, base - 20) // Penalty for imminent risk
        }
     }
     return base
  }

  const globalProbability = tasks.length > 0 
    ? Math.round(tasks.reduce((acc, t) => acc + calculateProbability(t), 0) / tasks.length)
    : 0

  const overdueCount = tasks.filter(t => t.due_date && new Date(t.due_date).getTime() < Date.now() && t.status !== 'Done').length
  const [hasCelebrated, setHasCelebrated] = useState(false)

  // IMMERSIVE GAMIFICATION REWARD MATRIX
  useEffect(() => {
     if (tasks.length > 0 && globalProbability === 100 && !hasCelebrated) {
        setHasCelebrated(true)
        const duration = 3000
        const end = Date.now() + duration

        const frame = () => {
          confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0 }, colors: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#ffffff'] })
          confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1 }, colors: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#ffffff'] })
          if (Date.now() < end) requestAnimationFrame(frame)
        }
        frame()
     } else if (globalProbability < 100 && hasCelebrated) {
        setHasCelebrated(false) // Reset sequence dynamically if pipeline decays
     }
  }, [globalProbability, tasks.length, hasCelebrated])

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Mounting Kanban Flow...</div>
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
      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '0.5rem' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
             <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Global Project Network Pipeline</h3>
             {overdueCount > 0 && (
               <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <AlertCircle size={14} /> {overdueCount} Critical Overdue Nodes
               </span>
             )}
         </div>
         <div style={{ width: '100%', backgroundColor: 'var(--card-bg)', height: '12px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <div style={{ width: `${globalProbability}%`, height: '100%', backgroundColor: globalProbability < 30 ? 'var(--danger-color)' : 'var(--accent-color)', transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
         </div>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Completion Profile: <span style={{ color: 'var(--text-color)' }}>{globalProbability}%</span></span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{tasks.length} Active Nodes</span>
         </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Drag and drop computational modules. Progress dynamically recalculates against absolute deadlines.</p>
        <button className="btn btn-primary" onClick={() => { setSelectedTask(null); setIsModalOpen(true); }} style={{ width: 'auto' }}>
          + Add New Task
        </button>
      </div>

      <div className="kanban-board">
        {COLUMNS.map((col) => (
          <div key={col} className="kanban-column">
            <div className="kanban-column-header">
              {col}
              <span className="badge" style={{ backgroundColor: 'var(--bg-color)' }}>
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                         <span>Confidence</span>
                         <span style={{ color: calculateProbability(task) < 30 ? 'var(--danger-color)' : 'var(--text-secondary)' }}>{calculateProbability(task)}%</span>
                      </div>
                      <div style={{ width: '100%', backgroundColor: 'var(--bg-secondary)', height: '4px', borderRadius: '4px' }}>
                         <div style={{ width: `${calculateProbability(task)}%`, height: '100%', backgroundColor: calculateProbability(task) < 30 ? 'var(--danger-color)' : calculateProbability(task) === 100 ? 'var(--success-color)' : 'var(--accent-color)', borderRadius: '4px', transition: 'width 0.4s ease' }}></div>
                      </div>
                   </div>

                   <div className="kanban-card-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                         <span className={`badge ${task.is_coding_task ? 'badge-code' : 'badge-design'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                           {task.is_coding_task ? <GitCommit size={10} /> : <FileUp size={10} />}
                           {task.is_coding_task ? 'Code' : 'Design'}
                         </span>
                         {task.due_date && (
                           <span style={{ fontSize: '0.65rem', fontWeight: 600, color: new Date(task.due_date).getTime() < Date.now() && task.status !== 'Done' ? 'var(--danger-color)' : 'var(--text-secondary)' }}>
                              Due: {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                           </span>
                         )}
                      </div>
                      
                      {/* AVATAR RENDER MATRIX */}
                      <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '40%' }}>
                        {(!task.assignees || task.assignees.length === 0) ? (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Unassigned</span>
                        ) : (
                          task.assignees.map(userId => {
                            const user = groupMembers.find(m => m.id === userId)
                            const initial = user?.full_name ? user.full_name.substring(0, 1).toUpperCase() : '?'
                            const isOnline = onlineUsers.has(userId)
                            
                            return (
                              <div key={userId} style={{ position: 'relative' }}>
                                {user?.avatar_url ? (
                                  <img 
                                    src={user.avatar_url} 
                                    title={user.full_name || 'Unknown'} 
                                    style={{ 
                                      width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover', 
                                      border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' 
                                    }} 
                                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.removeAttribute('style') }}
                                  />
                                ) : (
                                  <div 
                                    title={user?.full_name || 'Unknown User'} 
                                    style={{ 
                                      width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', 
                                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold',
                                      border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)'
                                    }}
                                  >
                                    {initial}
                                  </div>
                                )}
                                {isOnline && (
                                  <div style={{
                                    position: 'absolute',
                                    bottom: '-2px',
                                    right: '-2px',
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--success-color)',
                                    border: '1.5px solid var(--card-bg)',
                                    boxShadow: '0 0 4px var(--success-color)'
                                  }} />
                                )}
                              </div>
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
    </div>
  )
}
