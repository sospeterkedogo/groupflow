'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  UserCircle, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  FolderDot,
  Plus
} from 'lucide-react'
import { usePresence } from './PresenceProvider'

export default function Sidebar({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(true)
  const [groups, setGroups] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const pathname = usePathname()
  const supabase = createClient()
  const { onlineUsers } = usePresence()
  const isOnline = onlineUsers.has(user.id)

  useEffect(() => {
     fetchInitialData()

     // Realtime subscriptions for TRUE instant UI changes
     const channel = supabase.channel('sidebar_sync')
       .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, () => {
          fetchGroups()
       })
       .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, () => {
          fetchProfile()
       })
       .subscribe()

     return () => { supabase.removeChannel(channel) }
  }, [user.id, pathname])

  const switchActiveGroup = async (groupId: string) => {
     if (profile?.group_id === groupId) return
     
     // 1. Optimistic Update ensuring fast UI snap.
     setProfile((p: any) => ({...p, group_id: groupId}))
     
     // 2. Perform Backend Profile Update securely modifying absolute project binding.
     await supabase.from('profiles').update({ group_id: groupId }).eq('id', user.id)
     
     // 3. Fire absolute browser refresh to physically snap the Kanban pipeline to new target.
     window.location.href = '/dashboard'
  }

  const fetchGroups = async () => {
    const { data } = await supabase.from('groups').select('*').order('created_at', { ascending: false })
    if (data) setGroups(data)
  }

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) setProfile(data)
  }

  const fetchInitialData = () => {
    fetchGroups()
    fetchProfile()
  }

  const navLinks = [
    { name: 'Sprint Board', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Student Network', path: '/dashboard/network', icon: Users },
    { name: 'My Profile', path: '/dashboard/profile', icon: UserCircle },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ]

  return (
    <div className="sidebar-container" style={{ width: isOpen ? '280px' : '80px' }}>
      {/* Header / Toggle */}
      <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: isOpen ? 'space-between' : 'center', borderBottom: '1px solid var(--border-color)' }}>
         {isOpen && (
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <Link href="/dashboard" style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary-color)' }}>GroupFlow</Link>
             <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isOnline ? 'var(--success-color)' : 'var(--text-secondary)', boxShadow: isOnline ? '0 0 4px var(--success-color)' : 'none' }} title={isOnline ? 'Online' : 'Connecting...'} />
           </div>
         )}
         <button onClick={() => setIsOpen(!isOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            {isOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
         </button>
      </div>

      {/* Main Navigation */}
      <div style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
        {navLinks.map(link => {
          const isActive = pathname === link.path
          return (
            <Link 
              key={link.path} 
              href={link.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius)',
                backgroundColor: isActive ? 'var(--bg-secondary)' : 'transparent',
                color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                justifyContent: isOpen ? 'flex-start' : 'center'
              }}
            >
              <link.icon size={20} color={isActive ? 'var(--primary-color)' : 'var(--text-secondary)'} />
              {isOpen && <span>{link.name}</span>}
            </Link>
          )
        })}
      </div>

      {/* Dynamic Projects Hub */}
      <div style={{ padding: '1.5rem 1rem', flex: 1, overflowY: 'auto' }}>
         {isOpen && (
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingLeft: '1rem', paddingRight: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Global Projects</span>
              <Link href="/dashboard/join" title="Join / Create Project">
                <Plus size={16} color="var(--text-secondary)" />
              </Link>
           </div>
         )}
         
         <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {groups.map(group => {
               const isActiveProject = profile?.group_id === group.id
               return (
                 <div 
                   key={group.id}
                   title={group.name}
                   onClick={() => switchActiveGroup(group.id)}
                   style={{
                     display: 'flex',
                     alignItems: 'center',
                     gap: '1rem',
                     padding: '0.5rem 1rem',
                     borderRadius: 'var(--radius)',
                     cursor: 'pointer',
                     backgroundColor: isActiveProject ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
                     border: isActiveProject ? '1px solid rgba(14, 165, 233, 0.2)' : '1px solid transparent',
                     justifyContent: isOpen ? 'flex-start' : 'center',
                     transition: 'all 0.2s ease'
                   }}
                 >
                   <FolderDot size={18} color={isActiveProject ? 'var(--accent-color)' : 'var(--text-secondary)'} />
                   {isOpen && (
                     <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                       <span style={{ fontSize: '0.875rem', fontWeight: isActiveProject ? 600 : 500, color: isActiveProject ? 'var(--text-color)' : 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                         {group.name}
                       </span>
                       <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{group.module_code}</span>
                     </div>
                   )}
                 </div>
               )
            })}
         </div>
      </div>

      {/* Render Authentication Logout correctly */}
      <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center' }}>
         <form action="/auth/signout" method="post" style={{ width: '100%' }}>
            <button 
              type="submit" 
              style={{ 
                width: '100%', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                padding: '0.75rem 1rem', 
                color: 'var(--danger-color)',
                fontWeight: 600,
                justifyContent: isOpen ? 'flex-start' : 'center',
                borderRadius: 'var(--radius)',
              }}
            >
              <LogOut size={20} />
              {isOpen && <span>Sign Out Session</span>}
            </button>
         </form>
      </div>

    </div>
  )
}
