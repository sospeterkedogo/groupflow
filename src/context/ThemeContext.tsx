'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export type Palette = {
  name: string
  colors: {
    '--bg-main': string
    '--bg-sub': string
    '--text-main': string
    '--text-sub': string
    '--brand': string
    '--brand-hover': string
    '--accent': string
    '--border': string
    '--surface': string
    '--error': string
    '--success': string
    '--warning': string
    '--overlay': string
  }
}

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

type ThemeContextType = {
  currentPalette: Palette
  setPalette: (name: string) => void
  customBg: string | null
  setCustomBg: (url: string | null) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}

export const ThemeProvider = ({ children, initialTheme }: { children: React.ReactNode, initialTheme?: any }) => {
  const [currentPalette, setCurrentPalette] = useState<Palette>(PALETTES[0])
  const [customBg, setCustomBg] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (initialTheme) {
      const palette = PALETTES.find(p => p.name === initialTheme.palette)
      if (palette) setCurrentPalette(palette)
      if (initialTheme.bgUrl) setCustomBg(initialTheme.bgUrl)
    }
  }, [initialTheme])

  useEffect(() => {
    const root = document.documentElement
    Object.entries(currentPalette.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }, [currentPalette])

  const setPalette = async (name: string) => {
    const palette = PALETTES.find(p => p.name === name)
    if (palette) {
      setCurrentPalette(palette)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').update({ 
          theme_config: { palette: name } 
        }).eq('id', user.id)
      }
    }
  }

  const handleSetCustomBg = async (url: string | null) => {
    setCustomBg(url)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ 
        custom_bg_url: url 
      }).eq('id', user.id)
    }
  }

  return (
    <ThemeContext.Provider value={{ currentPalette, setPalette, customBg, setCustomBg: handleSetCustomBg }}>
      <div 
        className="theme-wrapper"
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
