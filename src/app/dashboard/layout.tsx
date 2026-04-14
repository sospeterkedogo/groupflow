import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { PresenceProvider } from '@/components/PresenceProvider'
import { ThemeProvider } from '@/context/ThemeContext'

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('theme_config, custom_bg_url')
    .eq('id', user.id)
    .single()

  const initialTheme = {
    palette: profile?.theme_config?.palette || 'Google Light',
    bgUrl: profile?.custom_bg_url
  }

  return (
    <ThemeProvider initialTheme={initialTheme}>
      <div className="dashboard-layout">
        <PresenceProvider user={user}>
          <Sidebar user={user} />
          
          <main className="main-content">
            {children}
          </main>
        </PresenceProvider>
      </div>
    </ThemeProvider>
  )
}
