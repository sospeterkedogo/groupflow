'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { logActivity } from '@/utils/logging'
import { Palette, ThemeContextType } from '@/types/ui'

export const PALETTES: Palette[] = [
  {
    name: 'Google Light',
    colors: {
      '--bg-main': '#f8fafc',
      '--bg-sub': '#ffffff',
      '--text-main': '#1f2937',
      '--text-sub': '#6b7280',
      '--brand': '#1a73e8',
      '--brand-hover': '#174ea6',
      '--accent': '#4285f4',
      '--border': '#dadce0',
      '--surface': '#ffffff',
      '--error': '#d93025',
      '--success': '#1e8e3e',
      '--warning': '#f9ab00',
      '--overlay': 'rgba(60, 64, 67, 0.3)',
    }
  },
  {
    name: 'Deep Oceanic',
    colors: {
      '--bg-main': '#0f172a',
      '--bg-sub': '#1e293b',
      '--text-main': '#f8fafc',
      '--text-sub': '#94a3b8',
      '--brand': '#38bdf8',
      '--brand-hover': '#0ea5e9',
      '--accent': '#818cf8',
      '--border': '#334155',
      '--surface': '#1e293b',
      '--error': '#ef4444',
      '--success': '#10b981',
      '--warning': '#f59e0b',
      '--overlay': 'rgba(0, 0, 0, 0.5)',
    }
  },
  {
    name: 'Cyberpunk',
    colors: {
      '--bg-main': '#050510',
      '--bg-sub': '#0a0a20',
      '--text-main': '#00ffcc',
      '--text-sub': '#b0b0d0',
      '--brand': '#e900ff',
      '--brand-hover': '#ff00aa',
      '--accent': '#00ffcc',
      '--border': '#300060',
      '--surface': '#101025',
      '--error': '#ff3030',
      '--success': '#30ff30',
      '--warning': '#ffcc00',
      '--overlay': 'rgba(10, 0, 30, 0.7)',
    }
  }
]

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}

export const ThemeProvider = ({ children, initialTheme }: { children: React.ReactNode, initialTheme?: any }) => {
  // Use initialTheme for initial state to prevent flash during hydration
  const [currentPalette, setCurrentPalette] = useState<Palette>(() => {
    if (initialTheme?.palette) {
      return PALETTES.find(p => p.name === initialTheme.palette) || PALETTES[0]
    }
    // Fallback to localStorage if available (client-side only)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('groupflow_palette')
      if (saved) return PALETTES.find(p => p.name === saved) || PALETTES[0]
    }
    return PALETTES[0]
  })
  
  const [customBg, setCustomBg] = useState<string | null>(initialTheme?.bgUrl || null)
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    if (initialTheme?.palette) {
      const palette = PALETTES.find(p => p.name === initialTheme.palette)
      if (palette) setCurrentPalette(palette)
    }
    if (initialTheme?.bgUrl) setCustomBg(initialTheme?.bgUrl)
  }, [initialTheme])



  const setPalette = async (name: string) => {
    const palette = PALETTES.find(p => p.name === name)
    if (palette) {
      setCurrentPalette(palette)
      localStorage.setItem('groupflow_palette', name) // Local persistence for instant load
      const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('profiles').update({ 
            theme_config: { palette: name } 
          }).eq('id', user.id)

          // Verifiable Logging
          const { data: profile } = await supabase.from('profiles').select('group_id').eq('id', user.id).single()
          logActivity(user.id, profile?.group_id, 'theme_changed', `Changed palette to ${name}`)
        }
    }
  }

  const handleSetCustomBg = async (url: string | null) => {
    setCustomBg(url)
    if (url) localStorage.setItem('groupflow_bg', url)
    else localStorage.removeItem('groupflow_bg')
    
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ 
        custom_bg_url: url 
      }).eq('id', user.id)
    }
  }

  const activeColors = currentPalette.colors

  return (
    <ThemeContext.Provider value={{ currentPalette, setPalette, customBg, setCustomBg: handleSetCustomBg }}>
      {/* 
          Injected style tag ensures variables are present BEFORE hydration finishes, 
          eliminating the theme flash (FOUC) entirely.
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          ${Object.entries(activeColors).map(([key, val]) => `${key}: ${val};`).join('\n')}
        }
      `}} />
      
      <div 
        className={`theme-wrapper ${customBg ? 'has-custom-bg' : ''}`}
        style={customBg ? { 
          backgroundImage: `url(${customBg})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          backgroundAttachment: 'fixed',
          minHeight: '100vh' 
        } : {}}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}
