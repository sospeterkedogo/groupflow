"use client"

import { createGroup, joinGroup } from './actions'
import { Plus, Key } from 'lucide-react'
import TransientError from '@/components/TransientError'
import { useFormStatus } from 'react-dom'

function SubmitButton({ label, secondary = false }: { label: string, secondary?: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button 
      className={secondary ? "btn btn-secondary" : "btn btn-primary"} 
      disabled={pending} 
      style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
    >
      {pending ? (
        <>
          <div className="spinner-mini" style={{ borderTopColor: secondary ? 'var(--brand)' : 'white' }} />
          <span>Processing...</span>
        </>
      ) : label}
    </button>
  )
}

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function JoinGroupContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4rem' }}>
       {/* Error Handling Feedback Component */}
       {error && <TransientError message={error} />}
       
       <div style={{ display: 'flex', gap: '2rem', width: '100%', maxWidth: '800px', flexWrap: 'wrap' }}>
          
          {/* Create Group Route */}
          <div className="auth-card" style={{ flex: '1 1 300px', margin: 0 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                 <Plus size={20} color="var(--brand)" />
                 <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Establish New Team</h2>
             </div>
              <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem', marginBottom: '1.5rem', fontWeight: 600 }}>
                 Initialize a primary team module for project orchestration.
              </p>
             <form action={createGroup}>
                 <div className="form-group">
                    <label className="form-label" htmlFor="name" style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem', color: 'var(--text-sub)', letterSpacing: '0.05em' }}>Team Designation:</label>
                   <input className="form-input" id="name" name="name" type="text" placeholder="e.g. Apollo Team" required />
                </div>
                <div className="form-group">
                   <label className="form-label" htmlFor="module_code">Module Code (Unique):</label>
                   <input className="form-input" id="module_code" name="module_code" type="text" placeholder="e.g. CS-501-A" required />
                </div>
                <div className="form-group">
                   <label className="form-label" htmlFor="create_join_password">Join Password:</label>
                   <input className="form-input" id="create_join_password" name="join_password" type="password" placeholder="Set a group password" required />
                </div>
                 <SubmitButton label="Establish Session" />
             </form>
          </div>

          {/* Join Group Route */}
          <div className="auth-card" style={{ flex: '1 1 300px', margin: 0 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Key size={20} color="var(--primary-color)" />
                 <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Link to Session Node</h2>
              </div>
              <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem', marginBottom: '1.5rem', fontWeight: 600 }}>
                 Connect your account to an active session module using the security code provided by the module Lead.
              </p>
             <form action={joinGroup}>
                <div className="form-group">
                   <label className="form-label" htmlFor="create_module_code">Module Code:</label>
                   <input className="form-input" id="create_module_code" name="module_code" type="text" placeholder="e.g. CS-501-A" required />
                </div>
                <div className="form-group">
                   <label className="form-label" htmlFor="join_password">Join Password:</label>
                   <input className="form-input" id="join_password" name="join_password" type="password" placeholder="Enter group password" required />
                </div>
                 <SubmitButton label="Authorize Access" secondary />
             </form>
          </div>

       </div>
    </main>
  )
}

export default function JoinGroupPage() {
  return (
    <Suspense fallback={
       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <div className="spinner" />
       </div>
    }>
       <JoinGroupContent />
    </Suspense>
  )
}
