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
        window.location.href = `https://buy.stripe.com/5kQcN5clSbLa5CU0f67wA04?client_reference_id=${userId}`
        return
      }

      if (plan === 'premium') {
        window.location.href = `https://buy.stripe.com/00wcN55Xu16w4yQe5W7wA06?client_reference_id=${userId}`
        return
      }
    } catch (err: any) {
      setError(err.message || 'Checkout initiation failed.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '4rem' }}>
      
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
            <Sparkles size={18} /> INSTITUTIONAL AUTHORIZATION
          </div>
          <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1, fontWeight: 950, letterSpacing: '-0.05em', color: 'white', margin: 0 }}>
            Authorize your <span style={{ color: 'var(--brand)' }}>Academic Node</span>
          </h2>
          <p style={{ 
            maxWidth: '720px', 
            margin: isLanding ? '0 auto' : '0',
            color: 'rgba(255,255,255,0.6)', 
            fontSize: '1.2rem', 
            fontWeight: 500, 
            lineHeight: 1.5 
          }}>
            Select the clearance level required for your research objectives. All tiers include core peer-networking protocols.
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* STANDARD TIER */}
        <div style={{ 
          padding: '3.5rem 2.5rem', 
          borderRadius: '40px', 
          background: 'rgba(255,255,255,0.01)', 
          border: '1px solid rgba(255,255,255,0.05)', 
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative'
        }} className="premium-pricing-card">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <ArrowRight size={28} />
              </div>
              <div style={{ textAlign: 'right' }}>
                 <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 950, color: 'white' }}>Standard</h2>
                 <p style={{ margin: 0, color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>Basic Access</p>
              </div>
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '2.5rem' }}>
                <span style={{ fontSize: '4rem', fontWeight: 950, color: 'white', letterSpacing: '-0.04em' }}>£0</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '0.9rem' }}>/mo</span>
              </div>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {[
                  'Unified Task Management',
                  '1 Active Collaborative Project',
                  'Public Peer-Networking Protocol',
                  'Standard AI Synthesis Engine'
                ].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                    <CheckCircle2 size={16} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0, marginTop: '3px' }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <button
            className="btn btn-secondary"
            style={{ 
              width: '100%', 
              padding: '1.25rem', 
              borderRadius: '24px', 
              fontSize: '0.95rem', 
              fontWeight: 950, 
              background: 'rgba(255,255,255,0.03)', 
              color: 'white',
              border: '1px solid rgba(255,255,255,0.1)', 
              cursor: 'pointer'
            }}
            disabled
          >
            Authorized by Default
          </button>
        </div>

        {/* PRO TIER */}
        <div style={{ 
          padding: '3.5rem 2.5rem', 
          borderRadius: '40px', 
          background: 'rgba(var(--brand-rgb), 0.02)', 
          border: '2px solid var(--brand)', 
          backdropFilter: 'blur(30px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
        }} className="premium-pricing-card popular-tier">
          <div style={{ position: 'absolute', top: '24px', right: '24px', padding: '6px 12px', background: 'var(--brand)', color: '#0a0a0a', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 950, letterSpacing: '1px' }}>RECOMMENDED</div>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--brand)', color: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Shield size={28} />
              </div>
              <div style={{ textAlign: 'right' }}>
                 <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 950, color: 'white' }}>Pro Scholar</h2>
                 <p style={{ margin: 0, color: 'var(--brand)', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>Advanced Institutional Analytics</p>
              </div>
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '2.5rem' }}>
                <span style={{ fontSize: '4rem', fontWeight: 950, color: 'white', letterSpacing: '-0.04em' }}>£4.99</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '0.9rem' }}>/mo</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '2rem', fontWeight: 500 }}>
                Unlock the full technical potential of your research team with priority AI feedback, unlimited multi-project Hubs, and deep visual customization for your academic environment.
              </p>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  'Priority AI Feedback Protocols',
                  'Unlimited Multi-Project Groups',
                  'Deep Visual Customization Engine',
                  'Verified Historical Archiving',
                  'Private SSL Shielded Rooms'
                ].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--brand)', flexShrink: 0, marginTop: '3px' }} />
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
              borderRadius: '24px', 
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
            {loadingPlan === 'pro' ? 'SYNCING...' : 'Elevate to Pro'}
          </button>
        </div>

        {/* PREMIUM TIER */}
        <div style={{ 
          padding: '3.5rem 2.5rem', 
          borderRadius: '40px', 
          background: 'rgba(255,255,255,0.02)', 
          border: '1px solid rgba(255,255,255,0.08)', 
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative'
        }} className="premium-pricing-card">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--brand) 0%, #6366f1 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Sparkles size={28} />
              </div>
              <div style={{ textAlign: 'right' }}>
                 <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 950, color: 'white' }}>Premium</h2>
                 <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>Institutional Partner Access</p>
              </div>
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '2.5rem' }}>
                <span style={{ fontSize: '4rem', fontWeight: 950, color: 'white', letterSpacing: '-0.04em' }}>£14.99</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '0.9rem' }}>/mo</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '2rem', fontWeight: 500 }}>
                The definitive mandate for academic excellence. Includes lifetime authorization protocols, elite scholar markers, researcher API clearing, and dedicated strategy session support.
              </p>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  'Institutional Multi-Project Hubs',
                  'Early Access Review Lab',
                  'Researcher API Clearing',
                  'Dedicated Protocol Support',
                  'Strategy Synthesis Session'
                ].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                    <Check size={18} style={{ color: '#6366f1', flexShrink: 0, marginTop: '2px' }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <button
            className="btn btn-secondary"
            style={{ 
              width: '100%', 
              padding: '1.25rem', 
              borderRadius: '24px', 
              fontSize: '1rem', 
              fontWeight: 950, 
              background: 'white', 
              color: '#0a0a0a', 
              border: 'none', 
              cursor: 'pointer'
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
        marginTop: '1rem', 
        padding: '1.5rem 2rem', 
        background: 'rgba(255,255,255,0.02)', 
        borderRadius: '24px', 
        border: '1px solid rgba(255,255,255,0.05)', 
        color: 'rgba(255,255,255,0.4)', 
        fontSize: '0.85rem', 
        fontWeight: 600,
        justifyContent: isLanding ? 'center' : 'flex-start'
      }}>
        <ArrowRight size={18} style={{ color: 'var(--brand)' }} />
        <span>Secure checkout powered by Stripe. Authorization includes instant receipt generation.</span>
      </div>

      <style jsx>{`
        .premium-pricing-card:hover {
          transform: translateY(-8px);
          border-color: rgba(var(--brand-rgb), 0.2) !important;
          background: rgba(255,255,255,0.03) !important;
        }
        .popular-tier:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 40px 80px rgba(0,0,0,0.6) !important;
        }
      `}</style>
    </div>

  )
}
