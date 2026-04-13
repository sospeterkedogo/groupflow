'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Task, TaskStatus } from '@/types/database'
import { FileUp, GitCommit } from 'lucide-react'

const COLUMNS: TaskStatus[] = ['To Do', 'In Progress', 'In Review', 'Done']

export default function KanbanBoard({ groupId }: { groupId: string }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchTasks()
    
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
          // Re-fetch everything simply to ensure state matches DB closely
          fetchTasks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [groupId])

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      
    if (data) setTasks(data as Task[])
    setLoading(false)
  }

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // Necessary to allow dropping
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
    }
  }

  const addNewTask = async () => {
    const title = prompt("Enter new task title:")
    if (!title) return

    const isCoding = confirm("Is this a coding task? (OK = Yes, Cancel = No)")

    const newTask = {
      title,
      description: '',
      status: 'To Do' as TaskStatus,
      group_id: groupId,
      is_coding_task: isCoding
    }

    await supabase.from('tasks').insert([newTask])
    // Realtime channel will fetch the updated list
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tasks...</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button className="btn btn-primary" onClick={addNewTask} style={{ width: 'auto' }}>
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
                >
                  <div className="kanban-card-title">{task.title}</div>
                  <div className="kanban-card-meta">
                     <span className={`badge ${task.is_coding_task ? 'badge-code' : 'badge-design'}`} style={{ display: 'flex', alignItem: 'center', gap: '0.25rem' }}>
                       {task.is_coding_task ? <GitCommit size={10} /> : <FileUp size={10} />}
                       {task.is_coding_task ? 'Code' : 'Design / Doc'}
                     </span>
                     <span style={{ fontSize: '0.7rem' }}>
                       {task.assignee_id ? 'Assigned' : 'Unassigned'}
                     </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
