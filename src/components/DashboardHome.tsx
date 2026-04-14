'use client'

import { useState } from 'react'
import KanbanBoard from './KanbanBoard'
import CalendarView from './CalendarView'
import { LayoutDashboard, Calendar, History, Activity } from 'lucide-react'

export default function DashboardHome({ groupId, initialScore }: { groupId: string, initialScore: number }) {
  const [activeTab, setActiveTab ] = useState<'board' | 'calendar'>('board')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
         <div>
           <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
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
         @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
       `}</style>
    </div>
  )
}
