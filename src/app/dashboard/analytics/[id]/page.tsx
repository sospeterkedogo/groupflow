'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
  BarChart3, Users, FileCheck, AlertCircle, Download, Printer,
  ChevronRight, TrendingUp, ShieldCheck, Zap, Clock, UserCircle, CheckCircle2, Circle, Timer
} from 'lucide-react'
import { usePresence } from '@/components/PresenceProvider'
import ActivityLogView from '@/components/ActivityLogView'
import Link from 'next/link'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  RadialBarChart, RadialBar
} from 'recharts'

const CATEGORY_COLORS: Record<string, string> = {
  'Building': '#38bdf8',
  'Structure':   '#8b5cf6',
  'Design':   '#ec4899',
  'Testing': '#10b981',
  'Research':       '#f59e0b',
  'Helping':     '#6366f1',
  'Writing':  '#64748b',
  'Systems':         '#06b6d4',
  'Ethics':         '#ef4444',
}

const STATUS_COLORS: Record<string, string> = {
  'To Do':       '#64748b',
  'In Progress': '#f59e0b',
  'Done':        '#10b981',
}

export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = use(params)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isMember, setIsMember] = useState(false)
  const [group, setGroup] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [artifacts, setArtifacts] = useState<any[]>([])
  const { onlineUsers } = usePresence()
  const supabase = createClient()

  useEffect(() => { fetchData() }, [groupId])

  const fetchData = async () => {
    setLoading(true)
    
    // 1. Get current user profile for membership verification
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const [profileData, groupData, tasksData, membersData, artifactsData] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', authUser.id).single(),
      supabase.from('groups').select('*').eq('id', groupId).single(),
      supabase.from('tasks').select('*').eq('group_id', groupId),
      supabase.from('profiles').select('*').eq('group_id', groupId).order('total_score', { ascending: false }),
      supabase.from('artifacts').select('*, tasks(title, group_id)').filter('tasks.group_id', 'eq', groupId)
    ])

    const userProfile = profileData.data
    setCurrentUser(userProfile)
    
    // Check membership (using profile.group_id vs current page's groupId)
    const memberCheck = userProfile?.group_id === groupId
    setIsMember(memberCheck)

    if (groupData.data) setGroup(groupData.data)
    
    // Only set full data if user is a member or admin (security layer in UI)
    if (memberCheck) {
      if (tasksData.data) setTasks(tasksData.data)
      if (membersData.data) setMembers(membersData.data)
      const relevant = artifactsData.data?.filter(a => (a.tasks as any)?.group_id === groupId) || []
      setArtifacts(relevant)
    } else {
      // Restricted view: still show member count but hide task details
      if (membersData.data) setMembers(membersData.data)
    }

    setLoading(false)
  }

  const [hasSentRequest, setHasSentRequest] = useState(false)

  const handleJoinRequest = async () => {
    if (!currentUser || !group || hasSentRequest) return
    
    setLoading(true)
    try {
      const { sendJoinRequest } = await import('@/app/dashboard/join/actions')
      await sendJoinRequest(groupId, currentUser.full_name || 'A student')
      setHasSentRequest(true)
      alert('Request sent! The team will see your message in their chat.')
    } catch (err: any) {
      alert('Error sending request: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // --- METRICS ---
  const doneTasks = tasks.filter(t => t.status === 'Done').length
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length
  const todoTasks = tasks.filter(t => t.status === 'To Do').length
  const completionRate = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0
  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'Done').length
  const riskLevel = overdueTasks > 3 ? 'Critical' : overdueTasks > 0 ? 'Elevated' : 'Optimal'
  const totalEvidence = artifacts.length
  const evidenceDensity = tasks.length > 0 ? (totalEvidence / tasks.length).toFixed(1) : '0'

  const calculateMemberEffort = (memberId: string) =>
    tasks.filter(t => t.status === 'Done' && t.assignees?.includes(memberId)).length

  const totalGroupEffort = members.reduce((acc, m) => acc + calculateMemberEffort(m.id), 0)

  // --- CHART DATA ---
  const statusPieData = [
    { name: 'Done', value: doneTasks, color: STATUS_COLORS['Done'] },
    { name: 'In Progress', value: inProgressTasks, color: STATUS_COLORS['In Progress'] },
    { name: 'To Do', value: todoTasks, color: STATUS_COLORS['To Do'] },
  ].filter(d => d.value > 0)

  const categoryBarData = Object.keys(CATEGORY_COLORS)
    .map(cat => ({ name: cat.replace(' ', '\n'), fullName: cat, count: tasks.filter(t => t.category === cat).length, color: CATEGORY_COLORS[cat] }))
    .filter(d => d.count > 0)

  const memberBarData = members.map(m => ({
    name: (m.full_name || 'Unknown').split(' ')[0],
    completed: calculateMemberEffort(m.id),
    assigned: tasks.filter(t => t.assignees?.includes(m.id)).length,
  }))

  // --- EXPORT ---
  const exportToCSV = async () => {
    setLoading(true)
    const { data: logs } = await supabase.from('activity_log').select('*, profiles(full_name)').eq('group_id', groupId).order('created_at', { ascending: false })
    const headers = ['Type', 'User', 'Description', 'Timestamp']
    const rows = (logs || []).map(l => [l.action_type, (l.profiles as any)?.full_name || 'System', l.description, l.created_at])
    const csvContent = [headers, ...rows].map(e => e.map(c => `"${c}"`).join(',')).join('\n')
    setLoading(false)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `GroupFlow_${group?.module_code || 'Report'}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link); link.click(); document.body.removeChild(link)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-sub)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }} />
        <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>Loading project data...</p>
      </div>
    </div>
  )

  if (!isMember) {
    return (
      <div style={{ maxWidth: '1000px', margin: '4rem auto', textAlign: 'center' }}>
        <div style={{ padding: '4rem', background: 'var(--bg-sub)', borderRadius: '32px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
           <div style={{ width: '80px', height: '80px', background: 'rgba(var(--brand-rgb), 0.1)', color: 'var(--brand)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
              <ShieldCheck size={40} />
           </div>
           <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>{group?.name || 'Private Team'}</h1>
           <p style={{ color: 'var(--text-sub)', fontSize: '1.2rem', marginBottom: '2.5rem' }}>
             This team is private. You must be a member to view their tasks, artifacts, and activity history.
           </p>

           <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '3rem' }}>
              <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{members.length}</div>
                 <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', textTransform: 'uppercase', fontWeight: 700 }}>Team Members</div>
              </div>
              <div style={{ width: '1px', background: 'var(--border)' }} />
              <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{group?.module_code || '---'}</div>
                 <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', textTransform: 'uppercase', fontWeight: 700 }}>Module Code</div>
              </div>
           </div>

           <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={handleJoinRequest} 
                disabled={hasSentRequest || loading}
                className={hasSentRequest ? "btn btn-secondary" : "btn btn-primary"} 
                style={{ padding: '1rem 2.5rem', width: 'auto', fontSize: '1.1rem', opacity: hasSentRequest ? 0.7 : 1, cursor: hasSentRequest ? 'default' : 'pointer' }}
              >
                {hasSentRequest ? 'Request sent. Waiting for team leader approval' : 'Request to Join'}
              </button>
              <Link href="/dashboard/network" className="btn btn-secondary" style={{ padding: '1rem 2.5rem', width: 'auto', fontSize: '1.1rem' }}>
                Back to Network
              </Link>
           </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 var(--p-safe)', animation: 'fadeIn 0.5s ease-out' }}>

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--brand)', marginBottom: '0.75rem', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            <BarChart3 size={16} /><span>Project Analytics</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em', margin: 0, lineHeight: 1 }}>{group?.name || 'Project'}</h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '1rem', marginTop: '0.75rem', fontWeight: 500 }}>
            {group?.module_code} • Live project tracking
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={exportToCSV} className="btn btn-ghost btn-inline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={16} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="btn btn-primary btn-inline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Printer size={16} /> Print Report
          </button>
        </div>
      </header>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { icon: <Zap size={20} />, label: 'Completion', value: `${completionRate}%`, color: 'var(--brand)', bg: 'rgba(56,189,248,0.1)' },
          { icon: <CheckCircle2 size={20} />, label: 'Tasks Done', value: `${doneTasks}/${tasks.length}`, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { icon: <Users size={20} />, label: 'Team Size', value: members.length, color: 'var(--brand)', bg: 'rgba(56,189,248,0.1)' },
          { icon: <AlertCircle size={20} />, label: 'Overdue Risk', value: riskLevel, color: riskLevel === 'Optimal' ? '#10b981' : '#ef4444', bg: riskLevel === 'Optimal' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' },
          { icon: <ShieldCheck size={20} />, label: 'Evidence/Task', value: evidenceDensity, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { icon: <Timer size={20} />, label: 'Overdue', value: overdueTasks, color: overdueTasks > 0 ? '#ef4444' : '#10b981', bg: overdueTasks > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)' },
        ].map(kpi => (
          <div key={kpi.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.6rem', background: kpi.bg, color: kpi.color, borderRadius: '12px', flexShrink: 0 }}>{kpi.icon}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-sub)', marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

        {/* Task Status Donut */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>Task Status</h3>
          {tasks.length === 0 ? (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sub)', fontSize: '0.9rem' }}>No tasks yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {statusPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v} tasks`, n]} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '0.8rem' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {statusPieData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
                    <span style={{ color: 'var(--text-sub)' }}>{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Task Categories Bar */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>By Category</h3>
          {categoryBarData.length === 0 ? (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sub)', fontSize: '0.9rem' }}>No categorised tasks</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryBarData} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-sub)' }} allowDecimals={false} />
                <YAxis type="category" dataKey="fullName" tick={{ fontSize: 10, fill: 'var(--text-sub)' }} width={90} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '0.8rem' }} formatter={(v) => [`${v} tasks`]} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {categoryBarData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Member Contribution */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>Member Contribution</h3>
          {members.length === 0 ? (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sub)', fontSize: '0.9rem' }}>No members yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={memberBarData} margin={{ left: -10, right: 10, top: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-sub)' }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-sub)' }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '0.8rem' }} />
                <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '0.5rem' }} />
                <Bar dataKey="assigned" name="Assigned" fill="rgba(56,189,248,0.3)" radius={[4,4,0,0]} />
                <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Progress Bar — overall */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontWeight: 700 }}>Overall Project Progress</span>
          <span style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--brand)' }}>{completionRate}%</span>
        </div>
        <div style={{ height: '10px', background: 'var(--bg-main)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ width: `${completionRate}%`, height: '100%', background: 'linear-gradient(90deg, var(--brand), #10b981)', borderRadius: '10px', transition: 'width 1s ease' }} />
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          {[['To Do', todoTasks, '#64748b'], ['In Progress', inProgressTasks, '#f59e0b'], ['Done', doneTasks, '#10b981']].map(([label, count, color]) => (
            <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color as string }} />
              <span style={{ color: 'var(--text-sub)' }}>{label}: {count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Two-Column */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

        {/* Team Leaderboard — fixed table */}
        <section style={{ background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', padding: '1.5rem', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Team Leaderboard</h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>By Score</span>
          </div>

          {members.length === 0 ? (
            <p style={{ color: 'var(--text-sub)', textAlign: 'center', padding: '2rem 0' }}>No members yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {members.map((member, idx) => {
                const isOnline = onlineUsers.has(member.id)
                const effort = calculateMemberEffort(member.id)
                const pct = totalGroupEffort > 0 ? Math.round((effort / totalGroupEffort) * 100) : 0
                const assigned = tasks.filter(t => t.assignees?.includes(member.id)).length
                return (
                  <div key={member.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1rem', borderRadius: '14px',
                    background: idx === 0 ? 'rgba(56,189,248,0.06)' : 'var(--bg-main)',
                    border: `1px solid ${idx === 0 ? 'rgba(56,189,248,0.2)' : 'var(--border)'}`,
                    flexWrap: 'wrap'
                  }}>
                    {/* Rank */}
                    <div style={{ width: '24px', textAlign: 'center', fontWeight: 900, fontSize: '0.85rem', color: idx === 0 ? 'var(--brand)' : 'var(--text-sub)', flexShrink: 0 }}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </div>
                    {/* Avatar */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-sub)', border: '2px solid var(--border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {member.avatar_url ? <img src={member.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserCircle size={22} color="var(--text-sub)" />}
                      </div>
                      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '9px', height: '9px', borderRadius: '50%', background: isOnline ? '#10b981' : 'var(--border)', border: '2px solid var(--surface)', boxShadow: isOnline ? '0 0 6px #10b981' : 'none' }} />
                    </div>
                    {/* Name & email */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.full_name || 'Unknown'}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.email}</div>
                    </div>
                    {/* Contribution bar */}
                    <div style={{ width: '80px', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginBottom: '3px', textAlign: 'right' }}>{pct}%</div>
                      <div style={{ height: '5px', background: 'var(--bg-sub)', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--brand)', borderRadius: '5px' }} />
                      </div>
                    </div>
                    {/* Score */}
                    <div style={{ textAlign: 'right', flexShrink: 0, minWidth: '48px' }}>
                      <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--brand)' }}>{member.total_score ?? 0}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-sub)', fontWeight: 600 }}>pts</div>
                    </div>
                    {/* Tasks */}
                    <div style={{ textAlign: 'right', flexShrink: 0, minWidth: '40px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: effort > 0 ? '#10b981' : 'var(--text-sub)' }}>{effort}/{assigned}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-sub)', fontWeight: 600 }}>tasks</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Activity Log */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem' }}>Activity Log</h3>
            <ActivityLogView groupId={groupId} limit={15} />
          </div>
        </section>

        {/* Right sidebar */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Pipeline Metrics */}
          <div style={{ background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="var(--brand)" /> Task Categories
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {Object.entries(CATEGORY_COLORS).map(([cat, color]) => {
                const count = tasks.filter(t => t.category === cat).length
                if (count === 0) return null
                const pct = tasks.length > 0 ? (count / tasks.length) * 100 : 0
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                      <span style={{ fontWeight: 600 }}>{cat}</span>
                      <span>{count}</span>
                    </div>
                    <div style={{ height: '5px', background: 'var(--bg-main)', borderRadius: '10px' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '10px' }} />
                    </div>
                  </div>
                )
              })}
              {tasks.length === 0 && <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>No tasks yet.</p>}
            </div>
          </div>

          {/* Recently Completed */}
          <div style={{ background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--brand)" /> Recently Completed
            </h3>
            {tasks.filter(t => t.status === 'Done').length === 0 ? (
              <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>No completed tasks yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tasks.filter(t => t.status === 'Done').slice(0, 5).map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', background: 'var(--bg-main)', borderRadius: '12px' }}>
                    <FileCheck size={16} color="#10b981" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{t.title}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)' }}>
                        {t.category && <span style={{ color: CATEGORY_COLORS[t.category] || 'var(--brand)', fontWeight: 600 }}>{t.category} • </span>}
                        {new Date(t.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
                <Link href="/dashboard" style={{ fontSize: '0.82rem', color: 'var(--brand)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                  View all tasks <ChevronRight size={14} />
                </Link>
              </div>
            )}
          </div>

        </section>
      </div>

      <style jsx>{`
        @media print {
          button { display: none !important; }
          body { background: white !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
