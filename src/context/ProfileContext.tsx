'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { Profile } from '@/types/auth'

type ProfileContextType = {
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ 
  children, 
  userId,
  initialProfile 
}: { 
  children: ReactNode
  userId: string
  initialProfile: Profile | null
}) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [loading, setLoading] = useState(!initialProfile)
  const supabase = createBrowserSupabaseClient()

  const refreshProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setProfile(data)
  }

  useEffect(() => {
    if (!userId) return

    // Ensure we have current data if initial was partial or missing
    if (!profile) {
      refreshProfile().finally(() => setLoading(false))
    }

    // Subscribe to REALTIME changes for the current user profile
    const channel = supabase
      .channel(`profile_sync_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          console.log('Profile Realtime Update:', payload)
          if (payload.new) {
            setProfile(payload.new as Profile)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return (
    <ProfileContext.Provider value={{ profile, loading, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
