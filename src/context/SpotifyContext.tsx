'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { useProfile } from './ProfileContext'
import { useNotifications } from '@/components/NotificationProvider'

interface SpotifyContextType {
  player: Spotify.Player | null
  deviceId: string | null
  playbackState: Spotify.PlaybackState | null
  isConnected: boolean
  isPremium: boolean | null
  isSDKReady: boolean
  connectSpotify: () => void
  playTrack: (uri: string) => Promise<void>
  togglePlay: () => Promise<void>
  nextTrack: () => Promise<void>
  previousTrack: () => Promise<void>
  seek: (positionMs: number) => Promise<void>
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined)

export function SpotifyProvider({ children }: { children: ReactNode }) {
  const { profile } = useProfile()
  const { addToast } = useNotifications()
  const [player, setPlayer] = useState<Spotify.Player | null>(null)
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [playbackState, setPlaybackState] = useState<Spotify.PlaybackState | null>(null)
  const [isSDKReady, setIsSDKReady] = useState(false)
  const [isPremium, setIsPremium] = useState<boolean | null>(null)
  const supabase = createBrowserSupabaseClient()

  // 0. Fetch Spotify Profile (Inclusive check for Premium)
  useEffect(() => {
    if (!profile?.spotify_access_token) return

    const fetchSpotifyProfile = async () => {
      try {
        const res = await fetch('https://api.spotify.com/v1/me', {
          headers: { 'Authorization': `Bearer ${profile.spotify_access_token}` }
        })
        const data = await res.json()
        setIsPremium(data.product === 'premium')
      } catch (err) {
        console.error('Failed to fetch Spotify profile:', err)
      }
    }
    fetchSpotifyProfile()
  }, [profile?.spotify_access_token])

  // 1. Refresh Token Logic
  const refreshSpotifyToken = useCallback(async () => {
    if (!profile?.id) return null

    try {
      const response = await fetch('/api/spotify/refresh', {
        method: 'POST',
        body: JSON.stringify({ userId: profile.id })
      })
      const data = await response.json()
      return data.access_token
    } catch (err) {
      console.error('Failed to refresh Spotify token:', err)
      return null
    }
  }, [profile?.id])

  // 2. Load Spotify SDK
  useEffect(() => {
    if (typeof window === 'undefined') return

    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true
    document.body.appendChild(script)

    window.onSpotifyWebPlaybackSDKReady = () => {
      setIsSDKReady(true)
    }

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // 3. Initialize Player
  useEffect(() => {
    if (!isSDKReady || !profile?.spotify_access_token) return

    const newPlayer = new window.Spotify.Player({
      name: 'Espeezy Web Player',
      getOAuthToken: (cb: (token: string) => void) => {
        // Here we could handle token expiration check
        cb(profile.spotify_access_token!)
      },
      volume: 0.5
    })

    newPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
      console.log('Spotify Player ready with Device ID', device_id)
      setDeviceId(device_id)
    })

    newPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
      console.log('Device ID has gone offline', device_id)
      setDeviceId(null)
    })

    newPlayer.addListener('player_state_changed', (state: Spotify.PlaybackState) => {
      if (!state) return
      setPlaybackState(state)

      // Broadcast to Presence via window trick
      ;(window as any)._spotify_presence = {
        isPlaying: !state.paused,
        trackUri: state.track_window.current_track.uri,
        trackName: state.track_window.current_track.name,
        artistName: state.track_window.current_track.artists[0]?.name || 'Unknown Artist',
        progressMs: state.position,
        timestamp: Date.now()
      }
    })

    newPlayer.addListener('initialization_error', ({ message }: { message: string }) => {
      console.error('Spotify Init Error:', message)
    })

    newPlayer.addListener('authentication_error', ({ message }: { message: string }) => {
      console.error('Spotify Auth Error:', message)
      // Trigger token refresh maybe?
    })

    newPlayer.connect()
    setPlayer(newPlayer)

    return () => {
      newPlayer.disconnect()
    }
  }, [isSDKReady, profile?.spotify_access_token])

  const connectSpotify = () => {
    window.location.href = '/api/spotify/login'
  }

  const playTrack = async (uri: string) => {
    if (!deviceId || !profile?.spotify_access_token) return

    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      body: JSON.stringify({ uris: [uri] }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${profile.spotify_access_token}`
      }
    })
  }

  const togglePlay = async () => player?.togglePlay()
  const nextTrack = async () => player?.nextTrack()
  const previousTrack = async () => player?.previousTrack()
  const seek = async (pos: number) => player?.seek(pos)

  return (
    <SpotifyContext.Provider value={{ 
      player, 
      deviceId, 
      playbackState, 
      isConnected: !!profile?.spotify_connected,
      isPremium,
      isSDKReady,
      connectSpotify,
      playTrack,
      togglePlay,
      nextTrack,
      previousTrack,
      seek
    }}>
      {children}
    </SpotifyContext.Provider>
  )
}

export function useSpotify() {
  const context = useContext(SpotifyContext)
  if (context === undefined) {
    throw new Error('useSpotify must be used within a SpotifyProvider')
  }
  return context
}
