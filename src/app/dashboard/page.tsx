import { createClient } from '@/utils/supabase/server'
import KanbanBoard from '@/components/KanbanBoard'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('group_id, full_name, total_score')
    .eq('id', user.id)
    .single()

  if (!profile?.group_id) {
    return (
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Welcome to GroupFlow</h2>
        <p style={{ color: 'var(--text-secondary)' }}>You are not assigned to a group module yet.</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Ask your lecturer to assign you to a group module code to unlock the project dashboard.</p>
        <div className="error-message" style={{ marginTop: '2rem', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
           <strong>Test Mode Instructions:</strong>
           Since we are running this MVP, go to your Supabase Dashboard, manually add a row in `groups` table, and then update your user row in the `profiles` table to assign yourself to that `group_id`.
           Refresh this page to access the board!
        </div>
      </main>
    )
  }

  return (
    <main className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
         <div>
           <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Sprint Board</h1>
           <p style={{ color: 'var(--text-secondary)' }}>Drag and drop tasks. Github webhooks will automatically advance tracked technical issues.</p>
         </div>
         <div style={{ textAlign: 'right' }}>
           <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Your Validity Score</div>
           <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-color)' }}>{profile.total_score}</div>
         </div>
      </div>

      {/* Render the core feature! */}
      <KanbanBoard groupId={profile.group_id} />
    </main>
  )
}
