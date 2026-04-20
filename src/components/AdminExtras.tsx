'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import {
  Users, AlertTriangle, Activity, MessageSquare, DollarSign,
  Search, Loader2, CheckCircle, XCircle, Ban, Send
} from 'lucide-react'

type AdminTab = 'users' | 'activity' | 'feedback' | 'payout'

interface UserRow {
  id: string; full_name: string; email: string
  account_status: string; subscription_plan: string; created_at: string
  stripe_account_status?: string; role?: string
}

interface ActivityRow {
  id: string; created_at: string; action: string; resource_type?: string
  severity: string; user_id: string
  profile?: { full_name: string; email: string }
}

interface FeedbackRow {
  id: string; created_at: string; feedback_type: string; message: string; rating?: number
  profile?: { full_name: string; email: string }
}

const supabase = createBrowserSupabaseClient()

export default function AdminExtras() {
  const [tab, setTab] = useState<AdminTab>('users')
  const [users, setUsers] = useState<UserRow[]>([])
  const [activity, setActivity] = useState<ActivityRow[]>([])
  const [feedback, setFeedback] = useState<FeedbackRow[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Payout state
  const [payoutRecipient, setPayoutRecipient] = useState('')
  const [payoutAmount, setPayoutAmount] = useState('')
  const [payoutNote, setPayoutNote] = useState('')
  const [payoutError, setPayoutError] = useState('')
  const [payoutSuccess, setPayoutSuccess] = useState('')
  const [sendingPayout, setSendingPayout] = useState(false)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, account_status, subscription_plan, created_at, stripe_account_status, role')
      .order('created_at', { ascending: false })
      .limit(50)
    setUsers(data ?? [])
    setLoading(false)
  }, [])

  const loadActivity = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('activity_log')
      .select('id, created_at, action, resource_type, severity, user_id')
      .order('created_at', { ascending: false })
      .limit(100)
    setActivity(data ?? [])
    setLoading(false)
  }, [])

  const loadFeedback = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('user_feedback')
      .select('id, created_at, feedback_type, message, rating, user_id')
      .order('created_at', { ascending: false })
      .limit(100)
    setFeedback(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (tab === 'users') loadUsers()
    else if (tab === 'activity') loadActivity()
    else if (tab === 'feedback') loadFeedback()
  }, [tab, loadUsers, loadActivity, loadFeedback])

  async function setAccountStatus(userId: string, status: 'active' | 'suspended' | 'deactivated') {
    setActionLoading(userId)
    const { error } = await supabase.from('profiles').update({ account_status: status }).eq('id', userId)
    if (!error) setUsers(prev => prev.map(u => u.id === userId ? { ...u, account_status: status } : u))
    setActionLoading(null)
  }

  async function sendPayout() {
    setPayoutError(''); setPayoutSuccess(''); setSendingPayout(true)
    try {
      const res = await fetch('/api/admin/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_id: payoutRecipient,
          amount_cents: Math.round(parseFloat(payoutAmount) * 100),
          note: payoutNote,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setPayoutError(data.error ?? 'Failed'); return }
      setPayoutSuccess(`Transfer sent! ID: ${data.transfer_id}`)
      setPayoutRecipient(''); setPayoutAmount(''); setPayoutNote('')
    } finally { setSendingPayout(false) }
  }

  const statusColor: Record<string, string> = {
    active: '#10B981', suspended: '#F59E0B', deactivated: '#EF4444',
  }

  const severityColor: Record<string, string> = {
    info: 'rgba(255,255,255,0.25)', warning: '#F59E0B', error: '#EF4444', critical: '#EF4444',
  }

  const filteredUsers = users.filter(u =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const TABS: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: 'users', label: 'User Management', icon: <Users size={14} /> },
    { key: 'activity', label: 'Activity Log', icon: <Activity size={14} /> },
    { key: 'feedback', label: 'User Feedback', icon: <MessageSquare size={14} /> },
    { key: 'payout', label: 'Admin Payout', icon: <DollarSign size={14} /> },
  ]

  return (
    <div style={{ marginBottom: '3rem' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 950, letterSpacing: '-0.03em', marginBottom: '1.25rem', color: '#F3F4F6' }}>
        Platform <span style={{ color: '#10B981' }}>Operations</span>
      </h2>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.5rem 1rem', borderRadius: '10px', border: 'none',
            background: tab === t.key ? '#10B981' : 'rgba(255,255,255,0.05)',
            color: tab === t.key ? '#000' : 'rgba(255,255,255,0.5)',
            fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer',
          }}>{t.icon}{t.label}</button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.3)' }}><Loader2 size={22} style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }} /></div>}

      {/* ─── Users ─── */}
      {!loading && tab === 'users' && (
        <div>
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.5rem 0.85rem' }}>
              <Search size={14} color="rgba(255,255,255,0.3)" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#E5E7EB', fontSize: '0.85rem', fontFamily: 'inherit' }} />
            </div>
          </div>
          <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Name', 'Email', 'Plan', 'Status', 'Stripe', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.65rem 1rem', textAlign: 'left', fontWeight: 800, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '0.7rem 1rem', color: '#E5E7EB', fontWeight: 700 }}>{u.full_name}</td>
                    <td style={{ padding: '0.7rem 1rem', color: 'rgba(255,255,255,0.4)' }}>{u.email}</td>
                    <td style={{ padding: '0.7rem 1rem' }}><span style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', fontSize: '0.65rem', fontWeight: 900, padding: '2px 6px', borderRadius: '5px', textTransform: 'uppercase' }}>{u.subscription_plan ?? 'free'}</span></td>
                    <td style={{ padding: '0.7rem 1rem' }}><span style={{ color: statusColor[u.account_status] ?? '#888', fontWeight: 800, fontSize: '0.75rem' }}>{u.account_status ?? 'active'}</span></td>
                    <td style={{ padding: '0.7rem 1rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem' }}>{u.stripe_account_status ?? '—'}</td>
                    <td style={{ padding: '0.7rem 1rem' }}>
                      {actionLoading === u.id ? <Loader2 size={14} style={{ display: 'inline', animation: 'spin 1s linear infinite' }} /> : (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {u.account_status !== 'active' && (
                            <button onClick={() => setAccountStatus(u.id, 'active')} title="Activate" style={{ background: 'rgba(16,185,129,0.1)', border: 'none', borderRadius: '6px', padding: '4px 8px', color: '#10B981', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 800 }}>Activate</button>
                          )}
                          {u.account_status !== 'suspended' && u.role !== 'admin' && (
                            <button onClick={() => setAccountStatus(u.id, 'suspended')} title="Suspend" style={{ background: 'rgba(245,158,11,0.1)', border: 'none', borderRadius: '6px', padding: '4px 8px', color: '#F59E0B', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 800 }}>Suspend</button>
                          )}
                          {u.account_status !== 'deactivated' && u.role !== 'admin' && (
                            <button onClick={() => { if (window.confirm(`Permanently deactivate ${u.full_name}?`)) setAccountStatus(u.id, 'deactivated') }} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '6px', padding: '4px 8px', color: '#EF4444', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 800 }}>Deactivate</button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>No users found</div>}
          </div>
        </div>
      )}

      {/* ─── Activity Log ─── */}
      {!loading && tab === 'activity' && (
        <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Time', 'User', 'Action', 'Resource', 'Severity'].map(h => (
                  <th key={h} style={{ padding: '0.65rem 1rem', textAlign: 'left', fontWeight: 800, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activity.map((a, i) => (
                <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '0.6rem 1rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{new Date(a.created_at).toLocaleTimeString()}</td>
                  <td style={{ padding: '0.6rem 1rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.user_id.slice(0, 8)}…</td>
                  <td style={{ padding: '0.6rem 1rem', color: '#E5E7EB', fontWeight: 700 }}>{a.action}</td>
                  <td style={{ padding: '0.6rem 1rem', color: 'rgba(255,255,255,0.4)' }}>{a.resource_type ?? '—'}</td>
                  <td style={{ padding: '0.6rem 1rem' }}><span style={{ color: severityColor[a.severity] ?? 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase' }}>{a.severity}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {activity.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>No activity logged yet</div>}
        </div>
      )}

      {/* ─── User Feedback ─── */}
      {!loading && tab === 'feedback' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {feedback.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>No feedback submitted yet</div>}
          {feedback.map(f => (
            <div key={f.id} style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', fontSize: '0.65rem', fontWeight: 900, padding: '2px 6px', borderRadius: '5px', textTransform: 'uppercase' }}>{f.feedback_type}</span>
                  {f.rating && <span style={{ fontSize: '0.75rem', color: '#F59E0B' }}>{'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</span>}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>{new Date(f.created_at).toLocaleDateString()}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.55 }}>{f.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* ─── Admin Payout ─── */}
      {tab === 'payout' && (
        <div style={{ maxWidth: 480 }}>
          <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
              <strong style={{ color: '#EF4444' }}>⚠ Admin action.</strong> This sends real money via Stripe. The recipient must have an active connected bank account. All payouts are logged.
            </p>
          </div>
          {payoutError && <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: '8px', padding: '0.6rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.82rem', color: '#EF4444' }}>{payoutError}</div>}
          {payoutSuccess && <div style={{ background: 'rgba(16,185,129,0.1)', borderRadius: '8px', padding: '0.6rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.82rem', color: '#10B981' }}>{payoutSuccess}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Recipient User ID</label>
              <input value={payoutRecipient} onChange={e => setPayoutRecipient(e.target.value)} placeholder="UUID of recipient" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Amount (USD)</label>
              <input value={payoutAmount} onChange={e => setPayoutAmount(e.target.value)} placeholder="e.g. 50.00" type="number" min="1" step="0.01" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Note (optional)</label>
              <input value={payoutNote} onChange={e => setPayoutNote(e.target.value)} placeholder="Reason for payment…" maxLength={200} style={inputStyle} />
            </div>
            <button
              onClick={sendPayout}
              disabled={!payoutRecipient || !payoutAmount || sendingPayout}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                background: '#10B981', border: 'none', borderRadius: '10px', color: '#000',
                fontWeight: 900, fontSize: '0.85rem', padding: '0.75rem', cursor: 'pointer',
                opacity: (!payoutRecipient || !payoutAmount || sendingPayout) ? 0.5 : 1,
              }}
            >
              {sendingPayout ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
              Send Payout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }
const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.65rem 0.9rem', color: '#F3F4F6', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none' }
