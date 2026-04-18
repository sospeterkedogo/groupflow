"use client"

import { useMemo, useState } from 'react'
import { signup, login } from './actions'
import TransientError from '@/components/TransientError'
import { PrivacyPolicy, TermsOfService, CookiePolicy } from '@/components/Legal/Policies'
import { BookOpen, User, Lock, ExternalLink } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import { createBrowserSupabaseClient } from '@/utils/supabase/client'

function SubmitButton({ isSignUp, legalAccepted }: { isSignUp: boolean, legalAccepted: boolean }) {
  const { pending } = useFormStatus()

  return (
    <button
      className="btn btn-primary"
      style={{ width: '100%', height: '3.5rem', borderRadius: '16px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
      disabled={pending || (isSignUp && !legalAccepted)}
    >
      {pending ? (
        <>
          <div className="spinner-mini" />
          <span>{isSignUp ? 'Creating account...' : 'Signing in...'}</span>
        </>
      ) : (
        isSignUp ? 'Create account' : 'Sign in'
      )}
    </button>
  )
}

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [isSignUp, setIsSignUp] = useState(false)
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [activePolicy, setActivePolicy] = useState<'privacy' | 'terms' | 'cookies' | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState(false)

  // Real-time password strength evaluation
  const passwordStrength = useMemo(() => {
    if (!password) return null;
    let score = 0;
    if (password.length > 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { label: 'Weak', color: '#ef4444' };
    if (score === 2) return { label: 'Fair', color: '#f59e0b' };
    if (score === 3) return { label: 'Strong', color: '#10b981' };
    return { label: 'Secure', color: '#06b6d4' };
  }, [password]);

  const handleGithubLogin = async (e: React.MouseEvent) => {
    e.preventDefault(); // Explicitly prevent any form side-effects
    setAuthError(null)
    const supabase = createBrowserSupabaseClient()

    // Ensure accurate absolute URL for OAuth callback
    const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || '');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${origin}/auth/callback?next=/dashboard`,
        skipBrowserRedirect: false
      }
    })

    if (error) {
      console.error('GitHub Login Error:', error)
      setAuthError(error.message || "Unable to initiate GitHub authentication.")
    }
  }

  const handleResetPassword = async () => {
    if (!email || !email.includes('@')) {
      setAuthError('Please provide a valid terminal email to receive a recovery link.')
      return
    }

    setIsResetting(true)
    setResetMessage(null)
    setAuthError(null)

    try {
      const supabase = createBrowserSupabaseClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) {
        setAuthError(error.message)
      } else {
        setResetMessage('If your email exists, a reset link has been sent.')
      }
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'url(/assets/auth_bg.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '1rem'
    }}>
      {/* Dark Overlay for Readability */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />

      <div
        className="glass"
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '32px',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '3rem',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.6s ease-out'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ background: 'var(--brand)', width: '60px', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 8px 16px rgba(var(--brand-rgb), 0.4)' }}>
            <BookOpen color="white" size={32} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', margin: 0 }}>
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem', fontWeight: 500 }}>
            {isSignUp ? "Create an account to join your project team." : "Welcome back! Sign in to your workspace."}
          </p>
        </div>

        {(error || authError || resetMessage) && (
          <TransientError message={error || authError || resetMessage || ''} type={resetMessage ? 'success' : 'error'} />
        )}

        <form action={isSignUp ? signup : login} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Anti-bot Honeypot Field */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <input type="text" name="hp_field" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ color: 'rgba(255,255,255,0.9)' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              <input
                className="form-input"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', paddingLeft: '3rem' }}
                placeholder="school.email@edu.com"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ color: 'rgba(255,255,255,0.9)', display: 'flex', justifyContent: 'space-between' }}>
              Password
              {isSignUp && passwordStrength && (
                <span style={{ fontSize: '0.7rem', color: passwordStrength.color, fontWeight: 900, textTransform: 'uppercase' }}>
                  Strength: {passwordStrength.label}
                </span>
              )}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              <input
                className="form-input"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${passwordStrength && isSignUp ? passwordStrength.color : 'rgba(255,255,255,0.1)'}`, color: 'white', paddingLeft: '3rem', transition: 'border-color 0.3s' }}
                placeholder="••••••••"
              />
            </div>
          </div>

          {isSignUp && (
            <div className="form-group" style={{ marginBottom: 0, animation: 'slideIn 0.3s ease-out' }}>
              <label className="form-label" style={{ color: 'rgba(255,255,255,0.9)' }}>ID Number</label>
              <input
                className="form-input"
                name="school_id"
                type="text"
                required
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                placeholder="ID-001234"
              />
            </div>
          )}

          {isSignUp && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginTop: '0.5rem' }}>
              <input
                type="checkbox"
                id="legal"
                name="legal_accepted"
                checked={legalAccepted}
                onChange={(e) => setLegalAccepted(e.target.checked)}
                required
                style={{ marginTop: '0.3rem' }}
              />
              <label htmlFor="legal" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                I accept the <button type="button" onClick={() => setActivePolicy('terms')} style={{ background: 'none', border: 'none', color: 'var(--brand)', padding: 0, cursor: 'pointer', fontWeight: 600 }}>Terms</button>,
                <button type="button" onClick={() => setActivePolicy('privacy')} style={{ background: 'none', border: 'none', color: 'var(--brand)', padding: 0, cursor: 'pointer', fontWeight: 600 }}>Privacy</button>, and
                <button type="button" onClick={() => setActivePolicy('cookies')} style={{ background: 'none', border: 'none', color: 'var(--brand)', padding: 0, cursor: 'pointer', fontWeight: 600 }}>Cookies</button>.
              </label>
            </div>
          )}

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <SubmitButton isSignUp={isSignUp} legalAccepted={legalAccepted} />
            {!isSignUp && (
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="btn btn-ghost"
                  style={{ padding: '0.85rem 1rem', fontSize: '0.9rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)' }}
                  disabled={isResetting}
                >
                  {isResetting ? 'Sending reset link...' : 'Forgot password?'}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleGithubLogin(e)}
                  className="btn btn-secondary"
                  style={{ padding: '0.85rem 1rem', fontSize: '0.9rem', borderRadius: '14px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 auto', minWidth: '160px', justifyContent: 'center' }}
                >
                  <ExternalLink size={18} /> Continue with GitHub
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>

      {/* Policy Modals */}
      {activePolicy === 'privacy' && <PrivacyPolicy onClose={() => setActivePolicy(null)} />}
      {activePolicy === 'terms' && <TermsOfService onClose={() => setActivePolicy(null)} />}
      {activePolicy === 'cookies' && <CookiePolicy onClose={() => setActivePolicy(null)} />}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; height: 0; } to { opacity: 1; height: auto; } }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
        <div className="spinner" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
