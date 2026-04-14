'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'

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

export const PresenceProvider = ({ user, children }: { user: any, children: React.ReactNode }) => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [channel, setChannel] = useState<any>(null)
  const supabase = createClient()

  const setTypingStatus = useCallback(async (isTyping: boolean) => {
    if (channel) {
      await channel.track({
        user_id: user.id,
        full_name: user.full_name,
        online_at: new Date().toISOString(),
        is_typing: isTyping
      })
    }
  }, [channel, user])

  useEffect(() => {
    if (!user) return

    const newChannel = supabase.channel('global_presence', {
      config: {
        presence: {
          key: user.id,
        },
      },
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
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
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
            user_id: user.id,
            full_name: user.full_name,
            online_at: new Date().toISOString(),
            is_typing: false
          })
          
          // Update last_seen in DB
          await supabase
            .from('profiles')
            .update({ last_seen: new Date().toISOString() })
            .eq('id', user.id)
        }
      })

    return () => {
      supabase.removeChannel(newChannel)
    }
  }, [user.id])

  return (
    <PresenceContext.Provider value={{ onlineUsers, typingUsers, setTypingStatus }}>
      {children}
    </PresenceContext.Provider>
  )
}
