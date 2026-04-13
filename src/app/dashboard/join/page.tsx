import { createGroup, joinGroup } from './actions'
import { AlertCircle, Plus, Key } from 'lucide-react'

// Read standard Next.js 15 searchParams natively as a Promise on page load to securely extract validation errors
export default async function JoinGroupPage(props: { searchParams?: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams
  const error = searchParams?.error

  return (
    <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4rem' }}>
       {/* Error Handling Feedback Component */}
       {error && (
         <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', width: '100%', maxWidth: '800px' }}>
           <AlertCircle size={16} />
           <span>{error}</span>
         </div>
       )}
       
       <div style={{ display: 'flex', gap: '2rem', width: '100%', maxWidth: '800px', flexWrap: 'wrap' }}>
          
          {/* Create Group Route */}
          <div className="auth-card" style={{ flex: '1 1 300px', margin: 0 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Plus size={20} color="var(--accent-color)" />
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Create New Group</h2>
             </div>
             <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Form a new team module on the GroupFlow platform.
             </p>
             <form>
                <div className="form-group">
                   <label className="form-label" htmlFor="name">Group Name:</label>
                   <input className="form-input" id="name" name="name" type="text" placeholder="e.g. Apollo Team" required />
                </div>
                <div className="form-group">
                   <label className="form-label" htmlFor="module_code">Module Code (Unique):</label>
                   <input className="form-input" id="module_code" name="module_code" type="text" placeholder="e.g. CS-501-A" required />
                </div>
                <button className="btn btn-primary" formAction={createGroup} style={{ marginTop: '0.5rem' }}>
                   Create Team
                </button>
             </form>
          </div>

          {/* Join Group Route */}
          <div className="auth-card" style={{ flex: '1 1 300px', margin: 0 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Key size={20} color="var(--primary-color)" />
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Join Existing Module</h2>
             </div>
             <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Link your account to an existing class cohort using the module code given by your lecturer.
             </p>
             <form>
                <div className="form-group">
                   <label className="form-label" htmlFor="module_code">Module Code:</label>
                   <input className="form-input" id="module_code" name="module_code" type="text" placeholder="e.g. CS-501-A" required />
                </div>
                <button className="btn btn-secondary" formAction={joinGroup} style={{ marginTop: '0.5rem' }}>
                   Verify & Join
                </button>
             </form>
          </div>

       </div>
    </main>
  )
}
