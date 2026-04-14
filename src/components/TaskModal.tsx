'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Task, TaskStatus, Artifact } from '@/types/database'
import { X, Trash2, ExternalLink, ThumbsUp, FileUp, GitCommit, Link as LinkIcon, UserPlus, UserMinus, UserCircle, Check } from 'lucide-react'
import { usePresence } from './PresenceProvider'
import { logActivity } from '@/utils/logging'

const COLUMNS: TaskStatus[] = ['To Do', 'In Progress', 'In Review', 'Done']

export default function TaskModal({ 
  task, 
  groupId, 
  onClose,
  onRefresh,
  initialDueDate
}: { 
  task: Task | null, 
  groupId: string,
  onClose: () => void,
  onRefresh: () => void,
  initialDueDate?: string
}) {
  const isEditMode = !!task

  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'To Do')
  const [isCodingTask, setIsCodingTask] = useState(task ? task.is_coding_task : true)
  const [assignees, setAssignees] = useState<string[]>(task?.assignees || [])
  const [dueDate, setDueDate] = useState<string>(
    task?.due_date 
      ? task.due_date.substring(0, 10) 
      : initialDueDate 
        ? initialDueDate 
        : ''
  )
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const { onlineUsers } = usePresence()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Evidence Logic
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [evidenceLoading, setEvidenceLoading] = useState(isEditMode)
  const [newUrl, setNewUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user))
    fetchMembers()
  }, [groupId])

  const fetchMembers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, email, school_id')
      .eq('group_id', groupId)
    if (data) setMembers(data)
  }

  useEffect(() => {
    if (!isEditMode) return
    
    fetchArtifacts()
    const channel = supabase
      .channel(`task_${task.id}_artifacts`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'artifacts', filter: `task_id=eq.${task.id}` }, () => {
        fetchArtifacts()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [task?.id])

  const fetchArtifacts = async () => {
    if (!task) return
    const { data } = await supabase
      .from('artifacts')
      .select('*')
      .eq('task_id', task.id)
      .order('created_at', { ascending: false })
    
    if (data) setArtifacts(data as Artifact[])
    setEvidenceLoading(false)
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Title is required.")
      return
    }

    setLoading(true)
    setError(null)

    const payload = {
      title,
      description,
      status,
      is_coding_task: isCodingTask,
      group_id: groupId,
      assignees, // Pass array payload!
      due_date: dueDate ? new Date(dueDate).toISOString() : null
    }

    let err
    if (isEditMode) {
      const { error } = await supabase.from('tasks').update(payload).eq('id', task.id)
      err = error
    } else {
      const { error } = await supabase.from('tasks').insert([payload])
      err = error
    }

    setLoading(false)

    if (err) {
      setError(`Failed to save task: ${err.message}`)
    } else {
      // Verifiable Logging
      if (currentUser) {
        logActivity(
          currentUser.id,
          groupId,
          isEditMode ? 'task_updated' : 'task_created',
          isEditMode ? `Updated task: ${title}` : `Created task: ${title}`,
          { task_id: task?.id || 'new' }
        )
      }
      onRefresh()
      onClose()
    }
  }

  const handleDelete = async () => {
    if (!task) return
    if (!confirm("Are you absolutely sure you want to permanently delete this task?")) return

    setLoading(true)
    const { error } = await supabase.from('tasks').delete().eq('id', task.id)
    setLoading(false)

    if (error) {
      setError(`Failed to delete: ${error.message}`)
    } else {
      // Verifiable Logging
      if (currentUser) {
        logActivity(
          currentUser.id,
          groupId,
          'task_deleted',
          `Deleted task: ${task.title}`
        )
      }
      onRefresh()
      onClose()
    }
  }

  const toggleMemberAssignment = async (memberId: string) => {
    const isCurrentlyAssigned = assignees.includes(memberId)
    const newAssignees = isCurrentlyAssigned 
      ? assignees.filter(id => id !== memberId) 
      : [...assignees, memberId]
      
    setAssignees(newAssignees)

    if (isEditMode) {
       setLoading(true)
       const { error } = await supabase.from('tasks').update({ assignees: newAssignees }).eq('id', task.id)
       if (error) {
          setError(`Failed to update assignment: ${error.message}`)
          setAssignees(task.assignees || [])
       } else {
          onRefresh()
       }
       setLoading(false)
    }
  }

  // EVIDENCE CRUD INTEGRATION
  const handleUploadEvidence = async () => {
    if (!newUrl || !task) return
    setUploading(true)
    setError(null)
    
    if (!currentUser) {
      setError("Not authenticated.")
      setUploading(false)
      return
    }

    const payload = {
      task_id: task.id,
      file_url: newUrl,
      uploaded_by: currentUser.id
    }
    
    // Instant Optimistic Update
    const optimisticArtifact = { id: Math.random().toString(), endorsements_count: 0, created_at: new Date().toISOString(), ...payload }
    setArtifacts([optimisticArtifact as any, ...artifacts])
    setNewUrl('')

    const { error: dbError } = await supabase.from('artifacts').insert([payload])

    if (dbError) {
      setError(`Failed to attach evidence: ${dbError.message}`)
      fetchArtifacts() // Revert
    } else {
      // Verifiable Logging
      logActivity(
        currentUser.id,
        groupId,
        'artifact_uploaded',
        `Attached a link to task`,
        { task_id: task.id }
      )
    }
    setUploading(false)
  }

  const handlePhysicalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     try {
       const file = e.target.files?.[0]
       if (!file || !task || !currentUser) return
       setUploading(true)
       setError(null)
       
       const fileName = `evidence-${task.id}-${Date.now()}-${file.name}`
       
       const { error: uploadError } = await supabase.storage.from('groupflow_assets').upload(fileName, file)
       if (uploadError) throw uploadError
       
       const { data: publicUrlData } = supabase.storage.from('groupflow_assets').getPublicUrl(fileName)
       
       const payload = {
         task_id: task.id,
         file_url: publicUrlData.publicUrl,
         uploaded_by: currentUser.id
       }
       
       const { error: dbError } = await supabase.from('artifacts').insert([payload])
       if (dbError) throw dbError
       
       fetchArtifacts() // Re-sync network state explicitly
     } catch (err: any) {
       setError("File upload failed: " + err.message)
     } finally {
       setUploading(false)
     }
  }

  const handleDeleteArtifact = async (artifactId: string) => {
    // Instant Optimistic Update
    const original = [...artifacts]
    setArtifacts(artifacts.filter(a => a.id !== artifactId))
    
    const { error } = await supabase.from('artifacts').delete().eq('id', artifactId)
    if (error) {
      setError(`Failed to delete: ${error.message}`)
      setArtifacts(original)
    } else {
      // Verifiable Logging
      if (currentUser) {
        logActivity(
          currentUser.id,
          groupId,
          'artifact_uploaded',
          `Removed an attachment from task`,
          { task_id: task?.id || 'deleted' }
        )
      }
    }
  }

  const handleEndorse = async (artifactId: string, currentCount: number) => {
    // Instant Optimistic Update
    setArtifacts(artifacts.map(a => a.id === artifactId ? { ...a, endorsements_count: currentCount + 1 } : a))
    
    const { error } = await supabase
      .from('artifacts')
      .update({ endorsements_count: currentCount + 1 })
      .eq('id', artifactId)

    if (error) {
      fetchArtifacts() // Revert optimism
      setError(`Failed to endorse: ${error.message}`)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxWidth: '650px' }}>
        
        {/* Sleek Google-style Header */}
        <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-sub)' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isEditMode ? 'Edit Task' : 'New Task'}
            {isEditMode && assignees.length > 0 && (
               <span className="badge" style={{ backgroundColor: 'var(--brand)', color: 'white', marginLeft: '0.5rem' }}>
                 {assignees.length} Member{assignees.length !== 1 && 's'} assigned
               </span>
            )}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-sub)' }}>
             <X size={24} />
          </button>
        </div>

        <div style={{ padding: '2rem', overflowY: 'auto' }}>
          {error && <div className="error-message" style={{ marginBottom: '1.5rem' }}>{error}</div>}

          {/* Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Task Name</label>
              <input 
                className="form-input" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="What needs to be done?"
                autoFocus
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Description</label>
              <textarea 
                className="form-input" 
                value={description || ''} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Add more details about this task..."
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

             <div style={{ display: 'flex', gap: '1rem', width: '100%', alignItems: 'center' }}>
               <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                 <label className="form-label">Status</label>
                 <select className="form-input" value={status} onChange={e => setStatus(e.target.value as TaskStatus)}>
                   {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
               </div>
               
               <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                 <label className="form-label">Category</label>
                 <select className="form-input" value={isCodingTask ? 'true' : 'false'} onChange={e => setIsCodingTask(e.target.value === 'true')}>
                   <option value="true">Coding</option>
                   <option value="false">Design</option>
                 </select>
               </div>
               
               <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                 <label className="form-label" style={{ color: 'var(--error)' }}>Due Date</label>
                 <input 
                   type="date"
                   className="form-input"
                   value={dueDate}
                   onChange={e => setDueDate(e.target.value)}
                   style={{ borderColor: dueDate ? 'var(--border)' : 'var(--error)' }}
                 />
               </div>
             </div>
            
            {/* COLLABORATOR SELECTION GRID */}
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Assignments</label>
                <div style={{ position: 'relative', width: '220px' }}>
                  <input 
                    type="text" 
                    placeholder="Search name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ 
                      width: '100%', 
                      fontSize: '0.75rem', 
                      padding: '0.4rem 0.75rem', 
                      borderRadius: '8px', 
                      border: '1px solid var(--border)', 
                      background: 'var(--bg-main)' 
                    }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem', maxHeight: '200px', overflowY: 'auto', padding: '0.25rem' }}>
                {members
                  .filter(m => 
                    !searchQuery || 
                    m.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    m.school_id?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(member => {
                  const isAssigned = assignees.includes(member.id)
                  const isOnline = onlineUsers.has(member.id)
                  const initials = member.full_name ? member.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : '?'

                  return (
                    <div 
                      key={member.id}
                      onClick={() => toggleMemberAssignment(member.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        borderRadius: '12px',
                        backgroundColor: isAssigned ? 'var(--bg-sub)' : 'transparent',
                        border: isAssigned ? '1px solid var(--brand)' : '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        boxShadow: isAssigned ? 'var(--shadow-sm)' : 'none'
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        {member.avatar_url ? (
                          <img 
                            src={member.avatar_url} 
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} 
                            alt={member.full_name}
                          />
                        ) : (
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--brand)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                            {initials}
                          </div>
                        )}
                        {isOnline && (
                          <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success)', border: '2px solid var(--surface)', boxShadow: '0 0 4px var(--success)' }} />
                        )}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{member.full_name || 'Anonymous'}</div>
                        <div style={{ fontSize: '0.65rem', color: isOnline ? 'var(--success)' : 'var(--text-sub)', fontWeight: 500 }}>{isOnline ? 'Online Now' : 'Offline'}</div>
                      </div>
                      {isAssigned && (
                        <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--brand)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={12} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Peer Verification Sub-Panel (Only in Edit Mode) */}
          {isEditMode && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', marginTop: '1.5rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                 <LinkIcon size={18} color="var(--brand)" />
                 <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>Attachments</h3>
               </div>
               <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Add links or upload files to show the task is complete.</p>

               <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                 <input 
                   type="url" 
                   className="form-input" 
                   placeholder="Add a link (Figma, Docs, etc.)"
                   value={newUrl}
                   onChange={(e) => setNewUrl(e.target.value)}
                   style={{ flex: 1 }}
                 />
                 <button className="btn btn-primary" onClick={handleUploadEvidence} disabled={uploading || !newUrl} style={{ width: 'auto', whiteSpace: 'nowrap' }}>
                    {uploading ? 'Adding...' : 'Add Link'}
                 </button>
                 
                 <div style={{ position: 'relative', width: 'auto', display: 'flex' }}>
                    <button className="btn" disabled={uploading} style={{ backgroundColor: 'var(--bg-sub)', border: '1px dashed var(--brand)', color: 'var(--brand)', width: 'auto', whiteSpace: 'nowrap' }}>
                       <FileUp size={16} /> Upload
                    </button>
                   <input 
                      type="file" 
                      onChange={handlePhysicalUpload} 
                      disabled={uploading} 
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                   />
                 </div>
               </div>

               <div>
                  {evidenceLoading ? (
                     <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>Loading files...</p>
                  ) : artifacts.length === 0 ? (
                     <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--bg-sub)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
                        <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>No attachments found.</p>
                     </div>
                 ) : (
                   artifacts.map(artifact => {
                     const isOwner = currentUser?.id === artifact.uploaded_by;
                                          return (
                        <div key={artifact.id} className="artifact-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: '0.5rem' }}>
                           <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                             <a href={artifact.file_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                               <ExternalLink size={14} />
                               View Link
                             </a>
                             <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginTop: '0.25rem' }}>
                               Added at: {new Date(artifact.created_at).toLocaleString()}
                             </div>
                           </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                             <button 
                                title="Like"
                                className="btn btn-secondary" 
                                onClick={() => handleEndorse(artifact.id, artifact.endorsements_count)}
                                style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.75rem', border: '1px solid var(--brand)', color: 'var(--brand)' }}
                             >
                                <ThumbsUp size={14} />
                                {artifact.endorsements_count}
                             </button>
                            
                             {isOwner && (
                                <button 
                                 title="Delete"
                                 onClick={() => handleDeleteArtifact(artifact.id)}
                                 style={{ background: 'none', border: '1px solid var(--error)', color: 'var(--error)', padding: '0.35rem', borderRadius: 'var(--radius)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                   <Trash2 size={14} />
                                </button>
                             )}
                          </div>
                       </div>
                     )
                   })
                 )}
               </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '1.5rem 2.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', backgroundColor: 'var(--bg-sub)' }}>
           {isEditMode && (
             <button className="btn" onClick={handleDelete} disabled={loading} style={{ width: 'auto', color: 'var(--error)', backgroundColor: 'transparent', border: '1px solid var(--error)', marginRight: 'auto' }}>
               <Trash2 size={16} /> Delete
             </button>
           )}
           <button className="btn btn-secondary" onClick={onClose} style={{ width: 'auto' }}>Cancel</button>
           <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ width: 'auto' }}>
             {loading ? 'Saving...' : 'Save Task'}
           </button>
        </div>

      </div>
    </div>
  )
}
