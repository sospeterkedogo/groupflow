'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  BarChart3, 
  Users, 
  FileCheck, 
  AlertCircle, 
  TrendingUp,
  ShieldCheck,
  Zap,
  Clock,
  UserCircle,
  Lock
} from 'lucide-react'
import { ThemeProvider } from '@/context/ThemeContext'

export default function PublicSharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = use(params)
  const [loading, setLoading] = useState(true)
  const [group, setGroup] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [artifacts, setArtifacts] = useState<any[]>([])
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
    
    const relevantArtifacts = artifactsData.data?.filter(a => (a.tasks as any)?.group_id === groupId) || []
    setArtifacts(relevantArtifacts)
    
    setLoading(false)
  }

  const isEncrypted = group?.is_encrypted

  // --- METRICS ENGINE ---
  const doneTasks = tasks.filter(t => t.status === 'Done').length
  const completionRate = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0
  
  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'Done').length
  const riskLevel = overdueTasks > 3 ? 'Critical' : overdueTasks > 0 ? 'Elevated' : 'Optimal'
  
  const totalEvidence = artifacts.length

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#1a73e8', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }} />
          <p style={{ fontWeight: 600, fontSize: '1.1rem', color: '#64748b' }}>Accessing Project Registry...</p>
        </div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <div style={{ minHeight: '100vh', padding: '4rem 2rem', background: 'var(--bg-main)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: isEncrypted ? 'rgba(239, 68, 68, 0.1)' : 'rgba(26, 115, 232, 0.1)', color: isEncrypted ? 'var(--error)' : 'var(--brand)', padding: '0.5rem 1rem', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem', border: `1px solid ${isEncrypted ? 'var(--error)' : 'transparent'}` }}>
              {isEncrypted ? <Lock size={16} /> : <ShieldCheck size={16} />}
              <span>{isEncrypted ? 'PRIVATE ENCRYPTED VIEW' : 'PUBLIC VERIFICATION BADGE'}</span>
            </div>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.04em', margin: 0, color: 'var(--text-main)' }}>
              {isEncrypted ? `Group ${groupId.slice(0, 4)}` : group?.name}
            </h1>
            <p style={{ color: 'var(--text-sub)', fontSize: '1.25rem', marginTop: '1rem', maxWidth: '700px', margin: '1rem auto' }}>
              {isEncrypted ? (
                "Visibility encryption is active. Identifiable project data is masked."
              ) : (
                <>Live project audit for module <strong>{group?.module_code}</strong>. Real-time verification of team velocity and artifact density.</>
              )}
            </p>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)', textAlign: 'center' }}>
               <Zap size={32} color="var(--brand)" style={{ marginBottom: '1rem' }} />
               <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--brand)' }}>{completionRate}%</div>
               <div style={{ fontSize: '0.9rem', color: 'var(--text-sub)', fontWeight: 600 }}>Completion</div>
            </div>
            <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)', textAlign: 'center' }}>
               <FileCheck size={32} color="var(--success)" style={{ marginBottom: '1rem' }} />
               <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--success)' }}>{totalEvidence}</div>
               <div style={{ fontSize: '0.9rem', color: 'var(--text-sub)', fontWeight: 600 }}>Artifacts Linked</div>
            </div>
            <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)', textAlign: 'center' }}>
               <AlertCircle size={32} color={riskLevel === 'Optimal' ? 'var(--success)' : 'var(--error)'} style={{ marginBottom: '1rem' }} />
               <div style={{ fontSize: '2rem', fontWeight: 900, color: riskLevel === 'Optimal' ? 'var(--success)' : 'var(--error)' }}>{riskLevel}</div>
               <div style={{ fontSize: '0.9rem', color: 'var(--text-sub)', fontWeight: 600 }}>Risk Status</div>
            </div>
          </div>

          <section style={{ background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
               {isEncrypted ? 'Member Performance (Anonymized)' : 'Certified Project Participants'}
            </h2>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {members.map((member, idx) => (
                <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-main)', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sub)' }}>
                      {isEncrypted ? <UserCircle size={24} /> : (member.avatar_url ? <img src={member.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : <UserCircle size={24} />)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                        {isEncrypted ? `Collaborator ${idx + 1}` : member.full_name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                        {isEncrypted ? "Contact Hidden" : member.email?.replace(/(.{3}).+@/, "$1***@")}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--brand)' }}>{member.total_score}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase' }}>Contribution Score</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--text-sub)', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <TrendingUp size={16} />
              <span>Generated by GroupFlow Integrity Protocol</span>
            </div>
            <p>© 2026 GroupFlow. All execution metrics are verified through module activity.</p>
          </footer>

        </div>
      </div>
      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </ThemeProvider>
  )
}
