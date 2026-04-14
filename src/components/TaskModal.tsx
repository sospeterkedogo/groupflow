'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Task, TaskStatus, Artifact } from '@/types/database'
import { X, Trash2, ExternalLink, ThumbsUp, FileUp, GitCommit, Link as LinkIcon, UserPlus, UserMinus, UserCircle } from 'lucide-react'

const COLUMNS: TaskStatus[] = ['To Do', 'In Progress', 'In Review', 'Done']

export default function TaskModal({ 
  task, 
  groupId, 
  onClose,
  onRefresh
}: { 
  task: Task | null, 
  groupId: string,
  onClose: () => void,
  onRefresh: () => void
}) {
  const isEditMode = !!task

  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'To Do')
  const [isCodingTask, setIsCodingTask] = useState(task ? task.is_coding_task : true)
  const [assignees, setAssignees] = useState<string[]>(task?.assignees || [])
  const [dueDate, setDueDate] = useState<string>(task?.due_date ? task.due_date.substring(0, 10) : '')
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Evidence Logic
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [evidenceLoading, setEvidenceLoading] = useState(isEditMode)
  const [newUrl, setNewUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user))
  }, [])

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
      onRefresh()
      onClose()
    }
  }

  // COLLABORATION ASSIGNMENT TOGGLE
  const isAssigned = currentUser && assignees.includes(currentUser.id)

  const toggleAssignment = async () => {
    if (!currentUser) return
    
    // Calculate mathematically
    const newAssignees = isAssigned 
      ? assignees.filter(id => id !== currentUser.id) 
      : [...assignees, currentUser.id]
      
    setAssignees(newAssignees) // Instant optimistic update

    if (isEditMode) {
       // Fire network sync
       setLoading(true)
       const { error } = await supabase.from('tasks').update({ assignees: newAssignees }).eq('id', task.id)
       if (error) {
          setError(`Failed to update collaboration assignment: ${error.message}`)
          setAssignees(task.assignees || []) // Revert optimism
       } else {
          onRefresh() // Ensure Kanban avatars update globally behind modal
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
       setError("File transmission logic failed dynamically: " + err.message)
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
      setError(`Failed to delete evidence link: ${error.message}`)
      setArtifacts(original)
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
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isEditMode ? 'Task Configuration Panel' : 'Draft New Sprint Issue'}
            {isEditMode && assignees.length > 0 && (
               <span className="badge" style={{ backgroundColor: 'var(--accent-color)', color: 'white', marginLeft: '0.5rem' }}>
                 {assignees.length} Collaborator{assignees.length !== 1 && 's'}
               </span>
            )}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
             <X size={24} />
          </button>
        </div>

        <div style={{ padding: '2rem', overflowY: 'auto' }}>
          {error && <div className="error-message" style={{ marginBottom: '1.5rem' }}>{error}</div>}

          {/* Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Task Title</label>
              <input 
                className="form-input" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="e.g. Implement OAuth Pipeline"
                autoFocus
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Extended Details</label>
              <textarea 
                className="form-input" 
                value={description || ''} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Specific architectural notes or problem context..."
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

             <div style={{ display: 'flex', gap: '1rem', width: '100%', alignItems: 'center' }}>
               <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                 <label className="form-label">Execution Status</label>
                 <select className="form-input" value={status} onChange={e => setStatus(e.target.value as TaskStatus)}>
                   {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
               </div>
               
               <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                 <label className="form-label">Classification Tag</label>
                 <select className="form-input" value={isCodingTask ? 'true' : 'false'} onChange={e => setIsCodingTask(e.target.value === 'true')}>
                   <option value="true">Engineering Vector (Code)</option>
                   <option value="false">Design Vector (Doc)</option>
                 </select>
               </div>
               
               <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                 <label className="form-label" style={{ color: 'var(--danger-color)' }}>Execution Deadline</label>
                 <input 
                   type="date"
                   className="form-input"
                   value={dueDate}
                   onChange={e => setDueDate(e.target.value)}
                   style={{ borderColor: dueDate ? 'var(--border-color)' : 'rgba(239,68,68,0.5)' }}
                 />
               </div>
             </div>
            
            {/* COLLABORATOR TOGGLE STRIP */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px dashed var(--border-color)', marginTop: '0.5rem' }}>
               <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.25rem' }}>Peer Responsibility</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                     {isAssigned ? 'You are actively committed to delivering this task.' : 'You are currently not bound to this execution pipeline.'}
                  </p>
               </div>
               <button 
                  className="btn" 
                  onClick={toggleAssignment}
                  disabled={loading || (!isEditMode && !title)} 
                  style={{ 
                     width: 'auto', 
                     backgroundColor: isAssigned ? 'transparent' : 'var(--accent-color)', 
                     color: isAssigned ? 'var(--text-color)' : 'white',
                     border: isAssigned ? '1px solid var(--border-color)' : 'none'
                  }}
               >
                 {isAssigned ? <><UserMinus size={16} /> Unassign Me</> : <><UserPlus size={16} /> Accept Responsibility</>}
               </button>
            </div>
          </div>

          {/* Peer Verification Sub-Panel (Only in Edit Mode) */}
          {isEditMode && (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                 <LinkIcon size={18} color="var(--accent-color)" />
                 <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>Peer Evidence Protocol</h3>
               </div>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Ensure technical accountability by linking Figma files, Docs, or external PRs. This list updates locally and instantly.</p>

               <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                 <input 
                   type="url" 
                   className="form-input" 
                   placeholder="https://figma.com/file/... or Google Doc link"
                   value={newUrl}
                   onChange={(e) => setNewUrl(e.target.value)}
                   style={{ flex: 1 }}
                 />
                 <button className="btn btn-primary" onClick={handleUploadEvidence} disabled={uploading || !newUrl} style={{ width: 'auto', whiteSpace: 'nowrap' }}>
                   {uploading ? 'Linking...' : 'Attach URl Proof'}
                 </button>
                 
                 <div style={{ position: 'relative', width: 'auto', display: 'flex' }}>
                   <button className="btn" disabled={uploading} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px dashed var(--accent-color)', color: 'var(--accent-color)', width: 'auto', whiteSpace: 'nowrap' }}>
                      <FileUp size={16} /> Device Upload
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
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading artifacts...</p>
                 ) : artifacts.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px dashed var(--border-color)' }}>
                       <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No verification documents firmly attached yet.</p>
                    </div>
                 ) : (
                   artifacts.map(artifact => {
                     const isOwner = currentUser?.id === artifact.uploaded_by;
                     
                     return (
                       <div key={artifact.id} className="artifact-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', marginBottom: '0.5rem' }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                            <a href={artifact.file_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                              <ExternalLink size={14} />
                              {artifact.file_url}
                            </a>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                              Timestamp: {new Date(artifact.created_at).toLocaleString()}
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button 
                              title="Endorse Peer Quality"
                              className="btn btn-secondary" 
                              onClick={() => handleEndorse(artifact.id, artifact.endorsements_count)}
                              style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.75rem', border: '1px solid var(--accent-color)', color: 'var(--accent-color)' }}
                            >
                              <ThumbsUp size={14} />
                              ({artifact.endorsements_count})
                            </button>
                            
                            {isOwner && (
                               <button 
                                 title="Delete Artifact"
                                 onClick={() => handleDeleteArtifact(artifact.id)}
                                 style={{ background: 'none', border: '1px solid var(--danger-color)', color: 'var(--danger-color)', padding: '0.35rem', borderRadius: 'var(--radius)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', backgroundColor: 'var(--bg-secondary)' }}>
           {isEditMode && (
             <button className="btn" onClick={handleDelete} disabled={loading} style={{ width: 'auto', color: 'var(--danger-color)', backgroundColor: 'transparent', border: '1px solid var(--danger-color)', marginRight: 'auto' }}>
               <Trash2 size={16} /> Delete Pipeline
             </button>
           )}
           <button className="btn btn-secondary" onClick={onClose} style={{ width: 'auto' }}>Close Setup</button>
           <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ width: 'auto' }}>
             {loading ? 'Committing...' : 'Commit Configuration'}
           </button>
        </div>

      </div>
    </div>
  )
}
