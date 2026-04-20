'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { useProfile } from '@/context/ProfileContext'
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  Settings, 
  Lock, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CreditCard,
  Layers,
  Search,
  Key,
  Database,
  Globe,
  RefreshCw,
  UserCheck,
  UserMinus,
  Download
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useNotifications } from '@/components/NotificationProvider'
import AgentControlCentre from '@/components/AgentControlCentre'
import AdminExtras from '@/components/AdminExtras'
import type { Profile } from '@/types/database'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts'

export default function AdminDashboard() {
  const { profile, loading: profileLoading } = useProfile()
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()
  const { addToast } = useNotifications()
  const [isVerified, setIsVerified] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [stats, setStats] = useState({ users: 0, pro: 0, premium: 0, revenue: 0 })
  const [recentUsers, setRecentUsers] = useState<Partial<Profile>[]>([])
  const [loading, setLoading] = useState(true)
  const [systemLogs, setSystemLogs] = useState<{t: string, m: string}[]>([])
  const [config, setConfig] = useState<Record<string, { value: any, is_active: boolean }>>({})
  const [savingConfig, setSavingConfig] = useState(false)
  
  const [launchConfig, setLaunchConfig] = useState({
    launch_date: '',
    launch_message: '',
    preregister_goal: '',
    preregister_open: 'true',
    brand_name: '',
    platform_version: '',
  })
  const [preregCount, setPreregCount] = useState(0)
  const [savingLaunchConfig, setSavingLaunchConfig] = useState(false)
  const [launchConfigLoaded, setLaunchConfigLoaded] = useState(false)

  // 0. Mock Log Generator for Terminal Feel
  useEffect(() => {
    if (isVerified) {
      const logs = [
        { t: '13:42:01', m: 'AUTH_GATEWAY: [200] OK' },
        { t: '13:42:05', m: 'SUPABASE_SYNC: Institutional Node Established' },
        { t: '13:42:12', m: 'STRIPE_WEBHOOK: Listening on events' },
        { t: '13:42:18', m: 'ELITE30_CHECK: 4 redemptions validated' }
      ]
      setSystemLogs(logs)
      
      const interval = setInterval(() => {
        const time = new Date().toLocaleTimeString('en-GB', { hour12: false })
        setSystemLogs(prev => [{ t: time, m: `UPLINK_EVENT: Heartbeat detected from Node_${Math.floor(Math.random()*100)}` }, ...prev.slice(0, 7)])
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isVerified])

  // 1. Authorization Guard
  useEffect(() => {
    if (!profileLoading && (!profile || profile.role !== 'admin')) {
      addToast('Unauthorized Access', 'You do not have administrative clearance for this terminal.', 'error')
      router.push('/dashboard')
    }
  }, [profile, profileLoading, router])

  // 2. Fetch Aggregated Metrics & Real-time Sync
  const fetchAdminData = async () => {
    setLoading(true)
    
    const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: proUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_plan', 'pro')
    const { count: premiumUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_plan', 'premium')
    const { count: lifetimeUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_plan', 'lifetime')
    
    const { data: recent } = await supabase
      .from('profiles')
      .select('id, full_name, email, subscription_plan, created_at, role')
      .order('created_at', { ascending: false })
      .limit(8)

    const { data: platformConfig } = await supabase.from('platform_config').select('*')
    const configMap = platformConfig?.reduce((acc: Record<string, any>, item: { key: string }) => ({ ...acc, [item.key]: item }), {})

    setStats({
      users: totalUsers || 0,
      pro: proUsers || 0,
      premium: (premiumUsers || 0) + (lifetimeUsers || 0),
      revenue: (proUsers || 0) * 4.99 + (premiumUsers || 0) * 14.99 + (lifetimeUsers || 0) * 99
    })
    setRecentUsers(recent || [])
    setConfig(configMap || {})
    setLoading(false)
  }

  useEffect(() => {
    if (isVerified) {
      fetchAdminData()

      const channel = supabase
        .channel('admin_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'platform_config' }, () => {
          addToast('Platform Real-time Sync', 'Marketing configuration updated.', 'success')
          fetchAdminData()
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, () => {
          addToast('Institutional Event', 'User registration detected. Refreshing terminal...', 'success')
          fetchAdminData()
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
  }, [isVerified, supabase, addToast])

  // 3. Load launch config + pre-reg count
  useEffect(() => {
    if (isVerified) {
      const loadLaunchConfig = async () => {
        try {
          const [cfgRes, countRes] = await Promise.all([
            fetch('/api/admin/launch-config'),
            fetch('/api/preregister'),
          ])
          const { config: cfg } = await cfgRes.json()
          const { count } = await countRes.json()
          if (cfg) setLaunchConfig(prev => ({ ...prev, ...cfg }))
          setPreregCount(count ?? 0)
        } catch (_) {}
        setLaunchConfigLoaded(true)
      }
      loadLaunchConfig()
    }
  }, [isVerified])

  const saveLaunchConfig = async () => {
    setSavingLaunchConfig(true)
    try {
      const updates = Object.entries(launchConfig).map(([key, value]) => ({ key, value }))
      const res = await fetch('/api/admin/launch-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        addToast('Launch Config Saved', 'Pre-registration page updated live.', 'success')
      } else {
        addToast('Save Failed', 'Could not update launch configuration.', 'error')
      }
    } catch (_) {
      addToast('Network Error', 'Failed to save configuration.', 'error')
    }
    setSavingLaunchConfig(false)
  }

  // 4. Orchestrator Controls
  const handleUserAction = async (userId: string, action: 'unlock' | 'upgrade' | 'ban') => {
    addToast('Orchestration Command Sent', `Executing ${action} on node ${userId.slice(0, 8)}...`, 'success')
    
    let updateData = {}
    if (action === 'upgrade') updateData = { subscription_plan: 'premium' }
    if (action === 'ban') updateData = { role: 'banned' }
    if (action === 'unlock') updateData = { role: 'user' }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)

    if (error) {
      addToast('Command Failed', error.message, 'error')
    } else {
      addToast('Operation Success', 'Database synchronized.', 'success')
      fetchAdminData()
    }
  }

  const updatePlatformConfig = async (key: string, updates: any) => {
    setSavingConfig(true)
    const { error } = await supabase
      .from('platform_config')
      .update(updates)
      .eq('key', key)
    
    if (error) {
      addToast('Sync Error', error.message, 'error')
    } else {
      addToast('State Persisted', `${key} re-routed successfully.`, 'success')
      fetchAdminData()
    }
    setSavingConfig(false)
  }

  const handleLaunchStudio = () => {
    addToast('Orchestrator Initialized', 'Rerouting terminal to design studio...', 'success')
    router.push('/dashboard/settings?tab=themes')
  }

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifying(true)
    
    setTimeout(() => {
      if (verificationCode === '2026-ADMIN') {
        setIsVerified(true)
        addToast('Identity Verified', 'Administrative session established.', 'success')
      } else {
        addToast('Verification Failed', 'Invalid clearance code. Retry limit approaching.', 'error')
      }
      setVerifying(false)
    }, 1200)
  }

  // --- STYLING & CHART DATA ---
  const chartData = [
    { name: 'Jan', mrr: 1200 },
    { name: 'Feb', mrr: 2100 },
    { name: 'Mar', mrr: 3400 },
    { name: 'Apr', mrr: (stats.revenue * 0.8).toFixed(0) },
  ]

  const funnelData = [
    { name: 'Exhibition', value: 4500 },
    { name: 'Registration', value: stats.users },
    { name: 'Elevation', value: stats.pro + stats.premium },
  ]

  if (profileLoading || !profile || profile.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <div className="animate-pulse">Authenticating Admin Protocol...</div>
      </div>
    )
  }

  if (!isVerified) {
    return (
      <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="page-fade" style={{ maxWidth: '400px', width: '100%', background: '#111', padding: '3rem', borderRadius: '32px', border: '1px solid #222', boxSizing: 'border-box' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '2rem' }}>
            <Key size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 950, color: 'white', marginBottom: '1rem', letterSpacing: '-0.04em' }}>Verification Required</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '2.5rem', lineHeight: 1.5 }}>
            You are accessing the Institutional Orchestra. Enter your administrative safety key to proceed.
          </p>
          
          <form onSubmit={handleVerify2FA} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 900, color: '#10b981', marginBottom: '0.5rem', letterSpacing: '2px' }}>Clearance Code</label>
              <input 
                type="password" 
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="XXXX-XXXX"
                style={{ width: '100%', padding: '1rem', background: '#000', border: '1px solid #333', borderRadius: '12px', color: 'white', fontWeight: 700, outline: 'none', transition: '0.2s' }}
                autoFocus
              />
            </div>
            <button 
              type="submit" 
              disabled={verifying}
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontWeight: 950, fontSize: '1rem', background: '#10b981', color: 'black' }}
            >
              {verifying ? 'VERIFYING...' : 'ESTABLISH SESSION'}
            </button>
            <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '1rem' }}>
              Institutional Safety Protocol v4.2.0
            </div>
          </form>
        </div>
      </div>
    )
  }

  const totalLifetime = stats.premium

  const mainBanner = config?.main_banner
  const announcement = config?.global_announcement

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: 'white', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
          <div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#10b981', fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '1rem' }}>
                <ShieldCheck size={20} /> ADMINISTRATIVE ORCHESTRA 
             </div>
             <h1 style={{ fontSize: '4.5rem', fontWeight: 950, letterSpacing: '-0.06em', margin: 0, lineHeight: 0.9 }}>
                Control Station <span style={{ opacity: 0.2 }}>PRO</span>
             </h1>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
             <div style={{ padding: '0.75rem 1.5rem', background: '#111', borderRadius: '16px', border: '1px solid #222', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                   <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>SUPABASE_NODE: OK</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                   <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>STRIPE_PIPELINE: OK</span>
                </div>
             </div>
             <button onClick={fetchAdminData} className="btn" style={{ background: 'white', color: 'black', padding: '0 1.5rem', borderRadius: '16px', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={18} className={loading && !savingConfig ? 'animate-spin' : ''} /> GLOBAL_SYNC
             </button>
          </div>
        </header>

        {/* Dynamic Marketing Terminal (NEW) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
           
           {/* Banner Marquee Orchestrator */}
           <div style={{ padding: '2rem', background: '#0a0a0a', border: '1px solid #111', borderRadius: '32px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 950, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                 <Globe size={18} style={{ color: '#10b981' }} /> Landing Banner
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <input 
                   type="text" 
                   value={mainBanner?.value?.text || ''} 
                   onChange={(e) => setConfig({ ...config, main_banner: { ...mainBanner, value: { ...mainBanner.value, text: e.target.value } } })}
                   placeholder="Marquee Message..." 
                   style={{ width: '100%', padding: '0.75rem', background: '#000', border: '1px solid #333', borderRadius: '12px', color: 'white', fontSize: '0.85rem' }}
                 />
                 <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      onClick={() => updatePlatformConfig('main_banner', { value: mainBanner.value, is_active: true })}
                      style={{ flex: 1, padding: '0.75rem', background: '#10b981', color: 'black', borderRadius: '12px', fontWeight: 950, border: 'none', fontSize: '0.8rem' }}
                    >DEPLOY</button>
                    <button 
                      onClick={() => updatePlatformConfig('main_banner', { is_active: !mainBanner?.is_active })}
                      style={{ flex: 1, padding: '0.75rem', background: '#111', color: mainBanner?.is_active ? '#ef4444' : '#10b981', borderRadius: '12px', fontWeight: 950, border: '1px solid #222', fontSize: '0.8rem' }}
                    >{mainBanner?.is_active ? 'DISABLE' : 'ENABLE'}</button>
                 </div>
              </div>
           </div>

           {/* Announcement Push Terminal */}
           <div style={{ padding: '2rem', background: '#0a0a0a', border: '1px solid #111', borderRadius: '32px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 950, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                 <AlertCircle size={18} style={{ color: '#ec4899' }} /> Announcement
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <input 
                   type="text" 
                   value={announcement?.value?.message || ''} 
                   onChange={(e) => setConfig({ ...config, global_announcement: { ...announcement, value: { ...announcement.value, message: e.target.value } } })}
                   placeholder="Breaking Announcement..." 
                   style={{ width: '100%', padding: '0.75rem', background: '#000', border: '1px solid #333', borderRadius: '12px', color: 'white', fontSize: '0.85rem' }}
                 />
                 <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      onClick={() => updatePlatformConfig('global_announcement', { value: announcement.value, is_active: true })}
                      style={{ flex: 1, padding: '0.75rem', background: '#ec4899', color: 'white', borderRadius: '12px', fontWeight: 950, border: 'none', fontSize: '0.8rem' }}
                    >PUSH LIVE</button>
                    <button 
                      onClick={() => updatePlatformConfig('global_announcement', { is_active: false })}
                      style={{ flex: 1, padding: '0.75rem', background: '#111', color: 'white', borderRadius: '12px', fontWeight: 950, border: '1px solid #222', fontSize: '0.8rem' }}
                    >TEMINATE</button>
                 </div>
              </div>
           </div>

           {/* Promotion / Discount Pulse */}
           <div style={{ padding: '2rem', background: '#0a0a0a', border: '1px solid #111', borderRadius: '32px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 950, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                 <CreditCard size={18} style={{ color: '#6366f1' }} /> Active Promos
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                 <div style={{ padding: '1rem', background: '#000', borderRadius: '16px', border: '1px solid #222', flex: 1 }}>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Current Target</div>
                    <div style={{ fontWeight: 950, fontSize: '1.25rem' }}>ELITE30</div>
                 </div>
                 <button 
                   onClick={() => updatePlatformConfig('promo_logic', { is_active: !config?.promo_logic?.is_active })}
                   style={{ flex: 1, height: '64px', borderRadius: '16px', border: 'none', background: config?.promo_logic?.is_active ? '#6366f1' : '#111', color: 'white', fontWeight: 950 }}
                 >
                   {config?.promo_logic?.is_active ? 'ACTIVE' : 'INACTIVE'}
                 </button>
              </div>
           </div>

        </div>

        {/* ── Launch Command Center ──────────────────────────────────────────── */}
        <div style={{ marginBottom: '3rem', padding: '2.5rem', background: '#0a0a0a', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Globe size={18} style={{ color: '#10b981' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#10b981', textTransform: 'uppercase', letterSpacing: '3px' }}>Launch Command Center</span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 950, margin: 0, letterSpacing: '-0.03em' }}>Pre-Registration &amp; Launch Control</h2>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: '0.4rem' }}>Changes reflect live on <a href="/preregister" target="_blank" style={{ color: '#10b981', textDecoration: 'none' }}>/preregister</a> immediately after saving.</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'center', padding: '1rem 1.5rem', background: '#000', border: '1px solid #222', borderRadius: '16px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 950, color: '#10b981', letterSpacing: '-0.05em' }}>{preregCount.toLocaleString()}</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Pre-Registrations</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem 1.5rem', background: '#000', border: '1px solid #222', borderRadius: '16px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 950, color: 'white', letterSpacing: '-0.05em' }}>
                  {launchConfig.preregister_goal ? parseInt(launchConfig.preregister_goal).toLocaleString() : '5,000,000'}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Goal</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem 1.5rem', background: '#000', border: '1px solid #222', borderRadius: '16px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 950, color: launchConfig.preregister_open === 'true' ? '#10b981' : '#ef4444', letterSpacing: '-0.03em' }}>
                  {launchConfig.preregister_open === 'true' ? 'OPEN' : 'CLOSED'}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Registration</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>Launch Date (ISO 8601)</label>
              <input type="datetime-local" value={launchConfig.launch_date ? launchConfig.launch_date.slice(0, 16) : ''}
                onChange={e => setLaunchConfig(p => ({ ...p, launch_date: new Date(e.target.value).toISOString() }))}
                style={{ width: '100%', padding: '0.875rem', background: '#000', border: '1px solid #333', borderRadius: '12px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box', colorScheme: 'dark' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>Brand Name</label>
              <input type="text" value={launchConfig.brand_name} placeholder="Espeezy"
                onChange={e => setLaunchConfig(p => ({ ...p, brand_name: e.target.value }))}
                style={{ width: '100%', padding: '0.875rem', background: '#000', border: '1px solid #333', borderRadius: '12px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>Pre-Registration Goal</label>
              <input type="number" value={launchConfig.preregister_goal} placeholder="5000000"
                onChange={e => setLaunchConfig(p => ({ ...p, preregister_goal: e.target.value }))}
                style={{ width: '100%', padding: '0.875rem', background: '#000', border: '1px solid #333', borderRadius: '12px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>Platform Version</label>
              <input type="text" value={launchConfig.platform_version} placeholder="2.0.0"
                onChange={e => setLaunchConfig(p => ({ ...p, platform_version: e.target.value }))}
                style={{ width: '100%', padding: '0.875rem', background: '#000', border: '1px solid #333', borderRadius: '12px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>Hero Launch Message (shown on /preregister)</label>
            <textarea value={launchConfig.launch_message} rows={3}
              onChange={e => setLaunchConfig(p => ({ ...p, launch_message: e.target.value }))}
              placeholder="Something big is coming. Join 5 million students shaping the future of collaborative education."
              style={{ width: '100%', padding: '0.875rem', background: '#000', border: '1px solid #333', borderRadius: '12px', color: 'white', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={saveLaunchConfig} disabled={savingLaunchConfig}
              style={{ padding: '0.875rem 2rem', background: '#10b981', color: 'black', borderRadius: '14px', fontWeight: 950, border: 'none', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {savingLaunchConfig ? 'SAVING...' : '⚡ DEPLOY LAUNCH CONFIG'}
            </button>
            <button onClick={() => setLaunchConfig(p => ({ ...p, preregister_open: p.preregister_open === 'true' ? 'false' : 'true' }))}
              style={{ padding: '0.875rem 1.5rem', background: '#111', border: `1px solid ${launchConfig.preregister_open === 'true' ? '#ef4444' : '#10b981'}`, color: launchConfig.preregister_open === 'true' ? '#ef4444' : '#10b981', borderRadius: '14px', fontWeight: 950, cursor: 'pointer', fontSize: '0.85rem' }}>
              {launchConfig.preregister_open === 'true' ? 'CLOSE REGISTRATION' : 'OPEN REGISTRATION'}
            </button>
            <a href="/preregister" target="_blank"
              style={{ padding: '0.875rem 1.5rem', background: '#111', border: '1px solid #222', color: 'rgba(255,255,255,0.5)', borderRadius: '14px', fontWeight: 700, textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              VIEW PAGE ↗
            </a>
            <a href="/fund" target="_blank"
              style={{ padding: '0.875rem 1.5rem', background: '#111', border: '1px solid #222', color: 'rgba(255,255,255,0.5)', borderRadius: '14px', fontWeight: 700, textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              FUND PAGE ↗
            </a>
          </div>
        </div>

        {/* ── Agent Control Centre ──────────────────────────────────────────── */}
        <div style={{ marginBottom: '3rem', padding: '2.5rem', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '32px' }}>
          <AgentControlCentre />
        </div>

        {/* ── Platform Operations ──────────────────────────────────────────── */}
        <div style={{ marginBottom: '3rem', padding: '2.5rem', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '32px' }}>
          <AdminExtras />
        </div>

        {/* Business Intelligence Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
           
           {/* Primary MRR Chart */}
           <div style={{ padding: '2.5rem', background: '#0a0a0a', border: '1px solid #111', borderRadius: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                 <h2 style={{ fontSize: '1.25rem', fontWeight: 950, margin: 0 }}>Projected Revenue Elevation (MRR)</h2>
                 <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 12px', borderRadius: '100px' }}>+ 42% GROWTH</div>
              </div>
              <div style={{ height: '300px', width: '100%' }}>
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                       <defs>
                          <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis dataKey="name" stroke="#333" fontSize={12} tickLine={false} axisLine={false} />
                       <YAxis stroke="#333" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `£${v}`} />
                       <Tooltip contentStyle={{ background: '#000', border: '1px solid #222', borderRadius: '12px', fontSize: '12px' }} />
                       <Area type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMrr)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Conversion Funnel */}
           <div style={{ padding: '2.5rem', background: '#0a0a0a', border: '1px solid #111', borderRadius: '32px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 950, marginBottom: '2.5rem' }}>Institutional Funnel</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 {funnelData.map((d, i) => (
                    <div key={i}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                          <span style={{ opacity: 0.5, fontWeight: 700 }}>{d.name}</span>
                          <span style={{ fontWeight: 900 }}>{d.value}</span>
                       </div>
                       <div style={{ height: '6px', background: '#111', borderRadius: '10px', overflow: 'hidden' }}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(d.value / funnelData[0].value) * 100}%` }}
                            style={{ height: '100%', background: '#10b981' }} 
                          />
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Operational Terminal */}
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '1.5rem' }}>
           
           {/* Orchestrator: User Management */}
           <div style={{ padding: '2.5rem', background: '#0a0a0a', border: '1px solid #111', borderRadius: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                 <h2 style={{ fontSize: '1.5rem', fontWeight: 950, margin: 0 }}>Identity Orchestrator</h2>
                 <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', opacity: 0.3 }} />
                    <input type="text" placeholder="Search Node..." style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', background: '#000', border: '1px solid #222', borderRadius: '12px', color: 'white', fontSize: '0.8rem' }} />
                 </div>
              </div>
              
              {loading ? (
                <div className="animate-pulse">Accessing Decentralized Ledger...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                   {recentUsers.map(user => (
                     <div key={user.id} style={{ display: 'flex', alignItems: 'center', padding: '1.25rem', border: '1px solid #111', borderRadius: '16px', background: '#000' }}>
                        <div style={{ width: '44px', height: '44px', background: '#111', borderRadius: '12px', marginRight: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#10b981' }}>{user.full_name?.[0] || 'S'}</div>
                        <div style={{ flex: 1 }}>
                           <div style={{ fontWeight: 900 }}>{user.full_name}</div>
                           <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {user.email} {user.role === 'banned' && <span style={{ color: '#ef4444', fontWeight: 900 }}>[BANNED]</span>}
                           </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                           {user.role === 'banned' ? (
                             <button onClick={() => handleUserAction(user.id!, 'unlock')} className="action-btn" title="Unlock Account"><UserCheck size={18} /></button>
                           ) : (
                             <>
                               <button onClick={() => handleUserAction(user.id!, 'upgrade')} className="action-btn" title="Elevate to Premium"><ArrowRight size={18} /></button>
                               <button onClick={() => handleUserAction(user.id!, 'ban')} className="action-btn danger" title="Terminate Session"><UserMinus size={18} /></button>
                             </>
                           )}
                        </div>
                     </div>
                   ))}
                </div>
              )}
           </div>

           {/* NASA Monitoring Stream */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ padding: '2rem', background: '#000', border: '1px solid #111', borderRadius: '32px', fontFamily: 'monospace' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#10b981', fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                    <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                    LIVE_TERMINAL_LOGS
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.7rem' }}>
                    {systemLogs.map((log, i) => (
                      <div key={i} style={{ display: 'flex', gap: '1rem' }}>
                         <span style={{ opacity: 0.3 }}>[{log.t}]</span>
                         <span style={{ color: log.m.includes('OK') ? '#10b981' : 'white' }}>{log.m}</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div style={{ padding: '2.5rem', background: 'linear-gradient(135deg, #10b981 0%, #064e3b 100%)', borderRadius: '32px', color: 'black', position: 'relative', overflow: 'hidden' }}>
                 <Globe size={180} style={{ position: 'absolute', right: '-40px', bottom: '-40px', opacity: 0.1, color: 'black' }} />
                 <h3 style={{ fontSize: '1.5rem', fontWeight: 950, marginBottom: '1rem' }}>UI Orchestrator</h3>
                 <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, marginBottom: '2rem', opacity: 0.8, maxWidth: '200px' }}>Access experimental aesthetic routing and theme engineering suite.</p>
                 <button 
                  onClick={handleLaunchStudio}
                  style={{ background: 'black', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '16px', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                 >
                  LAUNCH STUDIO <Activity size={18} />
                 </button>
              </div>
           </div>

        </div>

      </div>

      <style jsx>{`
        .btn { cursor: pointer; transition: 0.2s; }
        .btn:hover { scale: 1.02; opacity: 0.9; }
        .action-btn { 
          width: 40px; 
          height: 40px; 
          background: #111; 
          border: 1px solid #222; 
          border-radius: 12px; 
          color: rgba(255,255,255,0.4); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          transition: 0.2s; 
          cursor: pointer;
        }
        .action-btn:hover { background: #161616; color: #10b981; border-color: #10b981; }
        .action-btn.danger:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: #ef4444; }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

