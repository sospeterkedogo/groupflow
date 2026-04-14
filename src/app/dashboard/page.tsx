import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import DashboardHome from '@/components/DashboardHome'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.group_id) {
    return (
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '2rem', fontWeight: 900 }}>Welcome to GroupFlow</h2>
        <p style={{ color: 'var(--text-sub)', marginBottom: '2.5rem', fontWeight: 500 }}>Your workspace is currently a blank canvas. Join a project module to begin orchestrating.</p>
        
        <Link href="/dashboard/join" className="btn btn-primary" style={{ padding: '1rem 2.5rem', width: 'auto', fontSize: '1.1rem', borderRadius: '16px' }}>
           Join a Module / Group
        </Link>
      </main>
    )
  }

  return (
    <main className="main-content">
      <DashboardHome groupId={profile.group_id} profile={profile} />
    </main>
  )
}
