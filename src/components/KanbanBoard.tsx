'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Task, TaskStatus } from '@/types/database'
import { FileUp, GitCommit, AlertCircle } from 'lucide-react'
import TaskModal from './TaskModal'

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
       .select('id, full_name, email')
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
    }
  }

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
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
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
                  
                  <div className="kanban-card-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span className={`badge ${task.is_coding_task ? 'badge-code' : 'badge-design'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                       {task.is_coding_task ? <GitCommit size={10} /> : <FileUp size={10} />}
                       {task.is_coding_task ? 'Code' : 'Design'}
                     </span>
                     
                     {/* AVATAR RENDER MATRIX */}
                     <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '60%' }}>
                       {(!task.assignees || task.assignees.length === 0) ? (
                         <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Unassigned</span>
                       ) : (
                         task.assignees.map(userId => {
                           const user = groupMembers.find(m => m.id === userId)
                           const initial = user?.full_name ? user.full_name.substring(0, 1).toUpperCase() : '?'
                           return (
                             <div 
                               key={userId} 
                               title={user?.full_name || 'Unknown User'} 
                               style={{ 
                                 width: '22px', 
                                 height: '22px', 
                                 borderRadius: '50%', 
                                 backgroundColor: 'var(--primary-color)', 
                                 color: 'white', 
                                 display: 'flex', 
                                 alignItems: 'center', 
                                 justifyContent: 'center', 
                                 fontSize: '0.65rem', 
                                 fontWeight: 'bold',
                                 border: '1px solid var(--border-color)',
                                 boxShadow: 'var(--shadow-sm)'
                               }}
                             >
                               {initial}
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
