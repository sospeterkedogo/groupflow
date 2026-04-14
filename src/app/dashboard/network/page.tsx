'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Search, MapPin } from 'lucide-react'

export default function NetworkPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    // We intentionally ignore the exhaustive-deps warning here because we want
    // the initial mount to fetch all users precisely once before the search effect takes over.
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    let query = supabase
      .from('profiles')
      .select('*, groups(module_code)')
      .order('total_score', { ascending: false })
    
    if (search.trim()) {
      query = query.ilike('full_name', `%${search}%`)
    }
    
    const { data } = await query
    if (data) setUsers(data)
    setLoading(false)
  }

  // Advanced Debounced Auto-Search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers()
    }, 300)
    
    return () => clearTimeout(timer)
  }, [search])

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
       <div>
         <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 800 }}>Student Network Directory</h1>
         <p style={{ color: 'var(--text-secondary)' }}>Discover peers, trace module assignments globally, and benchmark Algorithmic Validity Scores.</p>
       </div>

       {/* Google-Style Omni Search Bar */}
       <div style={{ position: 'relative' }}>
         <Search size={22} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
         <input 
           type="text" 
           className="form-input" 
           placeholder="Search network mathematically by full name..." 
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           style={{ 
             paddingLeft: '3.5rem', 
             paddingRight: '1rem', 
             height: '4rem', 
             fontSize: '1rem', 
             borderRadius: '50px', 
             boxShadow: 'var(--shadow-md)',
             border: '1px solid var(--border-color)',
             backgroundColor: 'var(--card-bg)'
           }}
         />
       </div>

       {loading && users.length === 0 ? (
         <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Scanning database...</div>
       ) : users.length === 0 ? (
         <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius)' }}>
            No students found matching your search matrix.
         </div>
       ) : (
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
           {users.map(u => (
             <div key={u.id} className="kanban-card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', cursor: 'default' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                   <div>
                     <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>{u.full_name}</h3>
                     <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Registered Software Engineer</p>
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Validity</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-color)' }}>{u.total_score}</span>
                   </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                   <MapPin size={16} />
                   {u.groups ? (
                     <span>Assigned to Cohort: <strong style={{ color: 'var(--text-color)' }}>{u.groups.module_code}</strong></span>
                   ) : (
                     <span>Awaiting Module Assignment</span>
                   )}
                </div>
             </div>
           ))}
         </div>
       )}
    </div>
  )
}
