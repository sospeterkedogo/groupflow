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
            <Sparkles size={18} /> PRE-REGISTRATION OPEN
          </div>
          <h1 style={{ fontSize: '3rem', lineHeight: 1.05, fontWeight: 900 }}>Secure early access to GroupFlow Pro or Premium</h1>
          <p style={{ maxWidth: '680px', color: 'rgba(255,255,255,0.75)', fontSize: '1rem', fontWeight: 500 }}>Reserve your place before launch with Stripe checkout. Choose a low-cost monthly Pro subscription or a one-time Premium access pass for a full feature preview.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1.5rem' }}>
          <div style={{ padding: '1.75rem', borderRadius: '28px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>Pro</h2>
                <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.7)' }}>Ideal for early collaborators who want recurring upgrade access.</p>
              </div>
              <Shield size={32} color="var(--brand)" />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                <span style={{ fontSize: '2.75rem', fontWeight: 900 }}>£0.99</span>
                <span style={{ color: 'rgba(255,255,255,0.7)', paddingBottom: '0.25rem' }}>/month</span>
              </div>
              <p style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>Subscription support, priority feedback, and early release privileges for student teams.</p>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem 1.25rem', borderRadius: '20px', fontSize: '1rem' }}
              onClick={() => handleCheckout('pro')}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === 'pro' ? 'Starting checkout…' : 'Pre-register Pro'}
            </button>
          </div>

          <div style={{ padding: '1.75rem', borderRadius: '28px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>Premium</h2>
                <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.7)' }}>Best for students who want the full experience with a one-time pre-registration.</p>
              </div>
              <Sparkles size={32} color="var(--brand)" />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                <span style={{ fontSize: '2.75rem', fontWeight: 900 }}>£49</span>
              </div>
              <p style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>One-time pre-registration for premium features, extended support, and launch access.</p>
            </div>
            <button
              className="btn btn-secondary"
              style={{ width: '100%', padding: '1rem 1.25rem', borderRadius: '20px', fontSize: '1rem' }}
              onClick={() => handleCheckout('premium')}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === 'premium' ? 'Starting checkout…' : 'Pre-register Premium'}
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
