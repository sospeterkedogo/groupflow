'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { Task } from '@/types/database'
import TaskModal from './TaskModal'

export default function CalendarView({ groupId, onTaskSaved }: { groupId: string; onTaskSaved?: () => Promise<void> | void }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [preselectedDate, setPreselectedDate] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('tasks')
      .select('id, title, due_date, status, is_coding_task')
      .eq('group_id', groupId)
      .not('due_date', 'is', null)

    setTasks((data ?? []) as any)
    setLoading(false)
  }, [groupId, supabase])

  useEffect(() => {
    void (async () => {
      await fetchTasks()
    })()

    const channel = supabase.channel(`calendar_${groupId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `group_id=eq.${groupId}` },
        () => {
          void fetchTasks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTasks, groupId, supabase])

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const days = []
  const totalDays = daysInMonth(year, month)
  const startOffset = firstDayOfMonth(year, month)

  // Empty cells for alignment
  for (let i = 0; i < startOffset; i++) days.push(null)
  for (let i = 1; i <= totalDays; i++) days.push(i)

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1))
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1))

  const getTasksForDay = (day: number) => {
    const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return tasks.filter(t => t.due_date && t.due_date.startsWith(formatted))
  }

  return (
    <div className="calendar-container" style={{ background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', padding: '2rem', boxShadow: 'var(--shadow-md)', animation: 'fadeIn 0.5s ease-out' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          {loading ? (
            <>
              <div className="skeleton skeleton-title" style={{ width: '250px', height: '2rem', marginBottom: '0.4rem' }} />
              <div className="skeleton skeleton-text" style={{ width: '150px' }} />
            </>
          ) : (
            <>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Calendar size={28} color="var(--brand)" />
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginTop: '0.4rem', fontWeight: 600 }}>Central Scheduling Hub</p>
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handlePrevMonth} className="btn-icon" disabled={loading} style={{ padding: '0.75rem', borderRadius: '50%', background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-main)', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.5 : 1 }}><ChevronLeft size={20} /></button>
          <button onClick={handleNextMonth} className="btn-icon" disabled={loading} style={{ padding: '0.75rem', borderRadius: '50%', background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-main)', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.5 : 1 }}><ChevronRight size={20} /></button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{ background: 'var(--bg-sub)', padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {day}
          </div>
        ))}

        {loading ? (
          Array.from({ length: 35 }).map((_, idx) => (
            <div key={idx} style={{ background: 'var(--bg-sub)', minHeight: '120px', padding: '0.75rem' }}>
              <div className="skeleton skeleton-avatar" style={{ width: '24px', height: '24px', marginBottom: '0.75rem' }} />
              {idx % 5 === 0 && <div className="skeleton skeleton-text" style={{ width: '80%', height: '14px', borderRadius: '4px' }} />}
              {idx % 7 === 0 && <div className="skeleton skeleton-text" style={{ width: '60%', height: '14px', borderRadius: '4px' }} />}
            </div>
          ))
        ) : (
        days.map((day, idx) => {
          const dayTasks = day ? getTasksForDay(day) : []
          const isToday = day && new Date().toDateString() === new Date(year, month, day).toDateString()
          
          return (
            <div 
              key={idx} 
              onClick={() => {
                if (day) {
                   const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                   setSelectedTask(null)
                   setPreselectedDate(formatted)
                   setIsModalOpen(true)
                }
              }}
              style={{ 
                background: day ? 'var(--bg-sub)' : 'var(--bg-main)', 
                minHeight: '120px', 
                padding: '0.75rem', 
                position: 'relative',
                transition: 'background 0.2s',
                cursor: day ? 'pointer' : 'default'
              }}
              className={day ? 'calendar-day-cell' : ''}
            >
              {day && (
                <>
                  <div style={{ 
                    fontSize: '1rem', 
                    fontWeight: 700, 
                    color: isToday ? 'white' : 'var(--text-main)',
                    background: isToday ? 'var(--brand)' : 'transparent',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem',
                    boxShadow: isToday ? '0 4px 10px rgba(var(--brand-rgb), 0.3)' : 'none'
                  }}>
                    {day}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {dayTasks.map(task => (
                      <div 
                        key={task.id}
                        onClick={async (e) => {
                           e.stopPropagation() // Prevent triggering the day click
                           const { data } = await supabase.from('tasks').select('*').eq('id', task.id).single()
                           setSelectedTask(data as Task | null)
                           setPreselectedDate(undefined)
                           setIsModalOpen(true)
                        }}
                        style={{ 
                          fontSize: '0.65rem', 
                          fontWeight: 700, 
                          padding: '0.4rem 0.6rem', 
                          borderRadius: '8px', 
                          background: task.status === 'Done' ? 'rgba(30, 142, 62, 0.1)' : 'rgba(var(--brand-rgb), 0.1)',
                          color: task.status === 'Done' ? 'var(--success)' : 'var(--brand)',
                          border: `1px solid ${task.status === 'Done' ? 'rgba(30, 142, 62, 0.2)' : 'rgba(var(--brand-rgb), 0.2)'}`,
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        className="calendar-task-tag"
                      >
                         <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                         {task.title}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )
        })
        )}
      </div>

      {isModalOpen && (
        <TaskModal 
          task={selectedTask} 
          groupId={groupId} 
          onRefresh={fetchTasks}
          onTaskSaved={onTaskSaved}
          initialDueDate={preselectedDate}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedTask(null)
            setPreselectedDate(undefined)
          }}
        />
      )}

      <style jsx>{`
        .calendar-day-cell:hover { background: var(--bg-main) !important; }
        .calendar-task-tag:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); filter: brightness(1.1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
