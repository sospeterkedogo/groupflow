'use client'

import { useState, useEffect } from 'react'
import { Shield, Sparkles, CheckCircle2, Check, ArrowRight, Loader2, Key } from 'lucide-react'
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
  const [lifetimeSeatsUsed, setLifetimeSeatsUsed] = useState<number | null>(null)
  const [proCount, setProCount] = useState<number | null>(null)
  const [coupon, setCoupon] = useState('')
  const [discountActive, setDiscountActive] = useState(false)
  const [validatingCoupon, setValidatingCoupon] = useState(false)

  const context = useContext(ProfileContext)
  const profile = context?.profile
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    const fetchCounts = async () => {
      const { count: lifetimeCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_plan', 'lifetime')
      
      const { count: proTotal } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_plan', 'pro')

      setLifetimeSeatsUsed(lifetimeCount || 0)
      setProCount(proTotal || 0)
    }
    fetchCounts()
  }, [supabase])

  const handleApplyCoupon = () => {
    if (!coupon) return
    setValidatingCoupon(true)
    
    // Simulate high-performance validation logic
    setTimeout(() => {
      if (coupon.toUpperCase() === 'ELITE30') {
        setDiscountActive(true)
        setError(null)
      } else {
        setError('Hmm, that code didn\'t work. Please check it and try again.')
        setDiscountActive(false)
      }
      setValidatingCoupon(false)
    }, 600)
  }

  const handleCheckout = async (plan: 'pro' | 'premium' | 'lifetime') => {
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
      const promoParam = discountActive ? `&prefilled_promo_code=${coupon}` : ''

      // 2. Direct Stripe Links for instant availability (Always Online)
      if (plan === 'pro') {
        window.location.href = `https://buy.stripe.com/5kQcN5clSbLa5CU0f67wA04?client_reference_id=${userId}${promoParam}`
        return
      }

      if (plan === 'premium') {
        window.location.href = `https://buy.stripe.com/00wcN55Xu16w4yQe5W7wA06?client_reference_id=${userId}${promoParam}`
        return
      }

      if (plan === 'lifetime') {
        // Updated Real Stripe Lifetime Link
        window.location.href = `https://buy.stripe.com/8x2aEXdpWbLa1mEge47wA05?client_reference_id=${userId}${promoParam}`
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
            <Sparkles size={18} /> Choose your plan
          </div>
          <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1, fontWeight: 950, letterSpacing: '-0.05em', color: 'white', margin: 0 }}>
            Find the right level for your <span style={{ color: 'var(--brand)' }}>Team Space</span>
          </h2>
          <p style={{ 
            maxWidth: '720px', 
            margin: isLanding ? '0 auto' : '0',
            color: 'rgba(255,255,255,0.6)', 
            fontSize: '1.2rem', 
            fontWeight: 500, 
            lineHeight: 1.5 
          }}>
            Pick the access level you need for your group projects. All plans include everything you need to start working together.
          </p>
        </div>
      )}

      {/* ── COUPON HUB (NEW) ────────────────────────────────────────── */}
      <div style={{ 
        padding: '1.5rem 2rem', 
        background: 'rgba(255,255,255,0.02)', 
        borderRadius: '24px', 
        border: '1px solid var(--border)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        gap: '1.5rem',
        maxWidth: '800px',
        margin: isLanding ? '0 auto' : '0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: discountActive ? 'var(--brand)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: discountActive ? 'black' : 'rgba(255,255,255,0.4)', transition: '0.3s' }}>
            <Key size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 950, fontSize: '0.9rem', color: discountActive ? 'var(--success)' : 'white' }}>
              {discountActive ? '30% STUDENT DISCOUNT ACTIVE' : 'Enter your promo code'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
              {discountActive ? 'Your discount is applied and ready to use.' : 'Have a special code? Enter it here to save on Pro.'}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, maxWidth: '300px' }}>
          <input 
            type="text" 
            placeholder="ELITE30"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            disabled={discountActive}
            style={{ 
              flex: 1, 
              padding: '0.75rem 1rem', 
              background: 'rgba(0,0,0,0.3)', 
              border: '1px solid var(--border)', 
              borderRadius: '12px', 
              color: 'white', 
              fontSize: '0.85rem', 
              fontWeight: 800,
              outline: 'none',
              textTransform: 'uppercase'
            }}
          />
          <button 
            onClick={handleApplyCoupon}
            disabled={discountActive || validatingCoupon || !coupon}
            className="btn btn-primary"
            style={{ 
              width: 'auto', 
              padding: '0.75rem 1.25rem', 
              borderRadius: '12px', 
              fontWeight: 950, 
              fontSize: '0.8rem',
              background: discountActive ? 'var(--success)' : 'var(--brand)',
              color: 'black'
            }}
          >
            {validatingCoupon ? <Loader2 className="animate-spin" size={16} /> : discountActive ? 'APPLIED' : 'APPLY'}
          </button>
        </div>
      </div>

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
                  'Standard Team Features',
                  'Basic AI Project Help'
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
            Included for Everyone
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
                 <p style={{ margin: 0, color: 'var(--brand)', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>Advanced Team Features</p>
              </div>
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                {discountActive ? (
                  <>
                    <span style={{ fontSize: '4rem', fontWeight: 950, color: 'white', letterSpacing: '-0.04em' }}>£3.49</span>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '1.5rem', textDecoration: 'line-through' }}>£4.99</span>
                  </>
                ) : (
                  <span style={{ fontSize: '4rem', fontWeight: 950, color: 'white', letterSpacing: '-0.04em' }}>£4.99</span>
                )}
                <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '0.9rem' }}>/mo</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '2rem', fontWeight: 500 }}>
                Unlock the full potential of your team with smart project tips, unlimited groups, and more ways to make your workspace yours.
              </p>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  'Smart AI Project Tips',
                  'Unlimited Team Groups',
                  'Customized Workspace Styles',
                  'Automatic Activity Saving',
                  'Private & Secure Team Rooms'
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
            {loadingPlan === 'pro' ? 'CONNECTING...' : `Join other ${proCount !== null ? proCount : '#'} members today`}
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
                 <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>Full Student Access</p>
              </div>
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                {discountActive ? (
                  <>
                    <span style={{ fontSize: '4rem', fontWeight: 950, color: 'white', letterSpacing: '-0.04em' }}>£10.49</span>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '1.5rem', textDecoration: 'line-through' }}>£14.99</span>
                  </>
                ) : (
                  <span style={{ fontSize: '4rem', fontWeight: 950, color: 'white', letterSpacing: '-0.04em' }}>£14.99</span>
                )}
                <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '0.9rem' }}>/mo</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '2rem', fontWeight: 500 }}>
                The best way for serious teams to succeed. Includes lifetime access options, special profile badges, and priority support for your projects.
              </p>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  'Large Team Project Hubs',
                  'Early Access to New Features',
                  'Advanced Data Tools',
                  'Priority Support',
                  'Personalized Success Strategy'
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
            {loadingPlan === 'premium' ? 'LOADING...' : 'Get Premium'}
          </button>
        </div>
        
        {/* LIFETIME TIER (NEW) */}
        <div style={{ 
          padding: '3.5rem 2.5rem', 
          borderRadius: '40px', 
          background: 'linear-gradient(135deg, rgba(20, 185, 129, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)', 
          border: '2px solid transparent', 
          backgroundImage: 'linear-gradient(var(--bg-main), var(--bg-main)), linear-gradient(135deg, #10b981 0%, #6366f1 100%)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          backdropFilter: 'blur(30px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
        }} className="premium-pricing-card popular-tier">
          <div style={{ position: 'absolute', top: '24px', right: '24px', padding: '6px 16px', background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)', color: 'white', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 950, letterSpacing: '1px' }}>LIFETIME ACCESS</div>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Sparkles size={28} />
              </div>
              <div style={{ textAlign: 'right' }}>
                 <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 950, color: 'white' }}>Lifetime Researcher</h2>
                 <p style={{ margin: 0, color: 'var(--brand)', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>Permanent Lifetime Access</p>
              </div>
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                {discountActive ? (
                  <>
                    <span style={{ fontSize: '4rem', fontWeight: 950, color: 'white', letterSpacing: '-0.04em' }}>£69.30</span>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '1.5rem', textDecoration: 'line-through' }}>£99</span>
                  </>
                ) : (
                  <span style={{ fontSize: '4rem', fontWeight: 950, color: 'white', letterSpacing: '-0.04em' }}>£99</span>
                )}
                <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '0.9rem' }}>/once</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '2rem', fontWeight: 700 }}>
                The ultimate choice. Reserved for our first 100 founding members. No monthly fees ever. All future updates and features included for life.
              </p>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  'Lifetime Feature Access',
                  'Early Beta Access',
                  'Priority Update Stream',
                  'Official "Founder" Profile Badge',
                  'All Premium Tier Benefits Included'
                ].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,1)', fontWeight: 800 }}>
                    <CheckCircle2 size={16} style={{ color: '#6366f1', flexShrink: 0, marginTop: '3px' }} />
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
              background: (lifetimeSeatsUsed !== null && lifetimeSeatsUsed >= 100) ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)', 
              color: (lifetimeSeatsUsed !== null && lifetimeSeatsUsed >= 100) ? 'rgba(255,255,255,0.2)' : 'white',
              border: (lifetimeSeatsUsed !== null && lifetimeSeatsUsed >= 100) ? '1px solid rgba(255,255,255,0.1)' : 'none', 
              boxShadow: (lifetimeSeatsUsed !== null && lifetimeSeatsUsed >= 100) ? 'none' : '0 10px 30px rgba(99, 102, 241, 0.3)',
              cursor: (lifetimeSeatsUsed !== null && lifetimeSeatsUsed >= 100) ? 'not-allowed' : 'pointer'
            }}
            onClick={() => lifetimeSeatsUsed !== null && lifetimeSeatsUsed < 100 && handleCheckout('lifetime')}
            disabled={loadingPlan !== null || (lifetimeSeatsUsed !== null && lifetimeSeatsUsed >= 100)}
          >
            {loadingPlan === 'lifetime' ? 'CONNECTING...' : (lifetimeSeatsUsed !== null && lifetimeSeatsUsed >= 100) ? 'OFFER EXPIRED (Sold Out)' : 'Secure Lifetime Access'}
          </button>

          {/* SCARCITY INDICATOR (NEW) */}
          {lifetimeSeatsUsed !== null && (
            <div style={{ marginTop: '1.5rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <span style={{ color: lifetimeSeatsUsed >= 90 ? '#ef4444' : 'var(--brand)' }}>
                    {lifetimeSeatsUsed >= 100 ? 'Mission Accomplished' : `Only ${100 - lifetimeSeatsUsed} Seats Left`}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{lifetimeSeatsUsed}/100</span>
               </div>
               <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${Math.min(lifetimeSeatsUsed, 100)}%`, 
                    background: lifetimeSeatsUsed >= 90 ? '#ef4444' : 'linear-gradient(90deg, #10b981, #6366f1)',
                    borderRadius: '100px',
                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                  }} />
               </div>
            </div>
          )}
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
        <span>Safe checkout with Stripe. You\'ll get a receipt immediately after joining.</span>
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
