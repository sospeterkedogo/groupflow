'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Sparkles, ArrowRight, CheckCircle2, Check } from 'lucide-react'
import { useProfile } from '@/context/ProfileContext'
import TransientError from '@/components/TransientError'

export default function UpgradePage() {
  const [error, setError] = useState<string | null>(null)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { profile } = useProfile()
  const router = useRouter()

  const handleCheckout = async (plan: 'pro' | 'premium') => {
    setError(null)
    setSuccessMessage(null)
    setLoadingPlan(plan)

    if (plan === 'pro') {
      const userId = profile?.id || ''
      window.location.href = `https://buy.stripe.com/aFa14nbhO02s8P68LC7wA02?client_reference_id=${userId}`
      return
    }

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      })

      const result = await response.json()
      if (!response.ok || !result.url) {
        throw new Error(result?.error || 'Unable to start checkout.')
      }

      window.location.href = result.url
    } catch (err: any) {
      setError(err.message || 'Checkout initiation failed.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: 'var(--p-safe)', display: 'flex', justifyContent: 'center', background: 'linear-gradient(180deg, #0a0c22 0%, #14193a 100%)' }}>
      <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '3rem', paddingTop: '2rem' }}>
        
        <div style={{ color: 'white', display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--brand)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>
            <Sparkles size={18} /> THE MISSION IS GROWING
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1, fontWeight: 950, letterSpacing: '-0.04em', color: 'white', margin: 0 }}>
            Support this project to <span style={{ color: 'var(--brand)' }}>reach more schools</span>
          </h1>
          <p style={{ maxWidth: '680px', color: 'rgba(255,255,255,0.8)', fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 }}>
            I am building GroupFlow to solve real operational problems for student teams. Your upgrade directly funds infrastructure and new feature development.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          {/* PRO CARD */}
          <div style={{ 
            padding: '3rem 2.5rem', 
            borderRadius: '40px', 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid rgba(255,255,255,0.1)', 
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.3s ease'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(var(--brand-rgb), 0.1)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Shield size={32} />
                </div>
                <div style={{ textAlign: 'right' }}>
                   <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 950, color: 'white' }}>Pro</h2>
                   <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 700 }}>MONTHLY SUPPORT</p>
                </div>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '2rem' }}>
                  <span style={{ fontSize: '4rem', fontWeight: 950, color: 'white', letterSpacing: '-0.03em' }}>£2.99</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 800, fontSize: '1.1rem' }}>/mo</span>
                </div>
                <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {[
                    'Priority Feedback for project help',
                    'Advanced Team Analytics & Insights',
                    'Group Theme & Brand Customization',
                    'Unlimited Historical Task Records'
                  ].map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', fontSize: '1rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                      <CheckCircle2 size={20} className="text-brand" style={{ flexShrink: 0, marginTop: '2px' }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '1.25rem', borderRadius: '24px', fontSize: '1.1rem', fontWeight: 950, background: 'var(--brand)', border: 'none', boxShadow: '0 10px 30px rgba(var(--brand-rgb), 0.3)' }}
              onClick={() => handleCheckout('pro')}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === 'pro' ? 'SYNCING...' : 'Support with Pro'}
            </button>
          </div>

          {/* PREMIUM CARD */}
          <div style={{ 
            padding: '3rem 2.5rem', 
            borderRadius: '40px', 
            background: 'rgba(var(--brand-rgb), 0.05)', 
            border: '2px solid var(--brand)', 
            backdropFilter: 'blur(10px)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 32px 64px rgba(0,0,0,0.4)'
          }}>
            <div style={{ position: 'absolute', top: '24px', right: '24px', padding: '6px 14px', background: 'var(--brand)', color: 'white', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 950, letterSpacing: '1px' }}>LIFETIME ACCESS</div>
            
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'var(--brand)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Sparkles size={32} />
                </div>
                <div style={{ textAlign: 'left' }}>
                   <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 950, color: 'white' }}>Premium</h2>
                   <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 700 }}>PARTNER EDITION</p>
                </div>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '2rem' }}>
                  <span style={{ fontSize: '4rem', fontWeight: 950, color: 'white', letterSpacing: '-0.03em' }}>£99</span>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 800, fontSize: '1.1rem' }}>Lifetime</span>
                </div>
                <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {[
                    'Everything in Pro, forever',
                    'School-wide Integration Support',
                    'Multi-Project Enterprise Hub',
                    'Dedicated 1-on-1 Setup Session',
                    'Early Review Lab Access'
                  ].map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', fontSize: '1rem', color: 'white', fontWeight: 700 }}>
                      <div style={{ padding: '2px', background: 'var(--brand)', borderRadius: '50%', color: 'white', flexShrink: 0 }}>
                         <Check size={14} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              className="btn"
              style={{ width: '100%', padding: '1.25rem', borderRadius: '24px', fontSize: '1.1rem', fontWeight: 950, background: 'white', color: '#0a0c22', border: 'none', cursor: 'pointer', transition: 'transform 0.2s ease' }}
              onClick={() => handleCheckout('premium')}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === 'premium' ? 'INITIALIZING...' : 'Become Premium Partner'}
            </button>
          </div>

        </div>

        {(error || successMessage) && (
          <TransientError message={error || successMessage || ''} type={successMessage ? 'success' : 'error'} />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', fontWeight: 500 }}>
          <ArrowRight size={20} className="text-brand" />
          <span>Stripe secure checkout supports Apple Pay and Google Pay for instantaneous node upgrades.</span>
        </div>
      </div>
    </div>
  )
}
