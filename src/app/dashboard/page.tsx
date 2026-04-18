import { createServerSupabaseClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import DashboardHome from '@/components/DashboardHome'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.group_id) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-0.04em' }}>Control Station Initialized</h2>
        <p style={{ color: 'var(--text-sub)', marginBottom: '2.5rem', fontWeight: 600, fontSize: '1.1rem' }}>Operational node detected. Please link to a project module to begin orchestration.</p>
        
        <Link href="/dashboard/join" className="btn btn-primary" style={{ padding: '1rem 2.5rem', width: 'auto', fontSize: '1.1rem', borderRadius: '16px', fontWeight: 900 }}>
           Initialize Hub Access
        </Link>
      </div>
    )
  }

  return <DashboardHome groupId={profile.group_id} />
}
