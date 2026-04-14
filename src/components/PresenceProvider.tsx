'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

type PresenceState = {
  [key: string]: {
    user_id: string
    online_at: string
  }[]
}

type PresenceContextType = {
  onlineUsers: Set<string>
}

const PresenceContext = createContext<PresenceContextType>({ onlineUsers: new Set() })

export const usePresence = () => useContext(PresenceContext)

export const PresenceProvider = ({ user, children }: { user: any, children: React.ReactNode }) => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    const channel = supabase.channel('global_presence', {
      config: {
        presence: {
          key: user.id,
        },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const ids = new Set<string>()
        Object.keys(state).forEach((key) => {
          ids.add(key)
        })
        setOnlineUsers(ids)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        setOnlineUsers((prev) => new Set(prev).add(key))
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        setOnlineUsers((prev) => {
          const next = new Set(prev)
          next.delete(key)
          return next
        })
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          })
          
          // Update last_seen in DB
          await supabase
            .from('profiles')
            .update({ last_seen: new Date().toISOString() })
            .eq('id', user.id)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user.id])

  return (
    <PresenceContext.Provider value={{ onlineUsers }}>
      {children}
    </PresenceContext.Provider>
  )
}
