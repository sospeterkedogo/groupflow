'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
  Settings, Save, CheckCircle2, Shield, Download, Trash2,
  Key, AlertTriangle, X, Camera, Palette as PaletteIcon,
  Image as ImageIcon, User, Layout, MapPin, ChevronRight, Users,
  UserMinus, Eye, EyeOff, ShieldAlert, Activity as PulseIcon, History, Mail,
  Calendar
} from 'lucide-react'
import ActiveUsersList from '@/components/ActiveUsersList'
import ActivityLogView from '@/components/ActivityLogView'
import EmailCenter from '@/components/EmailCenter'
import TransientError from '@/components/TransientError'
import imageCompression from 'browser-image-compression'
import { useTheme, PALETTES } from '@/context/ThemeContext'
import { kickUser } from '../join/actions'
import { logActivity } from '@/utils/logging'

type Tab = 'identity' | 'pulse' | 'activity' | 'intercom' | 'security' | 'appearance' | 'workspace' | 'data' | 'team'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('identity')
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [courseName, setCourseName] = useState('')
  const [enrollmentYear, setEnrollmentYear] = useState<number>(new Date().getFullYear())
  const [completionYear, setCompletionYear] = useState<number>(new Date().getFullYear() + 3)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { currentPalette, setPalette, customBg, setCustomBg } = useTheme()
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingBg, setUploadingBg] = useState(false)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [availableGroups, setAvailableGroups] = useState<any[]>([])
  const [switching, setSwitching] = useState(false)

  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [isEncrypted, setIsEncrypted] = useState(false)
  const [updatingGroup, setUpdatingGroup] = useState(false)
  const [customToolInput, setCustomToolInput] = useState('')
  const [pendingRequests, setPendingRequests] = useState<string[]>([])
  const [sentRequests, setSentRequests] = useState<string[]>([])

  const supabase = createClient()

  useEffect(() => {
    fetchUserData()
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    const { data } = await supabase.from('groups').select('*').order('name')
    if (data) setAvailableGroups(data)
  }

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('profiles').select('*, groups(*)').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setFullName(data.full_name || '')
        setCourseName(data.course_name || '')
        setEnrollmentYear(data.enrollment_year || new Date().getFullYear())
        setCompletionYear(data.completion_year || new Date().getFullYear() + 3)
        setAvatarUrl(data.avatar_url || '')
        setIsEncrypted(data.groups?.is_encrypted || false)

        if (data.role === 'admin' && data.group_id) {
          fetchTeam(data.group_id)
        }
      }
    }
    setLoading(false)
  }

  const fetchTeam = async (groupId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('group_id', groupId)
    if (data) setTeamMembers(data)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    if (!profile) return

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        course_name: courseName,
        enrollment_year: enrollmentYear,
        completion_year: completionYear
      })
      .eq('id', profile.id)

    setSaving(false)
    if (updateError) setError("Failed to update profile settings.")
    else {
      // Verifiable Logging
      logActivity(profile.id, profile.group_id, 'setting_updated', 'Updated personal profile details and academic journey')
      window.dispatchEvent(new CustomEvent('PROFILE_UPDATED'))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'bg') => {
    try {
      const file = e.target.files?.[0]
      if (!file || !profile) return

      if (type === 'avatar') setUploadingAvatar(true)
      else setUploadingBg(true)

      setError(null)
      const compressedFile = await imageCompression(file, { maxSizeMB: 0.8, maxWidthOrHeight: 1200, useWebWorker: true })
      const fileName = `${profile.id}-${type}-${Date.now()}.jpg`

      const { error: uploadError } = await supabase.storage.from('groupflow_assets').upload(fileName, compressedFile, { upsert: true })
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('groupflow_assets').getPublicUrl(fileName)
      const publicUrl = data.publicUrl

      if (type === 'avatar') {
        await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id)
        setAvatarUrl(publicUrl)
      } else {
        await setCustomBg(publicUrl)
      }
      window.dispatchEvent(new CustomEvent('PROFILE_UPDATED'))

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError("Upload failed: " + err.message)
    } finally {
      setUploadingAvatar(false)
      setUploadingBg(false)
    }
  }

  const handleToggleEncryption = async () => {
    if (!profile?.group_id) return
    setUpdatingGroup(true)
    const nextValue = !isEncrypted

    const { error: updateError } = await supabase
      .from('groups')
      .update({ is_encrypted: nextValue })
      .eq('id', profile.group_id)

    if (updateError) setError(`Failed to update visibility: ${updateError.message}`)
    else {
      // Verifiable Logging
      logActivity(
        profile.id,
        profile.group_id,
        'privacy_toggled',
        `Changed group visibility to ${nextValue ? 'Encrypted' : 'Public'}`
      )
      setIsEncrypted(nextValue)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setUpdatingGroup(false)
  }

  const handleKickUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member from the team? They will lose access to all tasks and chat.')) return

    const res = await kickUser(userId)
    if (res.error) {
      setError(res.error)
    } else {
      setTeamMembers(prev => prev.filter(m => m.id !== userId))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  const handleDownloadData = () => window.open('/api/account', '_blank')

  const handleSwitchGroup = async (newGroupId: string | null) => {
    if (!profile) return
    setSwitching(true)
    setError(null)

    const { error: switchError } = await supabase
      .from('profiles')
      .update({ group_id: newGroupId, role: 'collaborator' })
      .eq('id', profile.id)

    if (switchError) setError("Failed to switch team.")
    else {
      await fetchUserData()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setSwitching(false)
  }

  const handleAccountTermination = async () => {
    if (deleteConfirmation !== 'DELETE') return
    setIsDeleting(true)
    try {
      const res = await fetch('/api/account', { method: 'DELETE' })
      if (!res.ok) throw new Error(await res.text())
      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch (err: any) {
      setError(err.message)
      setIsDeleting(false)
      setIsDeleteModalOpen(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-sub)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ border: '3px solid var(--border)', borderTop: '3px solid var(--brand)', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <span>Loading settings...</span>
        </div>
      </div>
    )
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="page-fade" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 var(--p-safe)' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        <div style={{ padding: '8px', background: 'var(--brand)', borderRadius: '12px' }}>
          <Settings size={28} color="white" />
        </div>
        <h1 className="fluid-h1" style={{ margin: 0, fontWeight: 900 }}>Settings</h1>
      </div>

      {error && <TransientError message={error} />}

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        borderBottom: '1px solid var(--border)', 
        marginBottom: '2.5rem', 
        overflowX: 'auto', 
        paddingBottom: '0.75rem',
        marginLeft: 'calc(var(--p-safe) * -1)',
        marginRight: 'calc(var(--p-safe) * -1)',
        paddingLeft: 'var(--p-safe)',
        paddingRight: 'var(--p-safe)',
        scrollbarWidth: 'none'
      }}>
        {[
          { id: 'identity', label: 'Profile', icon: User },
          { id: 'pulse', label: 'Presence', icon: PulseIcon },
          { id: 'activity', label: 'History', icon: History },
          { id: 'intercom', label: 'Mail', icon: Mail },
          { id: 'team', label: 'Admin', icon: Shield, hidden: !isAdmin },
          { id: 'workspace', label: 'My Team', icon: MapPin },
          { id: 'appearance', label: 'Look', icon: PaletteIcon },
          { id: 'security', label: 'Security', icon: Shield },
          { id: 'data', label: 'Privacy', icon: AlertTriangle },
        ].filter(t => !t.hidden).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem',
              background: activeTab === tab.id ? 'var(--brand)' : 'var(--bg-sub)',
              color: activeTab === tab.id ? 'white' : 'var(--text-sub)',
              border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700,
              transition: 'all 0.2s ease', whiteSpace: 'nowrap', fontSize: '0.8rem'
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Panels */}
      <div style={{ minHeight: '400px' }}>

        {activeTab === 'intercom' && profile && (
          <div className="auth-card" style={{ maxWidth: '100%' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Direct Intercom & Mail</h2>
            <p style={{ color: 'var(--text-sub)', marginBottom: '2.5rem' }}>Management hub for automated reminders and verifiable PDF reports.</p>
            <EmailCenter groupId={profile.group_id} profile={profile} teamMembers={teamMembers} />
          </div>
        )}

        {activeTab === 'activity' && profile && (
          <div className="auth-card" style={{ maxWidth: '100%' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Personal Audit Log</h2>
            <p style={{ color: 'var(--text-sub)', marginBottom: '2.5rem' }}>A verifiable history of your actions, contributions, and customizations.</p>
            <ActivityLogView userId={profile.id} />
          </div>
        )}

        {activeTab === 'pulse' && profile?.group_id && (
          <div className="auth-card" style={{ maxWidth: '100%' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Live Team Activity</h2>
            <p style={{ color: 'var(--text-sub)', marginBottom: '2.5rem' }}>Real-time awareness of your collaborators and recently seen members.</p>
            <ActiveUsersList groupId={profile.group_id} currentUser={profile} />
          </div>
        )}

        {activeTab === 'identity' && (
          <div className="auth-card" style={{ maxWidth: '100%' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Personal Profile</h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2.5rem', flexWrap: 'wrap', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--bg-sub)', border: '2px solid var(--border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={48} color="var(--text-sub)" />
                  )}
                </div>
                <label style={{ position: 'absolute', bottom: '0', right: '0', width: '36px', height: '36px', borderRadius: '50%', background: 'var(--brand)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-md)', border: '3px solid var(--surface)' }}>
                  <Camera size={18} />
                  <input type="file" accept="image/*" capture="user" onChange={e => handleFileUpload(e, 'avatar')} style={{ display: 'none' }} />
                </label>
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Profile Photo</h3>
                <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Update your professional identity.</p>
                {uploadingAvatar && <p style={{ fontSize: '0.8rem', color: 'var(--brand)', fontWeight: 700, marginTop: '0.5rem' }}>Uploading...</p>}
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your name" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">What are you studying?</label>
                  <input type="text" className="form-input" value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="e.g. Computer Science with AI" />
                </div>
              </div>

              <div style={{ background: 'rgba(var(--brand-rgb), 0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} color="var(--brand)" />
                  Academic Journey Timeline
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Enrollment Year</label>
                    <input type="number" className="form-input" value={enrollmentYear} onChange={e => setEnrollmentYear(parseInt(e.target.value))} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Expected Completion</label>
                    <input type="number" className="form-input" value={completionYear} onChange={e => setCompletionYear(parseInt(e.target.value))} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: 'auto' }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                {success && <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.9rem' }}>Changes saved.</span>}
              </div>
            </form>
          </div>
        )}

        {activeTab === 'team' && isAdmin && (
          <div className="auth-card" style={{ maxWidth: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Team Management</h2>
                <p style={{ color: 'var(--text-sub)' }}>Manage collaborators and group visibility settings.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', background: isEncrypted ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', border: `1px solid ${isEncrypted ? 'var(--error)' : 'var(--success)'}` }}>
                {isEncrypted ? <Shield size={18} color="var(--error)" /> : <Eye size={18} color="var(--success)" />}
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isEncrypted ? 'var(--error)' : 'var(--success)' }}>
                  {isEncrypted ? 'VISIBILITY: ENCRYPTED' : 'VISIBILITY: PUBLIC'}
                </span>
                <button
                  onClick={handleToggleEncryption}
                  disabled={updatingGroup}
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', marginLeft: '0.5rem' }}
                >
                  Toggle
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {teamMembers.map(member => (
                <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: 'var(--bg-sub)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface)', overflow: 'hidden' }}>
                      {member.avatar_url ? <img src={member.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={20} style={{ margin: '10px' }} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{member.full_name || 'Anonymous'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--brand)', fontWeight: 700, textTransform: 'uppercase' }}>{member.role}</div>
                    </div>
                  </div>

                  {member.id !== profile.id && member.role !== 'admin' && (
                    <button
                      onClick={() => handleKickUser(member.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid var(--error)', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
                    >
                      <UserMinus size={16} /> Kick
                    </button>
                  )}
                  {member.id === profile.id && <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 700 }}>YOU</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'workspace' && (
          <div className="auth-card" style={{ maxWidth: '100%' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Team Management</h2>
            <p style={{ color: 'var(--text-sub)', marginBottom: '2rem' }}>Switch to a different project team or module.</p>

            <div style={{ background: 'var(--bg-sub)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase' }}>Current Team</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{profile?.groups?.name || 'No team assigned'}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>{profile?.groups?.module_code || 'Independent'}</div>
              </div>
              {profile?.group_id && (
                <button
                  onClick={() => handleSwitchGroup(null)}
                  disabled={switching}
                  className="btn"
                  style={{ width: 'auto', background: 'transparent', border: '1px solid var(--error)', color: 'var(--error)' }}
                >
                  Leave Team
                </button>
              )}
            </div>

            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', fontWeight: 700 }}>Other Teams</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {availableGroups.filter(g => g.id !== profile?.group_id).map(group => {
                const isPending = pendingRequests.includes(group.id)
                const isSent = sentRequests.includes(group.id)

                const handleQuickRequest = async () => {
                  if (isPending || isSent) return
                  setPendingRequests(prev => [...prev, group.id])
                  try {
                    const { sendJoinRequest } = await import('../join/actions')
                    await sendJoinRequest(group.id, fullName || 'A student')
                    setSentRequests(prev => [...prev, group.id])
                  } catch (err: any) {
                    setError('Request failed: ' + err.message)
                  } finally {
                    setPendingRequests(prev => prev.filter(id => id !== group.id))
                  }
                }

                return (
                  <div
                    key={group.id}
                    style={{ padding: '1.25rem', background: 'var(--bg-sub)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{group.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--brand)', fontWeight: 700 }}>{group.module_code}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                       <button
                         onClick={handleQuickRequest}
                         disabled={isPending || isSent}
                         className={isSent ? "btn btn-ghost" : "btn btn-secondary"}
                         style={{ width: 'auto', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: isSent ? 0.7 : 1, fontSize: isSent ? '0.75rem' : '0.85rem' }}
                       >
                         {isPending ? <div className="spinner-mini" /> : isSent ? <CheckCircle2 size={16} color="var(--success)" /> : null}
                         {isPending ? 'Sending...' : isSent ? 'Request sent. Waiting for team leader approval' : 'Request'}
                       </button>
                       <button
                         onClick={() => window.location.href = `/dashboard/analytics/${group.id}`}
                         className="btn btn-ghost"
                         style={{ width: 'auto', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                         title="Preview Analytics"
                       >
                         <Eye size={18} />
                       </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="auth-card" style={{ maxWidth: '100%' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Appearance Settings</h2>

            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PaletteIcon size={20} color="var(--brand)" /> Color Themes
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {PALETTES.map(p => (
                  <button
                    key={p.name}
                    onClick={() => setPalette(p.name)}
                    style={{
                      padding: '1.25rem', background: 'var(--bg-sub)', border: currentPalette.name === p.name ? '2px solid var(--brand)' : '1px solid var(--border)',
                      borderRadius: 'var(--radius)', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{p.name}</span>
                      {currentPalette.name === p.name && <CheckCircle2 size={16} color="var(--brand)" />}
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {Object.values(p.colors).slice(0, 5).map((c, i) => (
                        <div key={i} style={{ width: '20px', height: '20px', borderRadius: '4px', background: c, border: '1px solid rgba(0,0,0,0.1)' }} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ImageIcon size={20} color="var(--brand)" /> Background Image
              </h3>
              <div style={{ background: 'var(--bg-sub)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '2rem', textAlign: 'center' }}>
                {customBg ? (
                  <div style={{ position: 'relative', width: '200px', height: '100px', borderRadius: 'var(--radius)', overflow: 'hidden', margin: '0 auto 1.5rem', border: '2px solid var(--brand)' }}>
                    <img src={customBg} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      onClick={() => setCustomBg(null)}
                      style={{ position: 'absolute', top: '5px', right: '5px', background: 'var(--error)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px dashed var(--border)' }}>
                    <ImageIcon size={30} color="var(--text-sub)" />
                  </div>
                )}
                <label className="btn btn-secondary" style={{ width: 'auto', cursor: 'pointer' }}>
                  {uploadingBg ? 'Saving...' : customBg ? 'Change Image' : 'Upload Image'}
                  <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'bg')} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="auth-card" style={{ maxWidth: '100%' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Identity & Integrations</h2>
            <p style={{ color: 'var(--text-sub)', marginBottom: '2rem' }}>Configure your technical provenance and project toolkit connections.</p>

            <div style={{ background: 'var(--bg-sub)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 0 15px rgba(0,0,0,0.2)' }}>
                <Key size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Primary Identity: GitHub</h3>
                <p style={{ margin: 0, color: 'var(--text-sub)', fontSize: '0.875rem' }}>{profile?.email}</p>
              </div>
              <span className="badge badge-code" style={{ marginLeft: 'auto', padding: '0.4rem 0.8rem', background: 'var(--success)', color: 'white', border: 'none' }}>Verified Connection</span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle2 color="var(--brand)" size={22} /> Technical Arsenal
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                {(() => {
                  const DEFAULT_TOOLS = [
                    'React', 'Next.js', 'Tailwind', 
                    'Node.js', 'Python', 'Supabase', 'PostgreSQL', 
                    'AWS', 'Docker', 'Vercel',
                    'Figma', 'VS Code'
                   ]
                   
                   // Combine defaults with any custom ones user has added
                   const userAchievements = profile?.achievements || []
                   const userCustomTools = userAchievements
                    .filter((a: any) => !DEFAULT_TOOLS.includes(a.name))
                    .map((a: any) => a.name)
                   
                   const allTools = [...DEFAULT_TOOLS, ...userCustomTools]
                   
                   return allTools.map(tool => {
                    const isConnected = userAchievements.some((a: any) => a.name === tool)
                    
                    const toggleTool = async () => {
                      const achievements = profile.achievements || []
                      let newAchievements
                      if (isConnected) {
                        newAchievements = achievements.filter((a: any) => a.name !== tool)
                      } else {
                        newAchievements = [...achievements, { name: tool, date: new Date().toISOString() }]
                      }
                      
                      setProfile({ ...profile, achievements: newAchievements })
                      const { error } = await supabase.from('profiles').update({ achievements: newAchievements }).eq('id', profile.id)
                      if (error) {
                        setError("Synchronization failed.")
                        setProfile(profile)
                      } else {
                        logActivity(profile.id, profile.group_id, isConnected ? 'setting_updated' : 'theme_changed', `${isConnected ? 'Disconnected' : 'Connected'} ${tool} to arsenal`)
                        setSuccess(true)
                        setTimeout(() => setSuccess(false), 3000)
                      }
                    }

                    return (
                      <div 
                        key={tool}
                        onClick={toggleTool}
                        style={{
                          padding: '1.25rem',
                          background: isConnected ? 'rgba(var(--brand-rgb), 0.05)' : 'var(--bg-sub)',
                          border: isConnected ? '2px solid var(--brand)' : '1px solid var(--border)',
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          cursor: 'pointer'
                        }}
                      >
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: isConnected ? 'var(--brand)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isConnected ? 'white' : 'var(--text-sub)' }}>
                               <Settings size={16} />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isConnected ? 'var(--text-main)' : 'var(--text-sub)' }}>{tool}</span>
                         </div>
                         
                         <div style={{ padding: '0.4rem', color: isConnected ? 'var(--error)' : 'var(--brand)' }}>
                            {isConnected ? <Trash2 size={16} /> : <CheckCircle2 size={16} />}
                         </div>
                      </div>
                    )
                   })
                })()}

                {/* Custom Add Card */}
                <div 
                  style={{
                    padding: '1.25rem',
                    background: 'var(--bg-sub)',
                    border: '1.5px dashed var(--border)',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <Settings size={14} color="var(--brand)" />
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Add Custom</span>
                   </div>
                   <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g. Docker" 
                        value={customToolInput}
                        onChange={e => setCustomToolInput(e.target.value)}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter' && customToolInput.trim()) {
                            const toolName = customToolInput.trim()
                            const achievements = profile.achievements || []
                            if (achievements.some((a: any) => a.name.toLowerCase() === toolName.toLowerCase())) {
                              setError("This tool is already in your arsenal.")
                              return
                            }
                            const newAchievements = [...achievements, { name: toolName, date: new Date().toISOString() }]
                            setProfile({ ...profile, achievements: newAchievements })
                            const { error } = await supabase.from('profiles').update({ achievements: newAchievements }).eq('id', profile.id)
                            if (error) {
                              setError("Failed to add custom tool.")
                            } else {
                              setCustomToolInput('')
                              setSuccess(true)
                              setTimeout(() => setSuccess(false), 3000)
                            }
                          }
                        }}
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} 
                      />
                   </div>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="auth-card" style={{ maxWidth: '100%' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Personal Data Management</h2>
              <p style={{ color: 'var(--text-sub)', marginBottom: '2rem' }}>Audit and export your activity within the GroupFlow ecosystem.</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'var(--bg-sub)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                <div>
                  <h4 style={{ margin: 0 }}>Export My Data</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-sub)' }}>Download all your task and activity data.</p>
                </div>
                <button className="btn btn-secondary" onClick={handleDownloadData} style={{ width: 'auto' }}>Export</button>
              </div>
            </div>

            <div className="auth-card" style={{ maxWidth: '100%', border: '1.5px solid var(--error)', background: 'rgba(239, 68, 68, 0.02)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trash2 size={24} /> Danger Zone
              </h2>
              <p style={{ color: 'var(--text-sub)', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Terminating your account is an irreversible action. You will lose access to all teams, progress metrics, specialized badges, and verifiable audit logs.
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--error)', fontWeight: 800 }}>Delete this account</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-sub)' }}>Once you delete your account, there is no going back. Please be certain.</p>
                </div>
                <button 
                  className="btn" 
                  onClick={() => setIsDeleteModalOpen(true)}
                  style={{ width: 'auto', background: 'var(--error)', color: 'white' }}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isDeleteModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '450px', textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem', color: 'var(--error)' }}><AlertTriangle size={60} /></div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Final Confirmation</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.6 }}>
              This will <strong>permanently delete</strong> your GroupFlow account and all associated data. This action cannot be undone.
            </p>
            <input
              type="text" className="form-input" placeholder="Type DELETE to confirm" value={deleteConfirmation}
              onChange={e => setDeleteConfirmation(e.target.value)}
              style={{ border: '2px solid var(--error)', textAlign: 'center', fontWeight: 'bold' }}
            />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button
                className="btn" onClick={handleAccountTermination} disabled={isDeleting || deleteConfirmation !== 'DELETE'}
                style={{ background: 'var(--error)', color: 'white', opacity: deleteConfirmation === 'DELETE' ? 1 : 0.4 }}
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
       `}</style>
    </div>
  )
}
