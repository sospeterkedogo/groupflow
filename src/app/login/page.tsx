"use client"

import { useState, use } from 'react'
import { signup, login } from './actions'
import TransientError from '@/components/TransientError'
import { PrivacyPolicy, TermsOfService, CookiePolicy } from '@/components/Legal/Policies'
import { ShieldCheck, BookOpen, User, Lock, CheckCircle2 } from 'lucide-react'

export default function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [activePolicy, setActivePolicy] = useState<'privacy' | 'terms' | 'cookies' | null>(null)

  const { error } = use(searchParams)

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
            {isSignUp ? 'Set up your GroupFlow account to get started.' : 'Sign in to your GroupFlow workspace.'}
          </p>
        </div>

        {error && <TransientError message={error} />}

        <form action={isSignUp ? signup : login} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ color: 'rgba(255,255,255,0.9)' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              <input
                className="form-input"
                name="email"
                type="email"
                required
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', paddingLeft: '3rem' }}
                placeholder="school.email@edu.com"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ color: 'rgba(255,255,255,0.9)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              <input
                className="form-input"
                name="password"
                type="password"
                required
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', paddingLeft: '3rem' }}
                placeholder="••••••••"
              />
            </div>
          </div>

          {isSignUp && (
            <div className="form-group" style={{ marginBottom: 0, animation: 'slideIn 0.3s ease-out' }}>
              <label className="form-label" style={{ color: 'rgba(255,255,255,0.9)' }}>Student ID</label>
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
            <button
              className="btn btn-primary"
              style={{ width: '100%', height: '3.5rem', borderRadius: '16px', fontSize: '1.1rem' }}
              disabled={isSignUp && !legalAccepted}
            >
              {isSignUp ? 'Create account' : 'Sign in'}
            </button>
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
