'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Sparkles, ArrowRight } from 'lucide-react'
import TransientError from '@/components/TransientError'

export default function UpgradePage() {
  const [error, setError] = useState<string | null>(null)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleCheckout = async (plan: 'pro' | 'premium') => {
    setError(null)
    setSuccessMessage(null)
    setLoadingPlan(plan)

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
    <div style={{ minHeight: '100vh', padding: '3rem 1.5rem', display: 'flex', justifyContent: 'center', background: 'linear-gradient(180deg, rgba(10,12,34,1) 0%, rgba(20,25,58,1) 100%)' }}>
      <div style={{ width: '100%', maxWidth: '960px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ color: 'white', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--brand)' }}>
            <Sparkles size={18} /> THE MISSION IS GROWING
          </div>
          <h1 style={{ fontSize: '3rem', lineHeight: 1.05, fontWeight: 900 }}>Support this project to reach more schools</h1>
          <p style={{ maxWidth: '680px', color: 'rgba(255,255,255,0.75)', fontSize: '1.1rem', fontWeight: 500 }}>This is my dissertation project and I am building it to solve a real problem for students. Help me bring it into schools everywhere by upgrading your account.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1.5rem' }}>
          <div style={{ padding: '2rem', borderRadius: '32px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900 }}>Pro</h2>
                <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Support the ongoing development.</p>
              </div>
              <Shield size={32} color="var(--brand)" />
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '3rem', fontWeight: 900 }}>£2.99</span>
                <span style={{ color: 'rgba(255,255,255,0.7)', paddingBottom: '0.4rem', fontWeight: 700 }}>/month</span>
              </div>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  'Priority Feedback for project help',
                  'Advanced Team Analytics & Insights',
                  'Group Theme & Brand Customization',
                  'Unlimited Historical Task Records'
                ].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '1.25rem', borderRadius: '20px', fontSize: '1.1rem', fontWeight: 800 }}
              onClick={() => handleCheckout('pro')}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === 'pro' ? 'Starting checkout…' : 'Support with Pro'}
            </button>
          </div>

          <div style={{ padding: '2rem', borderRadius: '32px', background: 'rgba(255,255,255,0.07)', border: '2px solid var(--brand)', boxShadow: '0 24px 80px rgba(0,0,0,0.3)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-15px', right: '20px', padding: '6px 14px', background: 'var(--brand)', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 900 }}>LIFETIME ACCESS</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900 }}>Premium</h2>
                <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>The ultimate mission partner experience.</p>
              </div>
              <Sparkles size={32} color="var(--brand)" />
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '3rem', fontWeight: 900 }}>£99</span>
                <span style={{ color: 'rgba(255,255,255,0.7)', paddingBottom: '0.4rem', fontWeight: 700 }}>Lifetime</span>
              </div>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  'Everything in Pro, forever',
                  'School-wide Integration Support',
                  'Multi-Dissertation Project Hub',
                  'Dedicated 1-on-1 Setup Session',
                  'Early Review Lab Access'
                ].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <button
              className="btn btn-secondary"
              style={{ width: '100%', padding: '1.25rem', borderRadius: '20px', fontSize: '1.1rem', fontWeight: 800, background: 'white', color: 'var(--brand)', border: 'none' }}
              onClick={() => handleCheckout('premium')}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === 'premium' ? 'Starting checkout…' : 'Become Premium Partner'}
            </button>
          </div>
        </div>

        {(error || successMessage) && (
          <TransientError message={error || successMessage || ''} type={successMessage ? 'success' : 'error'} />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', color: 'rgba(255,255,255,0.7)' }}>
          <ArrowRight size={18} />
          <span>Stripe checkout supports Apple Pay and Google Pay when available in your browser.</span>
        </div>
      </div>
    </div>
  )
}
