'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { Search, MapPin, Clock, LayoutGrid, List, User, Users, GraduationCap, X, ChevronRight } from 'lucide-react'
import { usePresence } from '@/components/PresenceProvider'
import { Profile } from '@/types/database'
import PublicProfileModal from '@/components/PublicProfileModal'
import CollaboratorsList from '@/components/CollaboratorsList'

type ViewMode = 'grid' | 'list'

export default function NetworkPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [suggestions, setSuggestions] = useState<Profile[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [currentUserGroup, setCurrentUserGroup] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null)
  const [connections, setConnections] = useState<Set<string>>(new Set())
  
  const supabase = createBrowserSupabaseClient()
  const { onlineUsers } = usePresence()

  useEffect(() => {
    fetchCurrentGroupAndConnections()
    fetchUsers()
  }, [])

  const fetchCurrentGroupAndConnections = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Fetch group
      const { data: profile } = await supabase.from('profiles').select('group_id').eq('id', user.id).single()
      if (profile) setCurrentUserGroup(profile.group_id)

      // Fetch connections
      const { data: conn } = await supabase.from('user_connections').select('target_id').eq('user_id', user.id)
      if (conn) setConnections(new Set(conn.map(c => c.target_id)))
    }
  }

  const fetchUsers = useCallback(async (queryStr?: string) => {
    setLoading(true)
    let query = supabase
      .from('profiles')
      .select('*, groups(name, module_code, is_encrypted)')
      .order('total_score', { ascending: false })
      .limit(50)
    
    const term = queryStr || search
    if (term.trim()) {
      // Fixed search: Search by name, email, or school ID
      query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%,school_id.ilike.%${term}%`)
    }
    
    const { data } = await query
    if (data) setUsers(data as any[])
    setLoading(false)
  }, [supabase, search])

  // Smart Suggestions Logic
  useEffect(() => {
    if (search.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const fetchSuggestions = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, school_id')
        .or(`full_name.ilike.%${search}%,email.ilike.%${search}%,school_id.ilike.%${search}%`)
        .limit(5)
      
      if (data) {
        setSuggestions(data as any[])
        setShowSuggestions(true)
      }
    }

    const timer = setTimeout(fetchSuggestions, 150)
    return () => clearTimeout(timer)
  }, [search, supabase])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers()
    }, 400)
    return () => clearTimeout(timer)
  }, [search, fetchUsers])

  const formatLastSeen = (timestamp: string | null) => {
    if (!timestamp) return 'Never'
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 var(--p-safe)', animation: 'fadeIn 0.5s ease-out' }}>
       
       <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2.5rem', alignItems: 'start' }}>
          
          {/* Main Network Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <div>
                <h1 className="fluid-h1" style={{ fontWeight: 900, letterSpacing: '-0.04em', margin: 0 }}>Student Network</h1>
                <p style={{ color: 'var(--text-sub)', fontSize: '1rem', marginTop: '0.5rem' }}>Find researchers, collaborators, and verify academic ranks.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-sub)', padding: '0.4rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
                <button onClick={() => setViewMode('grid')} style={{ padding: '0.5rem', borderRadius: '10px', border: 'none', background: viewMode === 'grid' ? 'var(--surface)' : 'transparent', color: viewMode === 'grid' ? 'var(--brand)' : 'var(--text-sub)', cursor: 'pointer', boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none' }}>
                  <LayoutGrid size={20} />
                </button>
                <button onClick={() => setViewMode('list')} style={{ padding: '0.5rem', borderRadius: '10px', border: 'none', background: viewMode === 'list' ? 'var(--surface)' : 'transparent', color: viewMode === 'list' ? 'var(--brand)' : 'var(--text-sub)', cursor: 'pointer', boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none' }}>
                  <List size={20} />
                </button>
              </div>
            </div>

            {/* Smart Search Bar */}
            <div style={{ position: 'relative', marginBottom: '3rem', zIndex: 100 }}>
              <Search size={24} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand)', opacity: 0.8 }} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search by Name, Email or School ID (e.g. 2024...)" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onFocus={() => search.length >= 2 && setShowSuggestions(true)}
                style={{ 
                  paddingLeft: '4rem', paddingRight: '1.5rem', height: '4rem', fontSize: '1.1rem', 
                  borderRadius: '20px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface)', fontWeight: 600
                }}
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div style={{ 
                  position: 'absolute', top: '105%', left: 0, right: 0, 
                  background: 'var(--surface)', borderRadius: '18px', border: '1px solid var(--border)', 
                  boxShadow: 'var(--shadow-2xl)', overflow: 'hidden', padding: '0.5rem'
                }}>
                  {suggestions.map(s => (
                    <div 
                      key={s.id} 
                      onClick={() => { setSelectedStudent(s); setSearch(''); setShowSuggestions(false); }}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', 
                        borderRadius: '12px', cursor: 'pointer', transition: 'background 0.2s' 
                      }}
                      className="suggestion-item"
                    >
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-sub)', overflow: 'hidden' }}>
                        {s.avatar_url ? <img src={s.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={20} style={{ margin: '8px' }} color="var(--text-sub)" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{s.full_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>ID: {s.school_id || 'N/A'}</div>
                      </div>
                      <ChevronRight size={16} color="var(--text-sub)" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Results Grid/List */}
            {loading && users.length === 0 ? (
              <div className="network-grid" style={viewMode === 'grid' ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' } : { display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="skeleton" style={{ height: '180px', borderRadius: '24px' }} />
                ))}
              </div>
            ) : users.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                <Search size={48} color="var(--text-sub)" style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <h3 style={{ margin: 0, color: 'var(--text-main)' }}>No matching students found</h3>
                <p style={{ color: 'var(--text-sub)', marginTop: '0.5rem' }}>Try searching by enrollment ID or full email address.</p>
              </div>
            ) : (
              <div className="network-grid" style={viewMode === 'grid' ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' } : { display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {users.map(u => {
                  const isOnline = onlineUsers.has(u.id)
                  const isPrivate = (u as any).groups?.is_encrypted && u.group_id !== currentUserGroup
                  
                  return (
                    <div 
                      key={u.id} 
                      className="kanban-card card-interactive" 
                      onClick={() => setSelectedStudent(u)}
                      style={{ 
                        padding: '1.5rem', cursor: 'pointer', borderRadius: '24px', position: 'relative',
                        display: 'flex', flexDirection: viewMode === 'grid' ? 'column' : 'row',
                        alignItems: viewMode === 'grid' ? 'stretch' : 'center',
                        gap: '1.25rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'var(--bg-sub)', border: '2px solid var(--border)', overflow: 'hidden', position: 'relative' }}>
                          {u.avatar_url ? <img src={u.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={32} style={{ margin: '14px' }} color="var(--text-sub)" />}
                          {isOnline && <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--success)', border: '2px solid var(--surface)' }} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {isPrivate ? 'Protected Identity' : u.full_name}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', color: 'var(--text-sub)', fontSize: '0.85rem' }}>
                            <GraduationCap size={14} />
                            <span>{u.course_name || 'Software Engineering'}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-sub)', padding: '1rem', borderRadius: '16px', flex: viewMode === 'list' ? 1 : 'unset' }}>
                        <div>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-sub)', fontWeight: 800, textTransform: 'uppercase' }}>Score</span>
                          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand)' }}>{u.total_score}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-sub)', fontWeight: 800, textTransform: 'uppercase' }}>Current Team</span>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                            <MapPin size={14} color="var(--accent)" />
                            <span>{isPrivate ? 'Restricted' : ((u as any).groups?.module_code || 'Unassigned')}</span>
                          </div>
                        </div>
                      </div>

                      {viewMode === 'grid' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-sub)', fontSize: '0.8rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                          <Clock size={14} />
                          <span>{isOnline ? <b style={{ color: 'var(--success)' }}>Active Now</b> : `Seen ${formatLastSeen(u.created_at)}`}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div style={{ position: 'sticky', top: '2rem' }}>
             <CollaboratorsList 
                currentGroupId={currentUserGroup} 
                onViewProfile={(profile) => setSelectedStudent(profile)} 
             />
             
             <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'linear-gradient(135deg, var(--brand), #6366f1)', borderRadius: '24px', color: 'white', boxShadow: 'var(--shadow-xl)' }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Expand your Network</h4>
                <p style={{ margin: '1rem 0 1.5rem', fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.5 }}>
                  Collaborating with students from other courses? Search by their institutional ID to invite them to your next project.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 700 }}>
                   <Users size={16} />
                   <span>Global Academic Graph</span>
                </div>
             </div>
          </div>
       </div>

       {/* Modals */}
       {selectedStudent && (
         <PublicProfileModal 
           member={selectedStudent} 
           onClose={() => setSelectedStudent(null)} 
           isConnected={connections.has(selectedStudent.id)}
           onConnect={() => setConnections(prev => new Set([...Array.from(prev), selectedStudent.id]))}
         />
       )}

       <style jsx>{`
          .suggestion-item:hover { background: var(--bg-sub); }
          .card-interactive { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
          .card-interactive:hover { transform: translateY(-8px); border-color: var(--brand); box-shadow: var(--shadow-xl); }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          @media (max-width: 1024px) {
            div[style*="gridTemplateColumns: 1fr 320px"] { grid-template-columns: 1fr !important; }
            div[style*="position: sticky"] { position: static !important; }
          }
       `}</style>
    </div>
  )
}
