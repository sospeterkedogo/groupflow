'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Settings, Save, AlertCircle, CheckCircle2 } from 'lucide-react'
import TransientError from '@/components/TransientError'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
       const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
       if (data) {
         setProfile(data)
         setFullName(data.full_name || '')
       }
    }
    setLoading(false)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    
    if (!profile) return
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', profile.id)
      
    setSaving(false)
    
    if (updateError) {
       setError("Failed to update profile settings.")
    } else {
       setSuccess(true)
       setTimeout(() => setSuccess(false), 3000)
    }
  }

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading parameters...</div>
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
       <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
         <Settings size={28} color="var(--primary-color)" />
         <h1 style={{ fontSize: '2rem', margin: 0, fontWeight: 800 }}>Account Settings</h1>
       </div>
       
       {error && <TransientError message={error} />}
       
       <div className="auth-card" style={{ maxWidth: '100%', margin: 0 }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Personal Identity</h2>
          
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
               <label className="form-label">Full Name</label>
               <input 
                 type="text" 
                 className="form-input" 
                 value={fullName}
                 onChange={e => setFullName(e.target.value)}
                 placeholder="Enter your legal representation"
               />
            </div>
            
            <div className="form-group" style={{ opacity: 0.5 }}>
               <label className="form-label">Email Address (Locked)</label>
               <input 
                 type="text" 
                 className="form-input" 
                 value={profile?.email || 'Authenticated globally via Github'}
                 disabled
               />
               <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>Email constraints are locked to OAuth binding.</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: 'auto' }}>
                 <Save size={18} />
                 {saving ? 'Syncing...' : 'Save Configuration'}
              </button>
              
              {success && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-color)', fontSize: '0.875rem', fontWeight: 500 }}>
                   <CheckCircle2 size={16} /> Update deployed to network
                </div>
              )}
            </div>
          </form>
       </div>
    </div>
  )
}
