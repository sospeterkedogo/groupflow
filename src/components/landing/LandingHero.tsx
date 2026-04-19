'use client'

import Link from 'next/link'
import { Sparkles, Zap, ArrowRight } from 'lucide-react'
import UserCount from '@/components/UserCount'

export default function LandingHero() {
  return (
    <section 
      style={{ textAlign: 'center', padding: '0 2rem' }}
      className="hero-section-mobile"
    >
       <div style={{ 
         display: 'inline-flex', 
         alignItems: 'center', 
         gap: '0.6rem', 
         padding: '8px 20px', 
         background: 'rgba(16, 185, 129, 0.08)', 
         borderRadius: '6px', 
         color: '#10b981',
         fontSize: '0.7rem',
         fontWeight: 700,
         textTransform: 'uppercase',
         letterSpacing: '0.05em',
         marginBottom: '1.5rem',
         border: '1px solid rgba(16, 185, 129, 0.2)'
       }} className="hero-badge">
         <Sparkles size={14} /> Technical sync active
       </div>
       
       <h1 style={{ marginBottom: '1.5rem', color: '#f3f4f6', maxWidth: '1000px', margin: '0 auto 2rem', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.1 }} className="hero-title">
         Unified Academic <br />
         <span style={{ 
            background: 'linear-gradient(90deg, #10b981 0%, #f3f4f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>Collaboration Engine.</span>
       </h1>
       
       <p style={{ color: '#9ca3af', maxWidth: '750px', margin: '0 auto 4rem', fontWeight: 400, fontSize: '1.125rem', lineHeight: 1.6 }}>
          Professionalizing research output through real-time state persistence, verified contribution logging, and cross-departmental peer networking. 
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.25rem', color: '#10b981', fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.1em' }}>
            <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981', animation: 'pulse 1.5s infinite' }} />
            RECOGNITION FOR EVERY CONTRIBUTOR • LIVE ARCHIVE
          </span>
       </p>

       <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link 
            href="/login?signup=true&plan=pro" 
            style={{ 
              background: '#10b981', 
              color: '#0a0a0a', 
              textDecoration: 'none', 
              padding: '1.25rem 2.5rem', 
              fontSize: '1.125rem', 
              fontWeight: 900, 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              boxShadow: '0 10px 40px rgba(16, 185, 129, 0.25)',
              transform: 'scale(1.05)',
              transition: 'all 0.2s ease'
            }}
            className="hover-lift"
          >
            Try Pro Now <Zap size={20} fill="#0a0a0a" />
          </Link>
          <Link 
            href="/login?signup=true" 
            style={{ 
              background: 'rgba(255,255,255,0.03)', 
              color: '#f3f4f6', 
              textDecoration: 'none', 
              padding: '1.25rem 2.5rem', 
              fontSize: '1.125rem', 
              fontWeight: 650, 
              borderRadius: '12px', 
              border: '1px solid #222222',
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem'
            }}
          >
            Start free project <ArrowRight size={18} />
          </Link>
       </div>
    </section>
  )
}
