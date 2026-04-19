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
  TrendingUp,
  Sparkles
} from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { Profile } from '@/types/auth'
import { SidebarProps } from '@/types/ui'
import NotificationBell from './NotificationBell'
import { useSmartLoading } from '@/components/GlobalLoadingProvider'
import { useRouter } from 'next/navigation'
import { useProfile } from '@/context/ProfileContext'
import { usePresence } from '@/components/PresenceProvider'
import GlobalSearch from './GlobalSearch'

export default function Sidebar({ user }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
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

  // 1. Manage mobile state with robust resize listener & hydration fix
  useEffect(() => {
    setMounted(true)
    const handleResize = () => {
      const mobile = typeof window !== 'undefined' && window.innerWidth <= 768
      setIsMobile(mobile)
      if (mobile) setIsOpen(false)
      else setIsOpen(true)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 2. Manage body locking for mobile interactions
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.classList.add('body-lock')
    } else {
      document.body.classList.remove('body-lock')
    }
    return () => {
      if (typeof document !== 'undefined') document.body.classList.remove('body-lock')
    }
  }, [isOpen, isMobile])

  const router = useRouter()
  const { withLoading, showConfirmation } = useSmartLoading()

  const handleNav = (path: string, name: string) => {
    if (pathname === path) return;
    router.push(path);
    if (isMobile) setIsOpen(false);
  }

  const handleSignOut = () => {
    showConfirmation({
      title: 'End Session?',
      message: 'Are you sure you want to securely sign out of the GroupFlow2026 environment?',
      type: 'warning',
      onConfirm: async () => {
        await withLoading(async () => {
          // Final presence synchronization before destroying session
          if (user?.id) {
            await supabase
              .from('profiles')
              .update({ last_seen: new Date().toISOString() })
              .eq('id', user.id)
          }
          await supabase.auth.signOut();
          window.location.href = '/login';
        }, 'Securing Environment...');
      },
      onCancel: () => {}
    });
  }

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Peer Network', path: '/dashboard/network', icon: Users },
    { name: 'Share & Borrow', path: '/dashboard/marketplace', icon: TrendingUp },
    { name: 'Chill Out Zone', path: '/dashboard/chillout', icon: Sparkles },
    { name: 'Group Statistics', path: profile?.group_id ? `/dashboard/analytics/${profile.group_id}` : '/dashboard/analytics', icon: BarChart3 },
    { name: 'Management', path: '/dashboard/upgrade', icon: Activity },
    { name: 'My Profile', path: '/dashboard/profile', icon: UserCircle },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ]

  // Prevent flash by not rendering structural overrides until mounted
  if (!mounted) return null;

  return (
    <div style={{ display: 'contents' }}>
      {/* Mobile Backdrop */}
      <div 
        className={`sidebar-backdrop ${isOpen ? 'visible' : ''}`} 
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Top Header (High Contrast) */}
      <div className="mobile-header" style={{
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--h-nav)',
        zIndex: 5000,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 0.75rem',
        background: 'var(--surface)',
        borderBottom: '2px solid var(--border)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button 
            onClick={() => setIsOpen(true)} 
            aria-label="Toggle Menu"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', overflow: 'hidden', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(var(--brand-rgb), 0.3)' }}>
               <img src="/logo.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Logo" />
            </div>
          </button>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 950, color: 'var(--text-main)', fontSize: '1.1rem', letterSpacing: '-0.04em', lineHeight: 1 }}>
              Group<span style={{ color: 'var(--brand)' }}>Flow2026</span>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isOnline ? 'var(--success)' : 'var(--text-sub)', boxShadow: isOnline ? '0 0 6px var(--success)' : 'none' }} className={isOnline ? 'pulse-pill' : ''} />
              <span style={{ fontSize: '0.6rem', fontWeight: 950, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{onlineCount} ACTIVE MEMBERS</span>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ transform: 'scale(0.85)' }}><NotificationBell /></div>
          <button 
            onClick={() => router.push('/dashboard/profile')} 
            style={{ width: '32px', height: '32px', borderRadius: '10px', border: '2px solid var(--brand)', overflow: 'hidden', background: 'var(--bg-sub)', cursor: 'pointer', padding: 0 }}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" />
            ) : (
              <UserCircle size={20} color="var(--text-sub)" />
            )}
          </button>
        </div>
      </div>

      <aside 
        className={`sidebar-container ${isOpen ? 'open' : 'closed'}`} 
        aria-hidden={!isOpen && isMobile}
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          width: isOpen ? '280px' : '84px',
          maxWidth: '85vw',
          height: 'var(--vh-dynamic)',
          backgroundColor: 'var(--bg-sub)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: isMobile ? 5100 : 4600,
          boxShadow: isOpen && isMobile ? '20px 0 50px rgba(0,0,0,0.2)' : 'none'
        }}
      >
        {/* Header / Toggle */}
        <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', minHeight: 'var(--h-nav)' }}>
          {isOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 0 }}>
              <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', fontWeight: 950, fontSize: '1.25rem', color: 'var(--text-main)', letterSpacing: '-0.04em', flexShrink: 0 }}>
                Group<span style={{ color: 'var(--brand)' }}>Flow2026</span>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '4px 10px', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', flexShrink: 0 }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isOnline ? 'var(--success)' : 'var(--text-sub)', boxShadow: isOnline ? '0 0 8px var(--success)' : 'none' }} className={isOnline ? 'pulse-pill' : ''} />
                <span style={{ fontSize: '0.6rem', fontWeight: 950, color: 'var(--text-main)', letterSpacing: '0.05em' }}>{onlineCount} ACTIVE</span>
              </div>
              <div style={{ flex: 1 }} />
              <div className="hide-mobile" style={{ marginRight: '0.25rem', flexShrink: 0 }}>
                <NotificationBell />
              </div>
            </div>
          ) : (
            <div className="hide-mobile" style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '0.25rem' }}>
               <NotificationBell />
            </div>
          )}
          
          <button 
            onClick={() => setIsOpen(!isOpen)}
            style={{ background: 'none', border: 'none', color: 'var(--text-sub)', cursor: 'pointer', display: 'flex', padding: '8px' }}
            className="hover-card hide-mobile"
            aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
          
          <button 
            onClick={() => setIsOpen(false)}
            className="hide-desktop"
            style={{ background: 'rgba(var(--text-main-rgb), 0.05)', border: 'none', color: 'var(--text-sub)', cursor: 'pointer', padding: '8px', borderRadius: '10px' }}
            aria-label="Close Sidebar"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Global Search Interface */}
        <div style={{ padding: isOpen ? '0.75rem 0.6rem 0' : '0.75rem 0.5rem 0' }}>
            <GlobalSearch collapsed={!isOpen} />
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '0.75rem 0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navLinks.map((link) => {
            let isActive = link.path === '/dashboard' 
              ? pathname === '/dashboard' 
              : pathname.startsWith(link.path)
            
            if (link.name === 'Group Statistics') {
              isActive = pathname.startsWith('/dashboard/analytics')
            }
            if (link.name === 'Peer Network' && pathname.startsWith('/dashboard/analytics')) {
              isActive = false
            }

            const isPremiumLocked = (link.name === 'Chill Out Zone' || link.name === 'Group Statistics') && profile?.subscription_plan !== 'premium' && profile?.subscription_plan !== 'pro'

            return (
              <button 
                key={link.name}
                onClick={() => handleNav(link.path, link.name)}
                className={`nav-bubble ${isActive ? 'active-project' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: isOpen ? '0.5rem 1rem' : '0.5rem 0',
                  color: isActive ? 'var(--brand)' : 'var(--text-sub)',
                  backgroundColor: isActive ? 'rgba(var(--brand-rgb), 0.05)' : 'transparent',
                  fontWeight: isActive ? 900 : 700,
                  fontSize: '0.85rem',
                  transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                  justifyContent: isOpen ? 'flex-start' : 'center',
                  borderRadius: isOpen ? '0 30px 30px 0' : '12px',
                  marginRight: isOpen ? '1rem' : '0.75rem',
                  marginLeft: isOpen ? '0' : '0.75rem',
                  position: 'relative',
                  border: 'none',
                  cursor: 'pointer',
                  width: isOpen ? 'calc(100% - 1rem)' : 'calc(100% - 1.5rem)'
                }}
                title={!isOpen ? link.name : ''}
              >
                <link.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {isOpen && (
                  <>
                    <span style={{ letterSpacing: '-0.01em' }}>{link.name}</span>
                    {isPremiumLocked && (
                      <span className="locked-badge locked-badge-premium">PREMIUM</span>
                    )}
                  </>
                )}
                {isActive && (
                  <div style={{ position: 'absolute', left: 0, top: '15%', bottom: '15%', width: '4px', background: 'var(--brand)', borderRadius: '0 4px 4px 0' }} />
                )}
              </button>
            )
          })}
        </nav>

        {/* GO PRO CARD */}
        {isOpen && (!profile?.subscription_plan || profile.subscription_plan === 'free') && (
          <div style={{ padding: '0 1rem 1rem' }}>
            <div 
              className="glass-card-prestige"
              style={{ 
                padding: '1.25rem', 
                borderRadius: '20px', 
                position: 'relative', 
                overflow: 'hidden',
                cursor: 'pointer'
              }}
              onClick={() => router.push('/dashboard/upgrade')}
            >
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', background: 'var(--brand)', filter: 'blur(35px)', opacity: 0.2 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Sparkles size={16} className="shimmer-gold" />
                <span style={{ fontSize: '0.7rem', fontWeight: 950, letterSpacing: '1px', color: 'var(--text-main)' }}>MISSION SUPPORT</span>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Upgrade to Pro</div>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-sub)', margin: 0, lineHeight: 1.4 }}>Unlock advanced themes and elite profile status.</p>
            </div>
          </div>
        )}

        {/* Footer / User Profile */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
           <div style={{ 
             display: 'flex', 
             alignItems: 'center', 
             gap: '0.5rem', 
             padding: isOpen ? '0.5rem' : '0', 
             backgroundColor: isOpen ? 'var(--bg-main)' : 'transparent',
             borderRadius: '12px',
             border: isOpen ? '1px solid var(--border)' : 'none',
             justifyContent: isOpen ? 'flex-start' : 'center',
             cursor: 'pointer',
             transition: 'all 0.2s ease',
             minHeight: '40px'
           }}
           className="identity-pill"
           onClick={() => window.location.href = '/dashboard/profile'}
           >
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--brand)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 950, flexShrink: 0, overflow: 'hidden', boxShadow: '0 2px 8px rgba(var(--brand-rgb), 0.15)' }}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="User avatar" />
                ) : (
                  profile?.full_name?.charAt(0) || 'U'
                )}
              </div>
             {isOpen && (
               <div style={{ flex: 1, overflow: 'hidden' }}>
                 <div style={{ color: 'var(--text-main)', fontWeight: 900, fontSize: '0.85rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', letterSpacing: '-0.02em' }}>
                   {profile?.full_name || 'Anonymous'}
                 </div>
                 <div style={{ color: 'var(--success)', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                   Session Active
                 </div>
               </div>
             )}
           </div>

           <div style={{ display: 'flex', flexDirection: isOpen ? 'row' : 'column', gap: '0.4rem' }}>
             <button 
               onClick={toggleTheme}
               style={{ flex: 1, height: '36px', borderRadius: '10px', background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-sub)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
               title="Toggle Aesthetics"
               className="panel-tool"
             >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
             </button>
             <button 
               onClick={handleSignOut}
               style={{ flex: 1, height: '36px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', color: 'var(--error)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
               title="End Session"
               className="panel-tool"
             >
               <LogOut size={18} />
             </button>
           </div>
        </div>
      </aside>

      <style jsx>{`
        .nav-bubble:hover {
          transform: translateX(4px);
          color: var(--brand) !important;
        }
        .nav-bubble:active { transform: scale(0.98); }
        .identity-pill:hover { border-color: var(--brand) !important; background: var(--bg-sub); }
        
        .sidebar-backdrop {
          display: none;
        }

        @media (max-width: 768px) {
          .sidebar-backdrop {
            display: block;
            pointer-events: none;
            opacity: 0;
            visibility: hidden;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(4px);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: fixed;
            inset: 0;
            z-index: 4500;
          }
          .sidebar-backdrop.visible {
            pointer-events: auto;
            opacity: 1;
            visibility: visible;
          }

          .mobile-header { display: flex !important; }
          .mobile-header {
             background: var(--surface) !important;
          }
          .main-content { margin-left: 0 !important; padding-top: calc(var(--h-nav) + 1rem) !important; }
          .sidebar-container { 
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            bottom: 0 !important;
            z-index: 5100 !important;
            background: var(--surface) !important;
            box-shadow: 20px 0 50px rgba(0,0,0,0.4) !important;
            transform: translateX(-100%);
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
            width: 85vw !important;
            max-width: 340px !important;
          }
          .sidebar-container.open { transform: translateX(0) !important; }
          .sidebar-container.closed { transform: translateX(-100%) !important; }
        }

        .active-project::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          box-shadow: 0 0 0 2px var(--brand);
          opacity: 0.1;
          animation: pulse-border 2s infinite;
        }
        @keyframes pulse-border {
          0% { opacity: 0.1; }
          50% { opacity: 0.2; }
          100% { opacity: 0.1; }
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
