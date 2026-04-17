'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  UserCircle, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Activity,
  Moon,
  Sun,
  TrendingUp
} from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { Profile } from '@/types/auth'
import { SidebarProps } from '@/types/ui'
import NotificationBell from './NotificationBell'
import { useSmartLoading } from '@/components/GlobalLoadingProvider'
import { useRouter } from 'next/navigation'
import { useProfile } from '@/context/ProfileContext'
import { usePresence } from '@/components/PresenceProvider'

export default function Sidebar({ user }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const { profile } = useProfile()
  const pathname = usePathname()
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const { currentPalette, setPalette } = useTheme()
  const { onlineUsers } = usePresence()
  const isOnline = Boolean(profile)
  const onlineCount = onlineUsers.size

  const toggleTheme = () => {
    const paletteNames = ['Google Light', 'Deep Oceanic', 'Cyberpunk']
    const currentIndex = paletteNames.indexOf(currentPalette.name)
    const nextIndex = (currentIndex + 1) % paletteNames.length
    setPalette(paletteNames[nextIndex])
  }

  const isDark = currentPalette.name !== 'Google Light'

  useEffect(() => {
    const initializeMobileState = () => {
      if (window.innerWidth <= 768) {
        setIsOpen(false)
      }
    }
    initializeMobileState()

    const handleBodyLock = () => {
      if (window.innerWidth <= 768 && isOpen) {
        document.body.classList.add('body-lock')
      } else {
        document.body.classList.remove('body-lock')
      }
    }
    handleBodyLock()

    return () => {
      document.body.classList.remove('body-lock')
    }
  }, [isOpen])

  const router = useRouter()
  const { withLoading, showConfirmation } = useSmartLoading()

  const handleNav = async (path: string, name: string) => {
    if (pathname === path) return;
    await withLoading(async () => {
      await new Promise(r => setTimeout(r, 600));
      router.push(path);
      if (window.innerWidth <= 768) setIsOpen(false);
    }, `Syncing ${name}...`);
  }

  const handleSignOut = () => {
    showConfirmation({
      title: 'End Session?',
      message: 'Are you sure you want to securely sign out of the GroupFlow environment?',
      type: 'warning',
      onConfirm: async () => {
        await withLoading(async () => {
          await supabase.auth.signOut();
          window.location.href = '/login';
        }, 'Securing Environment...');
      },
      onCancel: () => {}
    });
  }

  const navLinks = [
    { name: 'Task Board', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Student Network', path: '/dashboard/network', icon: Users },
    { name: 'Group Stats', path: profile?.group_id ? `/dashboard/analytics/${profile.group_id}` : '/dashboard/network', icon: BarChart3 },
    { name: 'Upgrade', path: '/dashboard/upgrade', icon: TrendingUp },
    { name: 'My Profile', path: '/dashboard/profile', icon: UserCircle },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ]

  return (
    <div style={{ display: 'contents' }}>
      {/* Mobile Backdrop */}
      <div 
        className={`sidebar-backdrop ${isOpen ? 'visible' : ''}`} 
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Top Header */}
      <div className="mobile-header glass" style={{
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--h-nav)',
        zIndex: 5000,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => setIsOpen(!isOpen)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
               <Activity size={20} />
            </div>
          </button>
          <span style={{ fontWeight: 900, color: 'var(--brand)', fontSize: '1.1rem', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>GroupFlow</span>
        </div>
        <button 
          onClick={() => handleNav('/dashboard/profile', 'Profile')} 
          style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-sub)', cursor: 'pointer', padding: 0 }}
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <UserCircle size={20} color="var(--text-sub)" />
          )}
        </button>
      </div>

      <div className={`sidebar-container ${isOpen ? 'open' : 'closed'}`} style={{ 
        width: isOpen ? '280px' : '80px',
        maxWidth: '85vw',
        height: 'var(--vh-dynamic)',
        backgroundColor: 'var(--bg-sub)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 4600
      }}>
        {/* Header / Toggle */}
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', minHeight: 'var(--h-nav)' }}>
          {isOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
              <button onClick={() => handleNav('/dashboard', 'Home')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', fontWeight: 900, fontSize: '1.2rem', color: 'var(--brand)', letterSpacing: '-0.02em' }}>GroupFlow</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '4px 10px', background: 'rgba(var(--brand-rgb), 0.08)', borderRadius: '20px', border: '1px solid rgba(var(--brand-rgb), 0.1)' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isOnline ? 'var(--success)' : 'var(--text-sub)', boxShadow: isOnline ? '0 0 8px var(--success)' : 'none' }} className={isOnline ? 'pulse-pill' : ''} />
                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-sub)' }}>{onlineCount} Online</span>
              </div>
              <div style={{ flex: 1 }} />
              <div className="hide-mobile" style={{ marginRight: '0.5rem' }}>
                <NotificationBell />
              </div>
            </div>
          ) : (
            <div className="hide-mobile" style={{ marginBottom: '0.5rem' }}>
               <NotificationBell />
            </div>
          )}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            style={{ background: 'none', border: 'none', color: 'var(--text-sub)', cursor: 'pointer', display: 'flex', padding: '4px' }}
            className="hover-card hide-mobile"
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navLinks.map((link) => {
            let isActive = link.path === '/dashboard' 
              ? pathname === '/dashboard' 
              : pathname.startsWith(link.path)
            
            // Special case for Group Stats to avoid dual-highlighting when it points to /network
            if (link.name === 'Group Stats') {
              isActive = pathname.startsWith('/dashboard/analytics')
            }
            if (link.name === 'Student Network' && pathname.startsWith('/dashboard/analytics')) {
              isActive = false
            }
            return (
              <button 
                key={link.name}
                onClick={() => handleNav(link.path, link.name)}
                className={`nav-bubble ${isActive ? 'active-project' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.8rem 1.5rem',
                  color: isActive ? 'var(--brand)' : 'var(--text-sub)',
                  backgroundColor: isActive ? 'rgba(var(--brand-rgb), 0.06)' : 'transparent',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.875rem',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  justifyContent: isOpen ? 'flex-start' : 'center',
                  borderRadius: '0 50px 50px 0',
                  marginRight: '1rem',
                  position: 'relative',
                  border: 'none',
                  cursor: 'pointer',
                  width: 'calc(100% - 1rem)'
                }}
                title={!isOpen ? link.name : ''}
              >
                <link.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {isOpen && <span>{link.name}</span>}
                {isActive && (
                  <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '4px', background: 'var(--brand)', borderRadius: '0 4px 4px 0' }} />
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer / User Profile */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
           <div style={{ 
             display: 'flex', 
             alignItems: 'center', 
             gap: '0.75rem', 
             padding: isOpen ? '0.6rem' : '0', 
             backgroundColor: isOpen ? 'var(--bg-main)' : 'transparent',
             borderRadius: '16px',
             border: isOpen ? '1px solid var(--border)' : 'none',
             justifyContent: isOpen ? 'flex-start' : 'center',
             cursor: 'pointer'
           }}
           className="identity-pill"
           onClick={() => window.location.href = '/dashboard/profile'}
           >
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--brand)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 900, flexShrink: 0, overflow: 'hidden' }}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  profile?.full_name?.charAt(0) || 'U'
                )}
              </div>
             {isOpen && (
               <div style={{ flex: 1, overflow: 'hidden' }}>
                 <div style={{ color: 'var(--text-main)', fontWeight: 800, fontSize: '0.8rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                   {profile?.full_name || 'Anonymous'}
                 </div>
                 <div style={{ color: 'var(--success)', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase' }}>
                   Online
                 </div>
               </div>
             )}
           </div>

           <div style={{ display: 'flex', flexDirection: isOpen ? 'row' : 'column', gap: '0.5rem' }}>
             <button 
               onClick={toggleTheme}
               style={{ flex: 1, height: '40px', borderRadius: '12px', background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-sub)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
               title="Theme"
             >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
             </button>
             <button 
               onClick={handleSignOut}
               style={{ flex: 1, height: '40px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', color: 'var(--error)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
               title="Sign Out"
             >
               <LogOut size={18} />
             </button>
           </div>
        </div>
      </div>

      <style jsx>{`
        .nav-bubble:hover, .project-bubble:hover, .logout-bubble:hover, .theme-bubble:hover {
          transform: scale(1.08);
          filter: brightness(1.1);
        }
        .nav-bubble:active, .theme-bubble:active, .logout-bubble:active { transform: scale(0.95); }
        .identity-pill:hover { border-color: var(--brand) !important; }
        
        @media (max-width: 768px) {
          .mobile-header { display: flex !important; }
          .sidebar-container { 
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            bottom: 0 !important;
            z-index: 4600 !important;
            background: var(--bg-main) !important;
            box-shadow: 20px 0 50px rgba(0,0,0,0.4) !important;
            transform: translateX(-100%);
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
            width: 280px !important;
          }
          .sidebar-container.open { transform: translateX(0); }
          .sidebar-container.closed { transform: translateX(-100%); }
        }

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
        .pulse-pill {
          animation: pulse-glow 2s infinite;
        }
        @keyframes pulse-glow {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
