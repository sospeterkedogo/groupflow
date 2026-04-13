'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Artifact, Task } from '@/types/database'
import { X, ExternalLink, ThumbsUp } from 'lucide-react'

export default function EvidenceModal({ 
  task, 
  onClose 
}: { 
  task: Task, 
  onClose: () => void 
}) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [loading, setLoading] = useState(true)
  const [newUrl, setNewUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    fetchArtifacts()
    
    const channel = supabase
      .channel(`task_${task.id}_artifacts`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'artifacts', filter: `task_id=eq.${task.id}` }, () => {
        fetchArtifacts()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [task.id])

  const fetchArtifacts = async () => {
    const { data } = await supabase
      .from('artifacts')
      .select('*')
      .eq('task_id', task.id)
      .order('created_at', { ascending: false })
      
    if (data) setArtifacts(data as Artifact[])
    setLoading(false)
  }

  const handleUpload = async () => {
    if (!newUrl) return
    setUploading(true)
    setError(null)
    
    // In a real app we'd get the actual user ID via a context provider,
    // but we can pull it securely from the session on the client:
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
    // For MVP we just blindly increment the count
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
             <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Evidence Protocol</h2>
             <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Task: {task.title}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={24} />
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div style={{ marginBottom: '2rem' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Attach New Evidence</h3>
           <div style={{ display: 'flex', gap: '0.5rem' }}>
             <input 
               type="url" 
               className="form-input" 
               placeholder="https://figma.com/file/... or Google Doc link"
               value={newUrl}
               onChange={(e) => setNewUrl(e.target.value)}
             />
             <button className="btn btn-primary" onClick={handleUpload} disabled={uploading} style={{ width: 'auto', whiteSpace: 'nowrap' }}>
               {uploading ? 'Attaching...' : 'Link File'}
             </button>
           </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Peer Reviewed Artifacts</h3>
          {loading ? (
             <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading algorithms...</p>
          ) : artifacts.length === 0 ? (
             <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px dashed var(--border-color)' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No design evidence or documents attached yet.</p>
             </div>
          ) : (
            artifacts.map(artifact => (
              <div key={artifact.id} className="artifact-card">
                 <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                   <a href={artifact.file_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                     <ExternalLink size={14} />
                     {artifact.file_url}
                   </a>
                 </div>
                 
                 <button 
                   className="btn btn-secondary" 
                   onClick={() => handleEndorse(artifact.id, artifact.endorsements_count)}
                   style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                 >
                   <ThumbsUp size={14} />
                   Endorse ({artifact.endorsements_count})
                 </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
