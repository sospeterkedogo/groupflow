'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Settings, Save, CheckCircle2, Shield, Download, Trash2, Key, AlertTriangle, X, Camera } from 'lucide-react'
import TransientError from '@/components/TransientError'
import imageCompression from 'browser-image-compression'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Biometric Avatar Integration
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  
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
         setAvatarUrl(data.avatar_url || '')
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     try {
       const file = e.target.files?.[0]
       if (!file || !profile) return
       setUploadingAvatar(true)
       setError(null)
       
       // Squeeze the file bytes locally on device before wasting bandwidth limits
       const compressedFile = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 800, useWebWorker: true })
       
       const fileName = `${profile.id}-${Date.now()}.jpg`
       
       // Force upload to specifically public bucket
       const { error: uploadError } = await supabase.storage.from('groupflow_assets').upload(fileName, compressedFile, { upsert: true })
       if (uploadError) throw uploadError
       
       // Retrieve public network node URI
       const { data: publicUrlData } = supabase.storage.from('groupflow_assets').getPublicUrl(fileName)
       
       // Link biometric url directly to central ID registry
       await supabase.from('profiles').update({ avatar_url: publicUrlData.publicUrl }).eq('id', profile.id)
       
       setAvatarUrl(publicUrlData.publicUrl)
       setSuccess(true)
       setTimeout(() => setSuccess(false), 3000)
     } catch (err: any) {
       setError("Image upload failed: " + err.message)
     } finally {
       setUploadingAvatar(false)
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
         <h1 style={{ fontSize: '2rem', margin: 0, fontWeight: 800 }}>Settings</h1>
       </div>
       
       {error && <TransientError message={error} />}
       
       {/* 1. PERSONAL INFO ZONE */}
       <div className="auth-card" style={{ maxWidth: '100%', margin: 0, borderTop: '4px solid var(--primary-color)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>Personal Information</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Manage your profile details and how you appear to others on GroupFlow.</p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
             <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', border: '2px dashed var(--accent-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile Picture" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Camera size={32} color="var(--text-secondary)" />
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="user" 
                  onChange={handleAvatarUpload} 
                  disabled={uploadingAvatar} 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                  title="Upload Profile Picture"
                />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column' }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>Profile Picture</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Click to upload an image or take a photo.<br/>Images are automatically compressed.</p>
                {uploadingAvatar && <p style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>Uploading image...</p>}
             </div>
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group" style={{ maxWidth: '400px' }}>
               <label className="form-label">Full Name</label>
               <input 
                 type="text" 
                 className="form-input" 
                 value={fullName}
                 onChange={e => setFullName(e.target.value)}
                 placeholder="Enter your name"
               />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: 'auto' }}>
                 <Save size={18} />
                 {saving ? 'Saving...' : 'Save Settings'}
              </button>
              
              {success && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-color)', fontSize: '0.875rem', fontWeight: 500 }}>
                   <CheckCircle2 size={16} /> Successfully saved.
                </div>
              )}
            </div>
          </form>
       </div>

       {/* 2. SECURITY PROTOCOLS */}
       <div className="auth-card" style={{ maxWidth: '100%', margin: 0, borderLeft: '4px solid var(--accent-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Shield size={20} color="var(--accent-color)" />
            <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 600 }}>Security</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Manage your sign-in methods.</p>
          
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
            <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 600, color: 'var(--danger-color)' }}>Data & Privacy</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Download your data or request account deletion.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             
             {/* Read / Export Array */}
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                   <span style={{ fontWeight: 600 }}>Export Data</span>
                   <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Download a complete JSON record of your tasks.</span>
                </div>
                <button className="btn btn-secondary" onClick={handleDownloadData} style={{ width: 'auto' }}>
                   <Download size={16} /> Download
                </button>
             </div>

             {/* Delete Matrix */}
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                   <span style={{ fontWeight: 600, color: 'var(--danger-color)' }}>Delete Account</span>
                   <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Permanently remove your profile and data.</span>
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
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--danger-color)' }}>Delete Account</h3>
                  <button onClick={() => setIsDeleteModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                     <X size={20} />
                  </button>
               </div>
               
               <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                 This action is irreversible. All your data, profile, and active modules will be permanently removed.
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
                   {isDeleting ? 'Deleting...' : 'Delete Forever'}
                 </button>
               </div>
            </div>
         </div>
       )}

    </div>
  )
}
