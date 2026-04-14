'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Settings, Save, CheckCircle2, Shield, Download, Trash2, Key, AlertTriangle, X } from 'lucide-react'
import TransientError from '@/components/TransientError'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Danger Zone Modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleDownloadData = () => {
     // Route directly to GET endpoint downloading the compiler JSON blob
     window.open('/api/account', '_blank')
  }

  const handleAccountTermination = async () => {
     if (deleteConfirmation !== 'DELETE') return
     setIsDeleting(true)
     setError(null)
     
     try {
       const res = await fetch('/api/account', { method: 'DELETE' })
         
       if (!res.ok) {
          const message = await res.text()
          throw new Error(message)
       }
       
       // Force Sign Out & Local Storage Wipe
       await supabase.auth.signOut()
       window.location.href = '/login'
     } catch (err: any) {
       setError(err.message)
       setIsDeleting(false)
       setIsDeleteModalOpen(false)
     }
  }

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Mounting security boundaries...</div>
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
       
       <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
         <Settings size={28} color="var(--primary-color)" />
         <h1 style={{ fontSize: '2rem', margin: 0, fontWeight: 800 }}>Global Account Hierarchy</h1>
       </div>
       
       {error && <TransientError message={error} />}
       
       {/* 1. PERSONAL INFO ZONE */}
       <div className="auth-card" style={{ maxWidth: '100%', margin: 0, borderTop: '4px solid var(--primary-color)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>Personal Identity Boundaries</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Manage how your algorithmic signature represents itself to peers across GroupFlow.</p>
          
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group" style={{ maxWidth: '400px' }}>
               <label className="form-label">Active Full Name</label>
               <input 
                 type="text" 
                 className="form-input" 
                 value={fullName}
                 onChange={e => setFullName(e.target.value)}
                 placeholder="Enter your legal representation"
               />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: 'auto' }}>
                 <Save size={18} />
                 {saving ? 'Syncing Networks...' : 'Save Configuration'}
              </button>
              
              {success && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-color)', fontSize: '0.875rem', fontWeight: 500 }}>
                   <CheckCircle2 size={16} /> Broadcasted globally.
                </div>
              )}
            </div>
          </form>
       </div>

       {/* 2. SECURITY PROTOCOLS */}
       <div className="auth-card" style={{ maxWidth: '100%', margin: 0, borderLeft: '4px solid var(--accent-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Shield size={20} color="var(--accent-color)" />
            <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 600 }}>Security Constraints</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Your authentication is strictly delegated to external secure providers.</p>
          
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ backgroundColor: 'black', color: 'white', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Key size={20} />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Linked to Github Identity</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{profile?.email || 'Encrypted Payload Address'}</span>
             </div>
             <span className="badge" style={{ marginLeft: 'auto', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)' }}>Active & Verified</span>
          </div>
       </div>

       {/* 3. DATA & PRIVACY ZONE */}
       <div className="auth-card" style={{ maxWidth: '100%', margin: 0, border: '1px solid rgba(239, 68, 68, 0.2)', backgroundColor: 'transparent' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <AlertTriangle size={20} color="var(--danger-color)" />
            <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 600, color: 'var(--danger-color)' }}>Data Portability & Deletion</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Export your entire algorithmic footprint, or securely wipe your existence from the network.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             
             {/* Read / Export Array */}
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                   <span style={{ fontWeight: 600 }}>Export Configuration Archive</span>
                   <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Download a full JSON compilation of all your tasks and evidence.</span>
                </div>
                <button className="btn btn-secondary" onClick={handleDownloadData} style={{ width: 'auto' }}>
                   <Download size={16} /> Dump Payload
                </button>
             </div>

             {/* Delete Matrix */}
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                   <span style={{ fontWeight: 600, color: 'var(--danger-color)' }}>Permanent Obliteration</span>
                   <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Eradicate your profile, auth-token, and data streams instantly.</span>
                </div>
                <button 
                  className="btn" 
                  onClick={() => setIsDeleteModalOpen(true)}
                  style={{ width: 'auto', backgroundColor: 'var(--danger-color)', color: 'white' }}
                >
                   <Trash2 size={16} /> Delete Account
                </button>
             </div>

          </div>
       </div>

       {/* Danger Zone Modal */}
       {isDeleteModalOpen && (
         <div className="modal-overlay" style={{ zIndex: 9999 }}>
            <div className="modal-content" style={{ maxWidth: '400px', borderTop: '4px solid var(--danger-color)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--danger-color)' }}>Confirm Annihilation</h3>
                  <button onClick={() => setIsDeleteModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                     <X size={20} />
                  </button>
               </div>
               
               <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                 This action is irreversible. It bypasses soft-deletes and natively destroys your global Supabase Auth token. You will instantly lose access to all modules and your Validity Score.
               </p>
               
               <div className="form-group">
                 <label className="form-label" style={{ color: 'var(--text-color)' }}>
                   Type <strong>DELETE</strong> below to confirm
                 </label>
                 <input 
                   type="text" 
                   className="form-input" 
                   style={{ border: '1px solid var(--danger-color)', backgroundColor: 'rgba(239, 68, 68, 0.05)', color: 'var(--danger-color)', fontWeight: 'bold' }}
                   value={deleteConfirmation}
                   onChange={e => setDeleteConfirmation(e.target.value)}
                   placeholder="Type DELETE"
                 />
               </div>
               
               <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                 <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>Cancel</button>
                 <button 
                   className="btn" 
                   onClick={handleAccountTermination} 
                   disabled={isDeleting || deleteConfirmation !== 'DELETE'}
                   style={{ backgroundColor: 'var(--danger-color)', color: 'white', opacity: deleteConfirmation === 'DELETE' ? 1 : 0.5 }}
                 >
                   {isDeleting ? 'Obliterating...' : 'Permanently Terminate'}
                 </button>
               </div>
            </div>
         </div>
       )}

    </div>
  )
}
