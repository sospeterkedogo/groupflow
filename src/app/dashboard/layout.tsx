import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Settings, LogOut, Users } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the user's profile to get their group
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, groups(*)')
    .eq('id', user.id)
    .single()

  return (
    <div className="dashboard-layout">
      <header className="main-header">
        <div className="header-logo">
          GroupFlow
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {profile?.groups ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <Users size={16} />
              <span style={{ fontWeight: 600 }}>{profile.groups.name}</span>
              <span className="badge" style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
                {profile.groups.module_code}
              </span>
            </div>
          ) : (
             <span style={{ fontSize: '0.875rem', color: 'var(--warning-color)' }}>No Group Assigned</span>
          )}

          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)' }}></div>
          
          <Link href="/dashboard/settings" style={{ color: 'var(--text-color)' }}>
            <Settings size={20} />
          </Link>
          
          <form action="/auth/signout" method="post" style={{ display: 'flex' }}>
            <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-color)', display: 'flex', alignItems: 'center' }}>
              <LogOut size={20} />
            </button>
          </form>
        </div>
      </header>
      
      {children}
    </div>
  )
}
