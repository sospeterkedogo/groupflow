'use client'

import { useState } from 'react'
import { Shield, Sparkles, CheckCircle2, Check, ArrowRight } from 'lucide-react'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'
import { ProfileContext } from '@/context/ProfileContext'
import { useContext } from 'react'
import TransientError from '@/components/TransientError'

interface PricingSectionProps {
  showTitle?: boolean
  isLanding?: boolean
}

export default function PricingSection({ showTitle = true, isLanding = false }: PricingSectionProps) {
  const [error, setError] = useState<string | null>(null)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const context = useContext(ProfileContext)
  const profile = context?.profile
  const supabase = createBrowserSupabaseClient()

  const handleCheckout = async (plan: 'pro' | 'premium') => {
    setError(null)
    setLoadingPlan(plan)

    try {
      // 1. Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Redirect to login if on landing page and not authenticated
        window.location.href = `/login?redirect=/dashboard/upgrade&plan=${plan}`
        return
      }

      const userId = user.id

      // 2. Direct Stripe Links for instant availability (Always Online)
      if (plan === 'pro') {
        window.location.href = `https://buy.stripe.com/6oU7sLdpWcPee9q0f67wA03?client_reference_id=${userId}`
        return
      }

      if (plan === 'premium') {
        window.location.href = `https://buy.stripe.com/aFa14nbhO02s8P68LC7wA02?client_reference_id=${userId}`
        return
      }
    } catch (err: any) {
      setError(err.message || 'Checkout initiation failed.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      
      {showTitle && (
        <div style={{ color: 'white', display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: isLanding ? 'center' : 'left' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: isLanding ? 'center' : 'flex-start',
            gap: '0.75rem', 
            fontSize: '0.85rem', 
            color: 'var(--brand)', 
            fontWeight: 900, 
            textTransform: 'uppercase', 
            letterSpacing: '2px' 
          }}>
            <Sparkles size={18} /> Professional Infrastructure
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1, fontWeight: 950, letterSpacing: '-0.04em', color: 'white', margin: 0 }}>
            Elevate your <span style={{ color: 'var(--brand)' }}>academic output</span>
          </h2>
          <p style={{ 
            maxWidth: '680px', 
            margin: isLanding ? '0 auto' : '0',
            color: 'rgba(255,255,255,0.7)', 
            fontSize: '1.1rem', 
            fontWeight: 500, 
            lineHeight: 1.6 
          }}>
            Choose the tier that matches your research ambitions. All plans include core synchronization protocols.
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* PRO CARD */}
        <div style={{ 
          padding: '3rem 2.5rem', 
          borderRadius: '40px', 
          background: 'rgba(255,255,255,0.02)', 
          border: '1px solid rgba(255,255,255,0.08)', 
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'all 0.3s ease',
          position: 'relative'
        }} className="hover-lift">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(var(--brand-rgb), 0.1)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Shield size={32} />
              </div>
              <div style={{ textAlign: 'right' }}>
                 <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 950, color: 'white' }}>Pro</h2>
                 <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 800 }}>SCHOLAR TIER</p>
              </div>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '2rem' }}>
                <span style={{ fontSize: '4.5rem', fontWeight: 950, color: 'white', letterSpacing: '-0.03em' }}>£2.99</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 800, fontSize: '1rem' }}>/mo</span>
              </div>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  'Priority Feedback for project help',
                  'Advanced Team Analytics & Insights',
                  'Group Theme & Brand Customization',
                  'Unlimited Historical Task Records'
                ].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--brand)', flexShrink: 0, marginTop: '2px' }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <button
            className="btn btn-primary"
            style={{ 
              width: '100%', 
              padding: '1.25rem', 
              borderRadius: '20px', 
              fontSize: '1rem', 
              fontWeight: 950, 
              background: 'var(--brand)', 
              color: '#0a0a0a',
              border: 'none', 
              boxShadow: '0 10px 30px rgba(var(--brand-rgb), 0.3)',
              cursor: 'pointer'
            }}
            onClick={() => handleCheckout('pro')}
            disabled={loadingPlan !== null}
          >
            {loadingPlan === 'pro' ? 'SYNCING...' : 'Upgrade to Pro'}
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
          boxShadow: '0 32px 64px rgba(0,0,0,0.5)'
        }} className="hover-lift">
          <div style={{ position: 'absolute', top: '24px', right: '24px', padding: '6px 14px', background: 'var(--brand)', color: 'white', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 950, letterSpacing: '1px' }}>LIFETIME ACCESS</div>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'var(--brand)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Sparkles size={32} />
              </div>
              <div style={{ textAlign: 'left' }}>
                 <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 950, color: 'white' }}>Premium</h2>
                 <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 800 }}>INSTITUTIONAL PARTNER</p>
              </div>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '2rem' }}>
                <span style={{ fontSize: '4.5rem', fontWeight: 950, color: 'white', letterSpacing: '-0.03em' }}>£99</span>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 800, fontSize: '1rem' }}>Lifetime</span>
              </div>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  'Everything in Pro, forever',
                  'School-wide Integration Support',
                  'Multi-Project Enterprise Hub',
                  'Dedicated 1-on-1 Setup Session',
                  'Early Review Lab Access'
                ].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', fontSize: '0.95rem', color: 'white', fontWeight: 700 }}>
                    <div style={{ padding: '2px', background: 'var(--brand)', borderRadius: '50%', color: 'white', flexShrink: 0 }}>
                       <Check size={12} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button
            className="btn"
            style={{ 
              width: '100%', 
              padding: '1.25rem', 
              borderRadius: '20px', 
              fontSize: '1rem', 
              fontWeight: 950, 
              background: 'white', 
              color: '#0a0a0a', 
              border: 'none', 
              cursor: 'pointer',
              transition: 'transform 0.2s ease' 
            }}
            onClick={() => handleCheckout('premium')}
            disabled={loadingPlan !== null}
          >
            {loadingPlan === 'premium' ? 'INITIALIZING...' : 'Acquire Premium'}
          </button>
        </div>

      </div>

      {error && (
        <TransientError message={error} type="error" />
      )}

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem', 
        marginTop: '2rem', 
        padding: '1.25rem', 
        background: 'rgba(255,255,255,0.03)', 
        borderRadius: '20px', 
        border: '1px solid rgba(255,255,255,0.08)', 
        color: 'rgba(255,255,255,0.5)', 
        fontSize: '0.85rem', 
        fontWeight: 600,
        justifyContent: isLanding ? 'center' : 'flex-start'
      }}>
        <ArrowRight size={18} style={{ color: 'var(--brand)' }} />
        <span>Secure checkout powered by Stripe. Supports Apple Pay, Google Pay, and global credit networks.</span>
      </div>

      <style jsx>{`
        .hover-lift:hover {
          transform: translateY(-8px);
          border-color: rgba(var(--brand-rgb), 0.3) !important;
          background: rgba(255,255,255,0.04) !important;
        }
      `}</style>
    </div>
  )
}
