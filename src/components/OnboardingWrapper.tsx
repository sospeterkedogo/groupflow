'use client'

import { ReactNode, useState } from 'react'
import OnboardingModal from './OnboardingModal'
import { OnboardingWrapperProps } from '@/types/ui'

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
