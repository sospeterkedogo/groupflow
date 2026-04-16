import { createServerSupabaseClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import BottomNav from '@/components/BottomNav'
import { PresenceProvider } from '@/components/PresenceProvider'
import { NotificationProvider } from '@/components/NotificationProvider'
import { ThemeProvider } from '@/context/ThemeContext'

import OnboardingWrapper from '@/components/OnboardingWrapper'
import { GlobalLoadingProvider } from '@/components/GlobalLoadingProvider'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('theme_config, custom_bg_url, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  const initialTheme = {
    palette: profile?.theme_config?.palette || 'Google Light',
    bgUrl: profile?.custom_bg_url
  }

  return (
    <ThemeProvider initialTheme={initialTheme}>
      <GlobalLoadingProvider>
        <OnboardingWrapper profile={profile} user={user}>
          <div className="dashboard-layout">
            <PresenceProvider user={user}>
              <NotificationProvider>
                <Sidebar user={user} />
                
                <main className="main-content">
                  {children}
                  {/* Global Mobile Spacer to prevent overlap */}
                  <div className="hide-desktop" style={{ height: 'calc(var(--h-mobile-bottom) + 1rem)' }} />
                </main>

                <BottomNav />
              </NotificationProvider>
            </PresenceProvider>
          </div>
        </OnboardingWrapper>
      </GlobalLoadingProvider>
    </ThemeProvider>
  )
}
