'use client'

import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'

export default function TransientError({ message }: { message: string }) {
  const [visible, setVisible] = useState(!!message)

  useEffect(() => {
    if (!message) return

    setVisible(true) 
    
    // Auto-hide the error after 5 seconds
    const timer = setTimeout(() => {
      setVisible(false)
      
      // Clean the URL query parameters gracefully so it doesn't persist on page reload safely
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        if (url.searchParams.has('error')) {
          url.searchParams.delete('error')
          window.history.replaceState({}, document.title, url.toString())
        }
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [message])

  if (!visible || !message) return null

  return (
    <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', width: '100%', maxWidth: '800px', animation: 'fadeIn 0.3s ease-out' }}>
      <AlertCircle size={16} />
      <span>{message}</span>
    </div>
  )
}
