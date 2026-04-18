'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { Profile } from '@/types/database'
import { Users, UserPlus, Check, ExternalLink, Shield, Sparkles } from 'lucide-react'

interface CollaboratorsListProps {
  currentGroupId: string | null;
  onViewProfile: (profile: Profile) => void;
}

export default function CollaboratorsList({ currentGroupId, onViewProfile }: CollaboratorsListProps) {
  const [collaborators, setCollaborators] = useState<Profile[]>([])
  const [suggested, setSuggested] = useState<Profile[]>([])
  const [connections, setConnections] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserSupabaseClient()

  const fetchCollaborators = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !currentGroupId) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('group_id', currentGroupId)
      .neq('id', user.id)

    if (data) setCollaborators(data as Profile[])
  }, [supabase, currentGroupId])

  const fetchSuggested = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch 8 random users who are NOT in the current group and NOT the user
    // We use a simpler query for random suggestions
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', user.id)
      .not('group_id', 'eq', currentGroupId)
      .limit(8)

    if (data) setSuggested(data as Profile[])
  }, [supabase, currentGroupId])

  const fetchConnections = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('user_connections')
      .select('target_id')
      .eq('user_id', user.id)

    if (data) {
      setConnections(new Set(data.map(c => c.target_id)))
    }
  }, [supabase])

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      await Promise.all([
        fetchCollaborators(),
        fetchSuggested(),
        fetchConnections()
      ])
      if (active) setLoading(false)
    }

    void load()
    return () => { active = false }
  }, [currentGroupId, fetchCollaborators, fetchSuggested, fetchConnections])

  const handleConnect = async (targetId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('user_connections')
      .upsert({ user_id: user.id, target_id: targetId, status: 'connected' })

    if (!error) {
      setConnections(prev => new Set([...Array.from(prev), targetId]))
      
      // Send notification to target
      await supabase.from('notifications').insert({
        user_id: targetId,
        type: 'connection_request',
        title: 'Network Connection',
        message: `${user.user_metadata?.full_name || 'Someone'} connected with you on GroupFlow.`,
        metadata: { sender_id: user.id }
      })
    }
  }

  const renderUserCard = (collab: Profile) => {
    const isConnected = connections.has(collab.id)
    return (
      <div 
        key={collab.id}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          padding: '0.75rem', 
          background: 'var(--bg-main)', 
          borderRadius: '14px', 
          border: '1px solid var(--border)',
          transition: 'all 0.2s',
          animation: 'fadeIn 0.4s ease-out'
        }}
      >
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--brand)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900 }}>
          {collab.avatar_url ? (
            <img src={collab.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            collab.full_name?.[0] || '?'
          )}
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {collab.full_name || 'Anonymous Specialist'}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
             <Shield size={10} /> {collab.rank || 'Scholar'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button 
            onClick={() => onViewProfile(collab)}
            className="panel-tool"
            style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-sub)' }}
          >
            <ExternalLink size={14} />
          </button>
          <button 
            onClick={() => !isConnected && handleConnect(collab.id)}
            style={{ 
              padding: '0.4rem', 
              borderRadius: '8px', 
              border: 'none', 
              background: isConnected ? 'var(--success)' : 'var(--brand)', 
              color: 'white', 
              cursor: isConnected ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isConnected ? <Check size={14} /> : <UserPlus size={14} />}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="collaborators-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. TEAM SECTION */}
      <div style={{ background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.5rem', background: 'rgba(var(--brand-rgb), 0.1)', borderRadius: '10px' }}>
            <Users size={20} color="var(--brand)" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 850 }}>Team Collaborators</h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 600 }}>Connected to your project</p>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: '56px', borderRadius: '14px' }} />)}
          </div>
        ) : collaborators.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', border: '1px dashed var(--border)', borderRadius: '16px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 600 }}>System isolated &middot; Group empty</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {collaborators.map(renderUserCard)}
          </div>
        )}
      </div>

      {/* 2. SUGGESTED SECTION */}
      <div style={{ background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.5rem', background: 'rgba(var(--accent-rgb), 0.1)', borderRadius: '10px' }}>
            <Sparkles size={20} color="var(--brand)" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 850 }}>Global Discovery</h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 600 }}>Specialists you might know</p>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '56px', borderRadius: '14px' }} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {suggested.map(renderUserCard)}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
