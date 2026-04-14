'use client'

import { useState } from 'react'
import OnboardingModal from './OnboardingModal'

export default function OnboardingWrapper({ profile, user, children }: { profile: any, user: any, children: React.ReactNode }) {
  const [showOnboarding, setShowOnboarding] = useState(!profile?.full_name || !profile?.avatar_url)

  if (showOnboarding) {
    return (
      <>
        <OnboardingModal user={user} onComplete={() => setShowOnboarding(false)} />
        {children}
      </>
    )
  }

  return <>{children}</>
}
