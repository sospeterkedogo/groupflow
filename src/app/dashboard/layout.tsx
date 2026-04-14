import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { PresenceProvider } from '@/components/PresenceProvider'

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

  return (
    <div className="dashboard-layout">
      <PresenceProvider user={user}>
        <Sidebar user={user} />
        
        <main className="main-content">
          {children}
        </main>
      </PresenceProvider>
    </div>
  )
}
