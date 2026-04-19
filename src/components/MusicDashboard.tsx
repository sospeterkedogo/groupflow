'use client'

import React, { useState, useEffect } from 'react'
import { Search, Play, Plus, Music, Disc } from 'lucide-react'
import { useSpotify } from '@/context/SpotifyContext'
import { useProfile } from '@/context/ProfileContext'

interface Track {
  id: string
  name: string
  uri: string
  album: { name: string; images: { url: string }[] }
  artists: { name: string }[]
}

export default function MusicDashboard() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Track[]>([])
  const { playTrack, isConnected, connectSpotify } = useSpotify()
  const { profile } = useProfile()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query || !profile?.spotify_access_token) return

    try {
      const resp = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
        headers: { 'Authorization': `Bearer ${profile.spotify_access_token}` }
      })
      const data = await resp.json()
      setResults(data.tracks.items)
    } catch (err) {
      console.error('Search error:', err)
    }
  }

  if (!isConnected) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(29, 185, 84, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Music size={40} color="#1DB954" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Connect to Spotify</h2>
        <p style={{ color: 'var(--text-sub)', maxWidth: '400px' }}>Join your team's rhythm. Connect your account to listen together and share your favorite study tracks.</p>
        <button className="btn btn-primary" onClick={connectSpotify} style={{ background: '#1DB954', border: 'none', color: 'black', padding: '1rem 2.5rem', borderRadius: '14px', fontWeight: 900 }}>
          Sign in to Spotify
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem' }}>
      <header>
        <h2 style={{ fontSize: '2rem', fontWeight: 950, letterSpacing: '-0.04em' }}>Team Jukebox</h2>
        <p style={{ color: 'var(--text-sub)' }}>Search and play music for everyone in your workspace.</p>
      </header>

      <form onSubmit={handleSearch} style={{ position: 'relative' }}>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for tracks, artists, or albums..."
          style={{
            width: '100%',
            padding: '1.25rem 1.5rem 1.25rem 3.5rem',
            background: 'var(--bg-sub)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            fontSize: '1rem',
            color: 'var(--text-main)',
            outline: 'none'
          }}
        />
        <Search style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} size={20} />
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {results.map(track => (
          <div key={track.id} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            padding: '1rem', 
            background: 'var(--surface)', 
            border: '1px solid var(--border)', 
            borderRadius: '16px',
            transition: 'all 0.3s ease',
            cursor: 'default'
          }} className="hover-lift">
            <img src={track.album.images[0]?.url} style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }} />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 850, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 600 }}>{track.artists.map(a => a.name).join(', ')}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => playTrack(track.uri)}
                style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--brand)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <Play size={18} fill="currentColor" style={{ marginLeft: '2px' }} />
              </button>
            </div>
          </div>
        ))}

        {results.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '24px' }}>
            <Disc size={48} color="var(--text-sub)" style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <div style={{ color: 'var(--text-sub)', fontWeight: 700 }}>Search for music to start the session</div>
          </div>
        )}
      </div>
    </div>
  )
}
