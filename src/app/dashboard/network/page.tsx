'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Search, MapPin, Clock, LayoutGrid, List, SlidersHorizontal, User } from 'lucide-react'
import { usePresence } from '@/components/PresenceProvider'

type ViewMode = 'grid' | 'list'

export default function NetworkPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const supabase = createClient()
  const { onlineUsers } = usePresence()

  // Relative Time Decoder helper
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

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    let query = supabase
      .from('profiles')
      .select('*, groups(name, module_code)')
      .order('total_score', { ascending: false })
    
    if (search.trim()) {
      query = query.ilike('full_name', `%${search}%`)
    }
    
    const { data } = await query
    if (data) setUsers(data)
    setLoading(false)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
       
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Global Network</h1>
            <p style={{ color: 'var(--text-sub)', fontSize: '1.1rem' }}>Discover calibrated peers and benchmark cross-module execution scores.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-sub)', padding: '0.4rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
             <button 
               onClick={() => setViewMode('grid')}
               style={{ padding: '0.5rem', borderRadius: '8px', border: 'none', background: viewMode === 'grid' ? 'var(--surface)' : 'transparent', color: viewMode === 'grid' ? 'var(--brand)' : 'var(--text-sub)', cursor: 'pointer', display: 'flex', boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none' }}
             >
                <LayoutGrid size={20} />
             </button>
             <button 
               onClick={() => setViewMode('list')}
               style={{ padding: '0.5rem', borderRadius: '8px', border: 'none', background: viewMode === 'list' ? 'var(--surface)' : 'transparent', color: viewMode === 'list' ? 'var(--brand)' : 'var(--text-sub)', cursor: 'pointer', display: 'flex', boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none' }}
             >
                <List size={20} />
             </button>
          </div>
       </div>

       {/* Search Bar Block */}
       <div style={{ position: 'relative', marginBottom: '3rem' }}>
          <Search size={22} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)', opacity: 0.6 }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search network binary by identity or module..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              paddingLeft: '4rem', paddingRight: '1.5rem', height: '4.5rem', fontSize: '1.1rem', 
              borderRadius: '100px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)'
            }}
          />
          <div style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-sub)', fontSize: '0.85rem', fontWeight: 600 }}>
             <SlidersHorizontal size={18} />
             <span>Filter</span>
          </div>
       </div>

       {loading && users.length === 0 ? (
         <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-sub)' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }} />
            <span>Scanning Synaptic Registry...</span>
         </div>
       ) : users.length === 0 ? (
         <div style={{ textAlign: 'center', padding: '6rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-sub)', margin: 0, fontSize: '1.1rem' }}>Zero search matches across the current calibration grid.</p>
         </div>
       ) : (
         <div style={viewMode === 'grid' ? { 
           display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' 
         } : {
           display: 'flex', flexDirection: 'column', gap: '1rem'
         }}>
            {users.map(u => {
              const isOnline = onlineUsers.has(u.id)
              return (
                <div 
                  key={u.id} 
                  className="kanban-card" 
                  style={{ 
                    display: 'flex', 
                    flexDirection: viewMode === 'grid' ? 'column' : 'row',
                    alignItems: viewMode === 'grid' ? 'stretch' : 'center',
                    padding: '1.5rem', 
                    cursor: 'default', 
                    position: 'relative',
                    gap: viewMode === 'grid' ? '1.5rem' : '2rem'
                  }}
                >
                   {isOnline && viewMode === 'grid' && (
                     <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--success)', boxShadow: '0 0 8px var(--success)', border: '2px solid var(--surface)' }} />
                   )}
                   
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ width: viewMode === 'grid' ? '64px' : '48px', height: viewMode === 'grid' ? '64px' : '48px', borderRadius: '50%', backgroundColor: 'var(--bg-sub)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                         {u.avatar_url ? (
                           <img src={u.avatar_url} alt={u.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                         ) : (
                           <User size={viewMode === 'grid' ? 32 : 24} color="var(--text-sub)" />
                         )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                         <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{u.full_name}</h3>
                         <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', margin: '0.1rem 0 0' }}>Software Engineer</p>
                      </div>
                      {!isOnline && viewMode === 'list' && (
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-sub)', fontSize: '0.8rem' }}>
                           <Clock size={14} />
                           <span>Seen {formatLastSeen(u.last_seen)}</span>
                        </div>
                      )}
                      {isOnline && viewMode === 'list' && (
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontSize: '0.8rem', fontWeight: 700 }}>
                           <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
                           <span>ACTIVE</span>
                        </div>
                      )}
                   </div>

                   <div style={{ 
                     display: 'flex', 
                     justifyContent: 'space-between', 
                     alignItems: 'center', 
                     background: 'var(--bg-sub)', 
                     padding: '1rem 1.25rem', 
                     borderRadius: '16px', 
                     border: '1px solid var(--border)',
                     flex: viewMode === 'list' ? '0 0 350px' : 'unset'
                   }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                         <span style={{ fontSize: '0.65rem', color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Validity Score</span>
                         <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand)' }}>{u.total_score}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                         <span style={{ fontSize: '0.65rem', color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Workspace</span>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600 }}>
                            <MapPin size={14} color="var(--accent)" />
                            <span>{u.groups?.module_code || 'Unassigned'}</span>
                         </div>
                      </div>
                   </div>

                   {viewMode === 'grid' && (
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                        <Clock size={16} />
                        <span>{isOnline ? <strong style={{ color: 'var(--success)' }}>Active Now</strong> : `Last active ${formatLastSeen(u.last_seen)}`}</span>
                     </div>
                   )}
                </div>
              )
            })}
         </div>
       )}

       <style jsx>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
       `}</style>
    </div>
  )
}
