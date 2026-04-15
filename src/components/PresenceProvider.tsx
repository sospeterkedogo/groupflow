'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'

type UserPresence = {
  user_id: string
  full_name?: string
  online_at: string
  is_typing?: boolean
}

type PresenceState = {
  [key: string]: UserPresence[]
}

type PresenceContextType = {
  onlineUsers: Set<string>
  typingUsers: Set<string>
  setTypingStatus: (isTyping: boolean) => Promise<void>
}

const PresenceContext = createContext<PresenceContextType>({
  onlineUsers: new Set(),
  typingUsers: new Set(),
  setTypingStatus: async () => {}
})

export const usePresence = () => useContext(PresenceContext)

type PresenceProviderProps = {
  user?: { id: string; full_name?: string }
  children: React.ReactNode
}

export const PresenceProvider = ({ user, children }: PresenceProviderProps) => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const userId = user?.id
  const userName = user?.full_name

  const setTypingStatus = useCallback(async (isTyping: boolean) => {
    if (!channel || !userId) return

    await channel.track({
      user_id: userId,
      full_name: userName,
      online_at: new Date().toISOString(),
      is_typing: isTyping
    })
  }, [channel, userId, userName])

  useEffect(() => {
    if (!userId) return

    const newChannel = supabase.channel('global_presence', {
      config: {
        presence: {
          key: userId
        }
      }
    })

    newChannel
      .on('presence', { event: 'sync' }, () => {
        const state = newChannel.presenceState() as PresenceState
        const onlineIds = new Set<string>()
        const typingIds = new Set<string>()

        Object.entries(state).forEach(([key, presenceItems]) => {
          onlineIds.add(key)
          if (presenceItems[0]?.is_typing) {
            typingIds.add(key)
          }
        })

        setOnlineUsers(onlineIds)
        setTypingUsers(typingIds)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        setOnlineUsers((prev) => new Set(prev).add(key))
        if (newPresences[0]?.is_typing) {
          setTypingUsers((prev) => new Set(prev).add(key))
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUsers((prev) => {
          const next = new Set(prev)
          next.delete(key)
          return next
        })
        setTypingUsers((prev) => {
          const next = new Set(prev)
          next.delete(key)
          return next
        })
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setChannel(newChannel)
          await newChannel.track({
            user_id: userId,
            full_name: userName,
            online_at: new Date().toISOString(),
            is_typing: false
          })

          await supabase
            .from('profiles')
            .update({ last_seen: new Date().toISOString() })
            .eq('id', userId)
        }
      })

    return () => {
      supabase.removeChannel(newChannel)
    }
  }, [userId, userName, supabase])

  return (
    <PresenceContext.Provider value={{ onlineUsers, typingUsers, setTypingStatus }}>
      {children}
    </PresenceContext.Provider>
  )
}
