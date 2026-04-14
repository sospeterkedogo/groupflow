'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Task, TaskStatus, Artifact } from '@/types/database'
import { X, Trash2, ExternalLink, ThumbsUp, FileUp, GitCommit, Link as LinkIcon } from 'lucide-react'

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
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Evidence Logic
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [evidenceLoading, setEvidenceLoading] = useState(isEditMode)
  const [newUrl, setNewUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  const supabase = createClient()

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
      group_id: groupId
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

  const handleUploadEvidence = async () => {
    if (!newUrl || !task) return
    setUploading(true)
    setError(null)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError("Not authenticated.")
      setUploading(false)
      return
    }

    const { error: dbError } = await supabase.from('artifacts').insert([{
      task_id: task.id,
      file_url: newUrl,
      uploaded_by: user.id
    }])

    if (dbError) {
      setError(`Failed to attach evidence: ${dbError.message}`)
    } else {
      setNewUrl('')
    }
    setUploading(false)
  }

  const handleEndorse = async (artifactId: string, currentCount: number) => {
    const { error } = await supabase
      .from('artifacts')
      .update({ endorsements_count: currentCount + 1 })
      .eq('id', artifactId)

    if (error) {
      setError(`Failed to endorse: ${error.message}`)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* Sleek Google-style Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 600 }}>
            {isEditMode ? 'Task Configuration' : 'Create New Sprint Task'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
             <X size={24} />
          </button>
        </div>

        <div style={{ padding: '2rem', overflowY: 'auto' }}>
          {error && <div className="error-message" style={{ marginBottom: '1.5rem' }}>{error}</div>}

          {/* Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
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

            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
               <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                 <label className="form-label">Column Status</label>
                 <select className="form-input" value={status} onChange={e => setStatus(e.target.value as TaskStatus)}>
                   {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
               </div>
               
               <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                 <label className="form-label">Task Classification</label>
                 <select className="form-input" value={isCodingTask ? 'true' : 'false'} onChange={e => setIsCodingTask(e.target.value === 'true')}>
                   <option value="true">Code Generation</option>
                   <option value="false">Design / Documentation</option>
                 </select>
               </div>
            </div>
          </div>

          {/* Peer Verification Sub-Panel (Only in Edit Mode) */}
          {isEditMode && (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem', marginTop: '1rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                 <LinkIcon size={18} color="var(--accent-color)" />
                 <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>Peer Evidence Verification</h3>
               </div>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Ensure technical accountability by linking Figma files, Docs, or external PRs.</p>

               <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                 <input 
                   type="url" 
                   className="form-input" 
                   placeholder="https://figma.com/file/... or Google Doc link"
                   value={newUrl}
                   onChange={(e) => setNewUrl(e.target.value)}
                 />
                 <button className="btn btn-secondary" onClick={handleUploadEvidence} disabled={uploading || !newUrl} style={{ width: 'auto', whiteSpace: 'nowrap' }}>
                   {uploading ? 'Linking...' : 'Attach Proof'}
                 </button>
               </div>

               <div>
                 {evidenceLoading ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading artifacts...</p>
                 ) : artifacts.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px dashed var(--border-color)' }}>
                       <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No verification documents attached.</p>
                    </div>
                 ) : (
                   artifacts.map(artifact => (
                     <div key={artifact.id} className="artifact-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', marginBottom: '0.5rem' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>
                          <a href={artifact.file_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                            <ExternalLink size={14} />
                            {artifact.file_url}
                          </a>
                        </div>
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => handleEndorse(artifact.id, artifact.endorsements_count)}
                          style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.75rem', border: '1px solid var(--accent-color)', color: 'var(--accent-color)' }}
                        >
                          <ThumbsUp size={14} />
                          Endorse ({artifact.endorsements_count})
                        </button>
                     </div>
                   ))
                 )}
               </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', backgroundColor: 'var(--bg-secondary)' }}>
           {isEditMode && (
             <button className="btn" onClick={handleDelete} disabled={loading} style={{ width: 'auto', color: 'var(--danger-color)', backgroundColor: 'transparent', border: '1px solid var(--danger-color)', marginRight: 'auto' }}>
               <Trash2 size={16} /> Delete
             </button>
           )}
           <button className="btn btn-secondary" onClick={onClose} style={{ width: 'auto' }}>Cancel</button>
           <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ width: 'auto' }}>
             {loading ? 'Saving...' : 'Save Configuration'}
           </button>
        </div>

      </div>
    </div>
  )
}
