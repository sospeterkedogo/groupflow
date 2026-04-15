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
  BarChart3,
  Palette as PaletteIcon
} from 'lucide-react'
import { usePresence } from './PresenceProvider'
import { useTheme, PALETTES } from '../context/ThemeContext'
import NotificationBell from './NotificationBell'


export default function Sidebar({ user }: { user: any }) {
  const { currentPalette, setPalette } = useTheme()
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
    setProfile((p: any) => ({ ...p, group_id: groupId }))

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
    { name: 'Task Board', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Student Network', path: '/dashboard/network', icon: Users },
    { name: 'Group Stats', path: profile?.group_id ? `/dashboard/analytics/${profile.group_id}` : '/dashboard/network', icon: BarChart3 },
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <NotificationBell />
          <button onClick={() => setIsOpen(!isOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-sub)' }}>
            {isOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderBottom: '1px solid var(--border)' }}>
        {navLinks.map(link => {
          const isActive = pathname === link.path
          return (
            <Link
              key={link.name}
              href={link.path}
              title={!isOpen ? link.name : ''}
              className={`nav-bubble ${isActive ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isOpen ? 'flex-start' : 'center',
                gap: isOpen ? '0.75rem' : '0',
                padding: isOpen ? '0.65rem 1rem' : '0',
                width: isOpen ? '100%' : '48px',
                height: isOpen ? 'auto' : '48px',
                margin: isOpen ? '0' : '0 auto',
                background: isActive ? 'var(--brand)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-sub)',
                borderRadius: isOpen ? '12px' : '50%',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                border: 'none',
                boxShadow: isActive ? '0 8px 16px rgba(var(--brand-rgb), 0.3)' : 'none',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <link.icon size={20} color={isActive ? 'white' : 'var(--text-sub)'} />
              {isOpen && <span style={{ fontWeight: 600 }}>{link.name}</span>}

              {/* Glossy Overlay for Active State */}
              {isActive && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(45deg, rgba(255,255,255,0.1), transparent)', pointerEvents: 'none' }} />
              )}
            </Link>
          )
        })}
      </div>

      {/* Dynamic Projects Hub */}
      <div style={{ padding: '1.25rem 1rem', flex: 1, minHeight: '180px', overflowY: 'auto' }}>
        {isOpen && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingLeft: '1rem', paddingRight: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '1px' }}>Teams</span>
            <Link href="/dashboard/join" title="Join / Create Project">
              <Plus size={16} color="var(--text-sub)" />
            </Link>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {groups.length === 0 ? (
            [1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: isOpen ? '42px' : '40px', borderRadius: isOpen ? 'var(--radius)' : '50%', margin: isOpen ? '0' : '4px auto', width: isOpen ? '100%' : '40px' }} />
            ))
          ) : (
            groups.map(group => {
              const isActiveProject = profile?.group_id === group.id
              return (
                <Link
                  key={group.id}
                  href={`/dashboard/analytics/${group.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isOpen ? '1rem' : '0',
                    padding: isOpen ? '0.5rem 1rem' : '0',
                    margin: isOpen ? '0' : '4px auto',
                    width: isOpen ? '100%' : '40px',
                    height: isOpen ? 'auto' : '40px',
                    borderRadius: isOpen ? 'var(--radius)' : '50%',
                    cursor: 'pointer',
                    backgroundColor: isActiveProject ? 'rgba(var(--brand-rgb), 0.1)' : 'transparent',
                    border: isActiveProject ? '1px solid rgba(var(--brand-rgb), 0.2)' : '1px solid transparent',
                    justifyContent: isOpen ? 'flex-start' : 'center',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    boxShadow: isActiveProject && !isOpen ? '0 0 12px rgba(var(--brand-rgb), 0.3)' : 'none',
                    textDecoration: 'none'
                  }}
                  className={`project-bubble ${isActiveProject ? 'active-project' : ''}`}
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
                </Link>
              )
            })
          )}
        </div>
      </div>


      {/* Bottom Identity & Actions — single unified row */}
      <div style={{
        padding: '0.6rem 0.75rem',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexShrink: 0,
      }}>
        {/* Profile Avatar Bubble */}
        <Link
          href="/dashboard/profile"
          title={profile?.full_name || 'My Profile'}
          style={{
            flex: isOpen ? 1 : 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.4rem 0.6rem',
            borderRadius: '12px',
            background: 'var(--bg-main)',
            border: '1px solid var(--border)',
            textDecoration: 'none',
            minWidth: '40px',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
          className="identity-pill"
        >
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid var(--brand)',
              background: 'var(--surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <UserCircle size={18} color="var(--text-sub)" />
              )}
            </div>
            <div style={{
              position: 'absolute',
              bottom: '-1px',
              right: '-1px',
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              backgroundColor: isOnline ? 'var(--success)' : 'var(--text-sub)',
              border: '2px solid var(--bg-main)',
              boxShadow: isOnline ? '0 0 4px var(--success)' : 'none'
            }} />
          </div>
          {isOpen && (
            <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile?.full_name || 'Anonymous'}
              </div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-sub)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Profile
              </div>
            </div>
          )}
        </Link>

        {/* Theme Switcher Bubble */}
        <button
          onClick={() => {
            const currentIndex = PALETTES.findIndex(p => p.name === currentPalette.name)
            const nextIndex = (currentIndex + 1) % PALETTES.length
            setPalette(PALETTES[nextIndex].name)
          }}
          title={`Theme: ${currentPalette.name}`}
          style={{
            width: '38px',
            height: '38px',
            flexShrink: 0,
            background: 'rgba(var(--brand-rgb), 0.1)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand)',
            borderRadius: '12px',
            transition: 'all 0.25s',
          }}
          className="theme-bubble"
        >
          <PaletteIcon size={17} />
        </button>

        {/* Logout Bubble */}
        <form action="/auth/signout" method="post" style={{ flexShrink: 0 }}>
          <button
            type="submit"
            title="Sign Out"
            style={{
              width: '38px',
              height: '38px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--error)',
              borderRadius: '12px',
              transition: 'all 0.25s',
            }}
            className="logout-bubble"
          >
            <LogOut size={17} />
          </button>
        </form>
      </div>

      <style jsx>{`
        .nav-bubble:hover, .project-bubble:hover, .logout-bubble:hover, .theme-bubble:hover {
          transform: scale(1.08);
          filter: brightness(1.1);
        }
        .nav-bubble:active, .theme-bubble:active, .logout-bubble:active { transform: scale(0.95); }
        .identity-pill:hover { border-color: var(--brand) !important; }
        .active-project {
          position: relative;
        }
        .active-project::after {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          border-radius: inherit;
          box-shadow: 0 0 0 2px var(--brand);
          opacity: 0.15;
          animation: pulse-border 2s infinite;
        }
        @keyframes pulse-border {
          0% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.02); opacity: 0.1; }
          100% { transform: scale(1); opacity: 0.2; }
        }
      `}</style>

    </div>
  )
}
