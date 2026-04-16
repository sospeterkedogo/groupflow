'use client'

import { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { Profile } from '@/types/database'
import { Users, UserPlus, Check, ExternalLink, Shield } from 'lucide-react'

interface CollaboratorsListProps {
  currentGroupId: string | null;
  onViewProfile: (profile: Profile) => void;
}

export default function CollaboratorsList({ currentGroupId, onViewProfile }: CollaboratorsListProps) {
  const [collaborators, setCollaborators] = useState<Profile[]>([])
  const [connections, setConnections] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    if (currentGroupId) {
      fetchCollaborators()
      fetchConnections()
    }
  }, [currentGroupId])

  const fetchCollaborators = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !currentGroupId) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('group_id', currentGroupId)
      .neq('id', user.id)

    if (data) setCollaborators(data as Profile[])
    setLoading(false)
  }

  const fetchConnections = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('user_connections')
      .select('target_id')
      .eq('user_id', user.id)

    if (data) {
      setConnections(new Set(data.map(c => c.target_id)))
    }
  }

  const handleConnect = async (targetId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('user_connections')
      .upsert({ user_id: user.id, target_id: targetId, status: 'connected' })

    if (!error) {
      setConnections(prev => new Set([...Array.from(prev), targetId]))
    }
  }

  if (!currentGroupId) return null

  return (
    <div style={{ background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)', padding: '1.5rem', height: 'fit-content' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.5rem', background: 'rgba(var(--brand-rgb), 0.1)', borderRadius: '10px' }}>
          <Users size={20} color="var(--brand)" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Team Collaborators</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-sub)' }}>Students from your current group</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: '60px', borderRadius: '12px' }} />
          ))}
        </div>
      ) : collaborators.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-sub)', fontSize: '0.85rem' }}>
          No other group members found yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {collaborators.map(collab => {
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
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-sub)', overflow: 'hidden', flexShrink: 0 }}>
                  {collab.avatar_url ? (
                    <img src={collab.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-sub)' }}>
                      {collab.full_name?.[0]}
                    </div>
                  )}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {collab.full_name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Shield size={10} /> {collab.rank}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button 
                    onClick={() => onViewProfile(collab)}
                    style={{ padding: '0.4rem', borderRadius: '8px', border: 'none', background: 'var(--bg-sub)', color: 'var(--text-sub)', cursor: 'pointer' }}
                    title="View Profile"
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
                      cursor: isConnected ? 'default' : 'pointer' 
                    }}
                    title={isConnected ? 'Connected' : 'Add to Network'}
                  >
                    {isConnected ? <Check size={14} /> : <UserPlus size={14} />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
         <p style={{ fontSize: '0.7rem', color: 'var(--text-sub)', lineHeight: 1.4, margin: 0 }}>
           These students are automatically suggested based on your shared project groups. Connecting makes them permanent in your network.
         </p>
      </div>
    </div>
  )
}
