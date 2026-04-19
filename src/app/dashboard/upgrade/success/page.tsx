'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, FileText, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Premium celebration effect
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(180deg, #0a0c1a 0%, #050505 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ 
          maxWidth: '560px',
          width: '100%',
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '48px',
          padding: '4rem 3rem',
          textAlign: 'center',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8)'
        }}
      >
        <div style={{ 
          width: '100px', 
          height: '100px', 
          background: 'rgba(16, 185, 129, 0.1)', 
          borderRadius: '32px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 2.5rem',
          color: 'var(--brand)',
          boxShadow: '0 0 40px rgba(16, 185, 129, 0.2)'
        }}>
          <ShieldCheck size={48} />
        </div>

        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
        >
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontSize: '0.75rem', 
            fontWeight: 950, 
            color: 'var(--brand)', 
            textTransform: 'uppercase', 
            letterSpacing: '2px',
            marginBottom: '1rem' 
          }}>
            <Sparkles size={14} /> Transaction Verified
          </div>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 950, 
            color: 'white', 
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            marginBottom: '1rem'
          }}>
            Institutional Clearance <br />
            <span style={{ color: 'var(--brand)' }}>Authorized.</span>
          </h1>
          <p style={{ 
            color: 'rgba(255,255,255,0.5)', 
            fontSize: '1.1rem', 
            fontWeight: 500, 
            lineHeight: 1.5,
            marginBottom: '3rem'
          }}>
            Your protocol authorization is now active across all academic nodes. The registry has been updated with your new scholar credentials.
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link href="/dashboard" style={{ 
            background: 'var(--brand)', 
            color: '#0a0a0a', 
            textDecoration: 'none', 
            padding: '1.25rem', 
            borderRadius: '20px', 
            fontWeight: 950, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.75rem',
            boxShadow: '0 10px 30px rgba(var(--brand-rgb), 0.2)'
          }}>
            Go to Dashboard <ArrowRight size={20} />
          </Link>
          
          <button 
            onClick={() => router.push('/dashboard/invoice')}
            style={{ 
              background: 'rgba(255,255,255,0.03)', 
              color: 'white', 
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '1.25rem', 
              borderRadius: '20px', 
              fontWeight: 900, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.75rem',
              cursor: 'pointer'
            }}
          >
            <FileText size={18} /> Retrieve Official Invoice
          </button>
        </div>

        <div style={{ 
          marginTop: '3rem', 
          paddingTop: '2rem', 
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '0.8rem',
          fontWeight: 600
        }}>
          <span style={{ width: '6px', height: '6px', background: 'var(--brand)', borderRadius: '50%' }} />
          Status: Synchronized via Stripe Global Network
        </div>
      </motion.div>
    </div>
  )
}
