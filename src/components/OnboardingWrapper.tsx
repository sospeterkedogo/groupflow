'use client'

import { ReactNode, useState } from 'react'
import OnboardingModal from './OnboardingModal'

type OnboardingWrapperProps = {
  profile?: { full_name?: string; avatar_url?: string } | null
  user: { id: string }
  children: ReactNode
}

export default function OnboardingWrapper({ profile, user, children }: OnboardingWrapperProps) {
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
