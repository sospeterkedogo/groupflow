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
  Plus,
  BarChart3
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
    { name: 'Project Analytics', path: profile?.group_id ? `/dashboard/analytics/${profile.group_id}` : '/dashboard/network', icon: BarChart3 },
    { name: 'My Profile', path: '/dashboard/profile', icon: UserCircle },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ]

  return (
    <div className="sidebar-container" style={{ width: isOpen ? '280px' : '80px' }}>
      {/* Header / Toggle */}
      <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: isOpen ? 'space-between' : 'center', borderBottom: '1px solid var(--border)' }}>
         {isOpen && (
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <Link href="/dashboard" style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--brand)' }}>GroupFlow</Link>
             <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isOnline ? 'var(--success)' : 'var(--text-sub)', boxShadow: isOnline ? '0 0 4px var(--success)' : 'none' }} title={isOnline ? 'Online' : 'Connecting...'} />
           </div>
         )}
         <button onClick={() => setIsOpen(!isOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-sub)' }}>
            {isOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
         </button>
      </div>

      {/* Main Navigation */}
      <div style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderBottom: '1px solid var(--border)' }}>
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
                background: isActive ? 'var(--surface)' : 'transparent',
                color: isActive ? 'var(--brand)' : 'var(--text-sub)',
                borderRadius: '12px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <link.icon size={20} color={isActive ? 'var(--brand)' : 'var(--text-sub)'} />
              {isOpen && <span>{link.name}</span>}
              {isOpen && isActive && <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand)' }} />}
            </Link>
          )
        })}
      </div>

      {/* Dynamic Projects Hub */}
      <div style={{ padding: '1.5rem 1rem', flex: 1, overflowY: 'auto' }}>
         {isOpen && (
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingLeft: '1rem', paddingRight: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '1px' }}>Global Projects</span>
              <Link href="/dashboard/join" title="Join / Create Project">
                <Plus size={16} color="var(--text-sub)" />
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
                   <FolderDot size={18} color={isActiveProject ? 'var(--brand)' : 'var(--text-sub)'} />
                   {isOpen && (
                     <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                       <span style={{ fontSize: '0.875rem', fontWeight: isActiveProject ? 600 : 500, color: isActiveProject ? 'var(--text-main)' : 'var(--text-sub)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                         {group.name}
                       </span>
                       <span style={{ fontSize: '0.65rem', color: 'var(--text-sub)' }}>{group.module_code}</span>
                     </div>
                   )}
                 </div>
               )
            })}
         </div>
      </div>

      {/* Render Authentication Logout correctly */}
      <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
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
                color: 'var(--error)',
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
