'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  BarChart3, 
  Users, 
  FileCheck, 
  AlertCircle, 
  Download, 
  Printer, 
  ChevronRight, 
  TrendingUp,
  ShieldCheck,
  Zap,
  Clock,
  ExternalLink,
  UserCircle
} from 'lucide-react'
import { usePresence } from '@/components/PresenceProvider'
import Link from 'next/link'

export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = use(params)
  const [loading, setLoading] = useState(true)
  const [group, setGroup] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [artifacts, setArtifacts] = useState<any[]>([])
  const { onlineUsers } = usePresence()
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [groupId])

  const fetchData = async () => {
    setLoading(true)
    const [groupData, tasksData, membersData, artifactsData] = await Promise.all([
      supabase.from('groups').select('*').eq('id', groupId).single(),
      supabase.from('tasks').select('*').eq('group_id', groupId),
      supabase.from('profiles').select('*').eq('group_id', groupId).order('total_score', { ascending: false }),
      supabase.from('artifacts').select('*, tasks(title, group_id)').filter('tasks.group_id', 'eq', groupId)
    ])

    if (groupData.data) setGroup(groupData.data)
    if (tasksData.data) setTasks(tasksData.data)
    if (membersData.data) setMembers(membersData.data)
    
    // Filter artifacts client-side since nested filtering can be tricky in some Supabase versions
    const relevantArtifacts = artifactsData.data?.filter(a => (a.tasks as any)?.group_id === groupId) || []
    setArtifacts(relevantArtifacts)
    
    setLoading(false)
  }

  // --- METRICS ENGINE ---
  const doneTasks = tasks.filter(t => t.status === 'Done').length
  const completionRate = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0
  
  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'Done').length
  const riskLevel = overdueTasks > 3 ? 'Critical' : overdueTasks > 0 ? 'Elevated' : 'Optimal'
  
  const totalEvidence = artifacts.length
  const evidenceDensity = tasks.length > 0 ? (totalEvidence / tasks.length).toFixed(1) : '0'

  // --- EXPORT LOGIC ---
  const exportToCSV = () => {
    const headers = ['Task ID', 'Title', 'Status', 'Assignees', 'Due Date', 'Evidence Count', 'Created At']
    const reportTimestamp = new Date().toLocaleString()
    const rows = tasks.map(t => {
      const assigneeNames = t.assignees?.map((id: string) => members.find(m => m.id === id)?.full_name || 'Anonymous').join('; ')
      return [
        t.id,
        t.title,
        t.status,
        assigneeNames || 'Unassigned',
        t.due_date || 'N/A',
        artifacts.filter(a => a.task_id === t.id).length,
        t.created_at
      ]
    })

    const csvContent = [
      [`REPORT GENERATED AT: ${reportTimestamp}`],
      [],
      headers, 
      ...rows
    ].map(e => e.map(cell => `"${cell}"`).join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `GroupFlow_Export_${group?.module_code || 'Project'}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const triggerPrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-sub)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }} />
          <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>Calibrating Project Intelligence...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="analytics-container" style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Header & Global Actions */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--brand)', marginBottom: '1rem', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <BarChart3 size={18} />
            <span>Project Analytics</span>
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em', margin: 0, lineHeight: 1 }}>{group?.name || 'Project Registry'}</h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '1.2rem', marginTop: '1rem', fontWeight: 500 }}>
            {group?.module_code} • Real-time project tracking and verification stats.
          </p>
        </div>
        
        <div className="no-print" style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={exportToCSV} className="btn" style={{ background: 'var(--bg-sub)', border: '1px solid var(--border)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto', padding: '0.75rem 1.25rem' }}>
            <Download size={18} /> Export CSV
          </button>
          <button onClick={triggerPrint} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto', padding: '0.75rem 1.25rem' }}>
            <Printer size={18} /> Print PDF Report
          </button>
        </div>
      </header>

      {/* Primary KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="stat-card" style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(26, 115, 232, 0.1)', color: 'var(--brand)', borderRadius: '12px' }}>
              <Zap size={24} />
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--brand)' }}>{completionRate}%</div>
          </div>
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-sub)', fontWeight: 600 }}>Project Progress</h3>
          <div style={{ height: '6px', background: 'var(--bg-main)', borderRadius: '10px', marginTop: '1rem', overflow: 'hidden' }}>
            <div style={{ width: `${completionRate}%`, height: '100%', background: 'var(--brand)', borderRadius: '10px' }} />
          </div>
        </div>

        <div className="stat-card" style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(30, 142, 62, 0.1)', color: 'var(--success)', borderRadius: '12px' }}>
              <ShieldCheck size={24} />
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--success)' }}>{evidenceDensity}</div>
          </div>
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-sub)', fontWeight: 600 }}>Extra Details</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--text-sub)' }}>Attached proof per task</p>
        </div>

        <div className="stat-card" style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.75rem', background: riskLevel === 'Optimal' ? 'rgba(30, 142, 62, 0.1)' : 'rgba(217, 48, 37, 0.1)', color: riskLevel === 'Optimal' ? 'var(--success)' : 'var(--error)', borderRadius: '12px' }}>
              <AlertCircle size={24} />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: riskLevel === 'Optimal' ? 'var(--success)' : 'var(--error)', textTransform: 'uppercase' }}>{riskLevel}</div>
          </div>
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-sub)', fontWeight: 600 }}>Overdue Risk</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--text-sub)' }}>{overdueTasks} nodes currently overdue</p>
        </div>

        <div className="stat-card" style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(26, 115, 232, 0.1)', color: 'var(--brand)', borderRadius: '12px' }}>
              <Users size={24} />
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)' }}>{members.length}</div>
          </div>
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-sub)', fontWeight: 600 }}>Active Collaborators</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--text-sub)' }}>{onlineUsers.size} members online now</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem' }}>
        
        {/* Team Performance Leaderboard */}
        <section style={{ background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Team Leaderboard</h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)', fontWeight: 600 }}>RANKED BY SCORE</div>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-sub)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>
                <th style={{ textAlign: 'left', padding: '1rem 0', fontWeight: 700 }}>Member</th>
                <th style={{ textAlign: 'center', padding: '1rem', fontWeight: 700 }}>Total Score</th>
                <th style={{ textAlign: 'center', padding: '1rem', fontWeight: 700 }}>Assignments</th>
                <th style={{ textAlign: 'right', padding: '1rem 0', fontWeight: 700 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, idx) => {
                const isOnline = onlineUsers.has(member.id)
                const userTasks = tasks.filter(t => t.assignees?.includes(member.id)).length
                
                return (
                  <tr key={member.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1.25rem 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-main)', border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {member.avatar_url ? <img src={member.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserCircle size={24} color="var(--text-sub)" />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{member.full_name || 'Anonymous'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', padding: '1.25rem' }}>
                      <span style={{ fontWeight: 800, color: 'var(--brand)', fontSize: '1.1rem' }}>{member.total_score}</span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '1.25rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{userTasks}</span>
                    </td>
                    <td style={{ textAlign: 'right', padding: '1.25rem 0' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: isOnline ? 'var(--success)' : 'var(--text-sub)', fontSize: '0.8rem', fontWeight: 700 }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isOnline ? 'var(--success)' : 'var(--border)' }} />
                        {isOnline ? 'ACTIVE' : 'IDLE'}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>

        {/* Project Health / Trends */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', padding: '2rem', flex: 1 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="var(--brand)" /> 
              Pipeline Metrics
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-sub)' }}>
                  <span>Coding Tasks</span>
                  <span>{tasks.filter(t => t.is_coding_task).length} Units</span>
                </div>
                <div style={{ height: '4px', background: 'var(--bg-main)', borderRadius: '10px' }}>
                  <div style={{ width: `${(tasks.filter(t => t.is_coding_task).length / tasks.length) * 100}%`, height: '100%', background: 'var(--brand)', borderRadius: '10px' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-sub)' }}>
                  <span>Design Tasks</span>
                  <span>{tasks.filter(t => !t.is_coding_task).length} Units</span>
                </div>
                <div style={{ height: '4px', background: 'var(--bg-main)', borderRadius: '10px' }}>
                  <div style={{ width: `${(tasks.filter(t => !t.is_coding_task).length / tasks.length) * 100}%`, height: '100%', background: '#ff9800', borderRadius: '10px' }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', padding: '2rem', flex: 1 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="var(--brand)" /> 
              Recent History
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tasks.filter(t => t.status === 'Done').slice(0, 3).map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'var(--bg-main)', borderRadius: '12px' }}>
                  <div style={{ color: 'var(--success)' }}><FileCheck size={18} /></div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{t.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>Certified Done • {new Date(t.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
              <Link href="/dashboard" style={{ fontSize: '0.85rem', color: 'var(--brand)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                See full execution log <ChevronRight size={14} />
              </Link>
            </div>
          </div>

        </section>

      </div>

      <style jsx>{`
        @media print {
          .no-print { display: none !important; }
          .analytics-container { padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; }
          .stat-card { box-shadow: none !important; border: 1px solid #eee !important; }
          body { background: white !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
