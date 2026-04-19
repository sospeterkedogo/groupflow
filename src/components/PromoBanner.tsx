'use client'

import { useState, useEffect } from 'react'
import { Sparkles, X, ArrowRight, Zap } from 'lucide-react'

export default function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const dismissed = localStorage.getItem('gf_promo_dismissed_aug_2026')
    if (dismissed) setIsVisible(false)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('gf_promo_dismissed_aug_2026', 'true')
  }

  if (!isClient || !isVisible) return null

  // August 31, 2026 expiry check
  const expiryDate = new Date('2026-09-01')
  if (new Date() > expiryDate) return null

  return (
    <div className="promo-banner-container" style={{
      position: 'relative',
      zIndex: 20000,
      background: 'linear-gradient(90deg, #10b981 0%, #6366f1 50%, #10b981 100%)',
      backgroundSize: '200% auto',
      animation: 'gradientFlow 5s linear infinite',
      color: 'white',
      padding: '0.6rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      overflow: 'hidden'
    }}>
      <div className="promo-shimmer" />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 950, fontSize: '0.8rem', letterSpacing: '0.05em' }}>
        <Zap size={16} fill="white" className="animate-pulse" />
        <span style={{ textTransform: 'uppercase' }}>Protocol Upgrade Sale</span>
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        fontSize: '0.9rem', 
        fontWeight: 800,
        color: 'rgba(255,255,255,0.95)'
      }}>
        30% OFF ALL CLEARANCE TIERS — USE CODE: <span style={{ 
          background: 'rgba(255,255,255,0.2)', 
          padding: '2px 8px', 
          borderRadius: '4px', 
          fontFamily: 'monospace',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>ELITE30</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase' }}>
          Ends August 31st
        </div>
        <button 
          onClick={handleDismiss}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'white', 
            cursor: 'pointer',
            padding: '4px',
            opacity: 0.6,
            transition: '0.2s hover'
          }}
          className="hover:opacity-100"
        >
          <X size={16} />
        </button>
      </div>

      <style jsx>{`
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .promo-shimmer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: translateX(-100%);
          animation: shimmer 3s infinite;
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @media (max-width: 768px) {
          .promo-banner-container { gap: 0.75rem; flex-direction: column; text-align: center; }
        }
      `}</style>
    </div>
  )
}
