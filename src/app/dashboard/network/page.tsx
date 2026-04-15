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
  const [currentUserGroup, setCurrentUserGroup] = useState<string | null>(null)
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
    fetchCurrentGroup()
    fetchUsers()
  }, [])

  const fetchCurrentGroup = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('profiles').select('group_id').eq('id', user.id).single()
      if (data) setCurrentUserGroup(data.group_id)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    let query = supabase
      .from('profiles')
      .select('*, groups(name, module_code, is_encrypted)') // Added is_encrypted
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--p-safe)', animation: 'fadeIn 0.5s ease-out' }}>
       
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ flex: '1 1 300px' }}>
            <h1 className="fluid-h1" style={{ marginBottom: '0.25rem', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>Student Network</h1>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', margin: 0 }}>Find collaborators and compare project scores.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg-sub)', padding: '0.4rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
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
       <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
          <Search size={22} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)', opacity: 0.6 }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search students..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              paddingLeft: '3.5rem', paddingRight: '1rem', height: '3.5rem', fontSize: '1rem', 
              borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)'
            }}
          />
       </div>

       {loading && users.length === 0 ? (
         <div 
           className="network-grid" 
           style={viewMode === 'grid' ? { 
             display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--grid-gap)' 
           } : {
             display: 'flex', flexDirection: 'column', gap: '0.75rem'
           }}
         >
           {[1, 2, 3, 4, 5, 6].map(i => (
             <div key={i} style={{ 
                display: 'flex', flexDirection: viewMode === 'grid' ? 'column' : 'row',
                alignItems: viewMode === 'grid' ? 'stretch' : 'center',
                padding: 'var(--card-p)', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', gap: '1rem'
             }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <div className="skeleton skeleton-avatar" style={{ width: '48px', height: '48px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                     <div className="skeleton skeleton-title" style={{ width: '60%', marginBottom: '8px' }} />
                     <div className="skeleton skeleton-text" style={{ width: '40%' }} />
                  </div>
                </div>
                {viewMode === 'grid' && <div className="skeleton skeleton-card" style={{ height: '60px', marginTop: '1rem' }} />}
             </div>
           ))}
         </div>
       ) : users.length === 0 ? (
         <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-sub)', margin: 0, fontSize: '1rem' }}>No students found matching your search.</p>
         </div>
       ) : (
         <div 
           className="network-grid" 
           style={viewMode === 'grid' ? { 
             display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--grid-gap)' 
           } : {
             display: 'flex', flexDirection: 'column', gap: '0.75rem'
           }}
         >
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
                    padding: 'var(--card-p)', 
                    cursor: 'default', 
                    position: 'relative',
                    gap: viewMode === 'grid' ? '1rem' : '1.5rem'
                  }}
                >
                   {isOnline && viewMode === 'grid' && (
                     <div style={{ position: 'absolute', top: '1rem', right: '1rem', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success)', boxShadow: '0 0 8px var(--success)', border: '2px solid var(--surface)' }} />
                   )}
                   
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: viewMode === 'grid' ? '56px' : '44px', height: viewMode === 'grid' ? '56px' : '44px', borderRadius: '50%', backgroundColor: 'var(--bg-sub)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                         {u.avatar_url ? (
                           <img src={u.avatar_url} alt={u.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                         ) : (
                           <User size={viewMode === 'grid' ? 28 : 22} color="var(--text-sub)" />
                         )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                         <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {u.groups?.is_encrypted && u.group_id !== currentUserGroup ? 'Private Student' : u.full_name}
                         </h3>
                         <p style={{ color: 'var(--text-sub)', fontSize: '0.8rem', margin: '0.1rem 0 0' }}>Software Engineer</p>
                      </div>
                      {!isOnline && viewMode === 'list' && (
                        <div style={{ marginLeft: 'auto', display: 'none', alignItems: 'center', gap: '0.3rem', color: 'var(--text-sub)', fontSize: '0.75rem' }} className="seen-badge">
                           <Clock size={12} />
                           <span>{formatLastSeen(u.last_seen)}</span>
                        </div>
                      )}
                   </div>

                   <div style={{ 
                     display: 'flex', 
                     justifyContent: 'space-between', 
                     alignItems: 'center', 
                     background: 'var(--bg-sub)', 
                     padding: '0.75rem 1rem', 
                     borderRadius: '12px', 
                     border: '1px solid var(--border)',
                     flex: viewMode === 'list' ? '1 1 200px' : 'unset',
                     width: viewMode === 'list' ? 'auto' : '100%'
                   }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                         <span style={{ fontSize: '0.6rem', color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 800 }}>Score</span>
                         <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--brand)' }}>{u.total_score}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                         <span style={{ fontSize: '0.6rem', color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 800 }}>Team</span>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 700 }}>
                            <MapPin size={12} color="var(--accent)" />
                            <span>
                               {u.groups?.is_encrypted && u.group_id !== currentUserGroup ? 'Private' : (u.groups?.module_code || 'Unassigned')}
                            </span>
                         </div>
                      </div>
                   </div>

                   {viewMode === 'grid' && (
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                        <Clock size={14} />
                        <span>{isOnline ? <strong style={{ color: 'var(--success)' }}>Active Now</strong> : `Last active ${formatLastSeen(u.last_seen)}`}</span>
                     </div>
                   )}
                </div>
              )
            })}
         </div>
       )}

       <style jsx>{`
          .network-grid {
             --grid-gap: 2rem;
             --card-p: 1.5rem;
          }
          @media (max-width: 768px) {
             .network-grid {
                --grid-gap: 1rem;
                --card-p: 1rem;
             }
             .seen-badge { display: flex !important; }
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
       `}</style>
    </div>
  )
}
