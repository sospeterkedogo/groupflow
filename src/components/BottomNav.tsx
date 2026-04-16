'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  Settings,
  BarChart3
} from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()

  const navLinks = [
    { name: 'Board', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Stats', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Network', path: '/dashboard/network', icon: Users },
    { name: 'Profile', path: '/dashboard/profile', icon: UserCircle },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ]

  return (
    <nav className="mobile-bottom-nav glass" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 'var(--h-mobile-bottom)',
      backgroundColor: 'rgba(var(--bg-sub-rgb), 0.8)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border)',
      zIndex: 4000,
      padding: '0 1rem',
      paddingBottom: 'env(safe-area-inset-bottom)',
      justifyContent: 'space-around',
      alignItems: 'center'
    }}>
      {navLinks.map((link) => {
        const isActive = pathname === link.path
        return (
          <Link 
            key={link.path} 
            href={link.path}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              textDecoration: 'none',
              color: isActive ? 'var(--brand)' : 'var(--text-sub)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              padding: '0.5rem',
              flex: 1
            }}
          >
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: isActive ? 'scale(1.1) translateY(-2px)' : 'none',
              transition: 'transform 0.3s ease'
            }}>
              <link.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--brand)',
                  boxShadow: '0 0 8px var(--brand)'
                }} />
              )}
            </div>
            <span style={{ 
              fontSize: '0.65rem', 
              fontWeight: isActive ? 800 : 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {link.name}
            </span>
          </Link>
        )
      })}

    </nav>
  )
}
