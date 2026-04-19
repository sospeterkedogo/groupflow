'use client'

import { useEffect } from 'react'

export default function PWARegistry() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Elite Protocol SW registered:', registration.scope)
          })
          .catch((err) => {
            console.error('Elite Protocol SW registration failed:', err)
          })
      })
    }
  }, [])

  return null
}
