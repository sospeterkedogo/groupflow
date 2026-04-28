'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function LandingFooter() {
  return (
    <footer style={{ padding: '6rem 2rem', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', background: '#0a0a0a', position: 'relative', zIndex: 10 }}>
       <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.5rem', fontWeight: 700, justifyContent: 'center', marginBottom: '2rem', color: '#f3f4f6' }}>
<<<<<<< HEAD
          <span style={{ width: '42px', height: '42px', borderRadius: '10px', border: '1px solid rgba(212, 160, 23, 0.35)', background: 'linear-gradient(145deg, #070707 0%, #121212 100%)', boxShadow: '0 10px 28px rgba(212, 160, 23, 0.18)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <Image src="/brand-logo-black-gold.svg" width={28} height={28} alt="Espeezy brand logo" />
          </span>
          Espeezy
=======
          <img src="/brand-logo-black-gold.png" style={{ width: '38px', height: '38px', borderRadius: '8px' }} alt="Protocol" /> Espeezy
>>>>>>> b7c25bf03018b1f17814f973aa372a6b87a1eb82
       </div>
       <p style={{ color: '#f3f4f6', fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>Built by Sospeter • Project Lead</p>

       <p style={{ color: '#6b7280', fontSize: '0.875rem', maxWidth: '500px', margin: '0 auto 4rem', lineHeight: 1.6 }}>
          Unified collaboration architecture for global academic initiatives. Designed for researchers, scholars, and institutional teams.
       </p>
       
       <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', opacity: 0.6 }}>
          <Link href="/login" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500 }}>Sign in</Link>
          <Link href="/docs" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500 }}>Privacy Policy</Link>
          <Link href="/docs" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500 }}>Global Terms</Link>
       </div>
    </footer>
  )
}
