'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Zap, Shield, Users, Activity, BarChart3, ChevronRight, Globe, Layers } from 'lucide-react'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const features = [
    { 
      icon: <Zap size={24} />, 
      title: "Real-time Verification", 
      desc: "Stop guessing. We track real-time file additions and commit patterns to verify team work instantly.",
      color: "#0ea5e9"
    },
    { 
      icon: <Shield size={24} />, 
      title: "Fairness Protocol", 
      desc: "Our algorithms identify silent partners and over-performers, ensuring grades match the effort.",
      color: "#10b981"
    },
    { 
      icon: <Layers size={24} />, 
      title: "Evidence Ledger", 
      desc: "Every task completed is backed by an artifact ledger. Proof of Work that tutors can verify.",
      color: "#6366f1"
    }
  ]

  return (
     <div style={{ minHeight: 'var(--vh-dynamic)', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', position: 'relative', overflowX: 'hidden' }}>
       {/* Mesh Gradient Backdrop */}
       <div style={{ position: 'absolute', top: -100, right: -100, width: '400px', height: '400px', background: 'var(--brand)', filter: 'blur(120px)', opacity: 0.1, pointerEvents: 'none' }} />
       <div style={{ position: 'absolute', bottom: -100, left: -100, width: '400px', height: '400px', background: 'var(--accent)', filter: 'blur(120px)', opacity: 0.1, pointerEvents: 'none' }} />

       {/* Dissertation Project Modal */}
       {isModalOpen && (
         <div style={{ position: 'fixed', inset: 0, background: 'var(--overlay)', backdropFilter: 'blur(12px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
           <div 
             className="page-fade"
             style={{ background: 'var(--surface)', maxWidth: '650px', width: '100%', borderRadius: '32px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)', padding: '2.5rem', position: 'relative' }}
           >
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--bg-sub)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}
              >✕</button>
              
              <div style={{ display: 'inline-flex', padding: '6px 12px', background: 'rgba(var(--brand-rgb), 0.1)', color: 'var(--brand)', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '1px' }}>
                DISSERTATION PROJECT 2026
              </div>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-0.04em' }}>Restoring Team Balance</h2>
              
              <div style={{ display: 'grid', gap: '1.5rem', fontSize: '1rem', lineHeight: 1.6, color: 'var(--text-sub)' }}>
                 <div>
                    <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>What is GroupFlow?</strong>
                    GroupFlow is a project management and analytics verify-engine designed to address "Social Loafing"—a phenomenon where individual effort decreases in group settings.
                 </div>
                 <div>
                    <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>Why build this?</strong>
                    Traditional tools fail to capture the quality and authenticity of individual contributions. My dissertation explores how real-time telemetry and artifact-based verification can close this "accountability gap," ensuring grades reflect actual effort.
                 </div>
                 <div>
                    <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>Who is it for?</strong>
                    I've designed this primarily for University Students and Tutors. Students gain a high-performance workspace, while Tutors receive deep, objective insights for fair and accurate grading.
                 </div>
              </div>

              <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'var(--bg-sub)', borderRadius: '16px', border: '1px solid var(--border)', fontSize: '0.9rem' }}>
                 <Globe size={18} style={{ marginBottom: '0.5rem', color: 'var(--brand)' }} />
                 This project is part of my final year research into collaborative dynamics and automated attribution systems.
              </div>

              <button className="btn btn-primary" style={{ marginTop: '2rem', width: '100%' }} onClick={() => setIsModalOpen(false)}>
                Got it, let's explore
              </button>
           </div>
         </div>
       )}

      {/* Navigation */}
      <header style={{ 
        height: 'var(--h-nav)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 var(--p-safe)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(var(--bg-main), 0.8)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-main)' }}>
           <div style={{ padding: '6px', background: 'var(--brand)', borderRadius: '10px' }}>
              <Activity size={20} color="white" />
           </div>
           GroupFlow
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/login" className="btn btn-ghost btn-sm btn-inline" style={{ border: 'none' }}>Sign In</Link>
          <Link href="/login" className="btn btn-primary btn-sm btn-inline">Join Platform</Link>
        </div>
      </header>

      <main style={{ flex: 1, padding: '4rem var(--p-safe)', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
        {/* HERO: The Hook */}
        <section style={{ textAlign: 'center', marginBottom: '6rem' }}>
           <div style={{ 
             display: 'inline-flex', 
             alignItems: 'center', 
             gap: '0.5rem', 
             padding: '6px 16px', 
             background: 'rgba(var(--brand-rgb), 0.1)', 
             borderRadius: '99px', 
             color: 'var(--brand)',
             fontSize: '0.75rem',
             fontWeight: 800,
             textTransform: 'uppercase',
             letterSpacing: '1px',
             marginBottom: '1.5rem'
           }}>
             <Zap size={14} /> NEW: V3 Proof of Work Engine is Live
           </div>
           
           <h1 className="fluid-h1" style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>
             Team Fairness <br />
             <span style={{ 
               background: 'linear-gradient(90deg, var(--brand) 0%, var(--accent) 100%)',
               WebkitBackgroundClip: 'text',
               WebkitTextFillColor: 'transparent',
               display: 'inline-block'
             }}>Built on Evidence.</span>
           </h1>
           
           <p className="fluid-p" style={{ color: 'var(--text-sub)', maxWidth: '700px', margin: '0 auto 2.5rem', fontWeight: 500 }}>
             GroupFlow isn't just a task board. It's a verification engine for student projects. 
             Automatic attribution, artifact ledgers, and real-time activity intelligence.
           </p>

           <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login" className="btn btn-primary btn-lg btn-inline" style={{ minWidth: '220px' }}>
                Launch Dashboard <ArrowRight size={20} />
              </Link>
              <Link href="/login" className="btn btn-secondary btn-lg btn-inline" style={{ minWidth: '220px' }}>
                How it Works
              </Link>
           </div>
        </section>

        {/* PROOF: Live HUD Simulation */}
        <section style={{ marginBottom: '8rem' }}>
           <div className="glass" style={{ 
             borderRadius: 'var(--radius-lg)', 
             padding: 'clamp(1rem, 5vw, 3rem)', 
             border: '1px solid var(--border)',
             boxShadow: 'var(--shadow-xl)',
             position: 'relative',
             overflow: 'hidden'
           }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                 <div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Project: Global Supply Chain V1</h3>
                    <p style={{ margin: 0, color: 'var(--text-sub)', fontSize: '0.875rem' }}>Active Module: Engineering Ethics</p>
                 </div>
                 <div className="badge badge-code" style={{ padding: '0.5rem 1rem' }}>VALIDITY: 98.4%</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                 {[
                   { label: 'Verified Artifacts', value: '124', color: 'var(--brand)' },
                   { label: 'Attribution Ratio', value: '1.2x', color: 'var(--success)' },
                   { label: 'Team Activity', value: 'High', color: '#f59e0b' }
                 ].map((stat, i) => (
                   <div key={i} style={{ padding: '1.5rem', background: 'var(--bg-sub)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                      <div style={{ color: 'var(--text-sub)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{stat.label}</div>
                      <div style={{ fontSize: '2rem', fontWeight: 900, color: stat.color }}>{stat.value}</div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* FEATURES: Value Prop */}
        <section style={{ marginBottom: '8rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Orchestrate with Precision.</h2>
            <p style={{ color: 'var(--text-sub)' }}>Built for students who care about their contribution footprint.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {features.map((f, i) => (
              <div key={i} className="hover-lift" style={{ 
                padding: '2.5rem', 
                background: 'var(--surface)', 
                borderRadius: 'var(--radius-lg)', 
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-md)'
              }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '16px', 
                  background: 'rgba(var(--brand-rgb), 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: f.color,
                  marginBottom: '1.5rem'
                }}>
                  {f.icon}
                </div>
                <h4 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{f.title}</h4>
                <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MOBILE FOCUS: iPhone 13 Snapshot Callout */}
        <section style={{ 
          background: 'var(--brand)', 
          borderRadius: 'var(--radius-lg)', 
          padding: 'clamp(2rem, 8vw, 4rem)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '3rem',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
           <div style={{ flex: 1, minWidth: '300px', zIndex: 1 }}>
              <h2 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '1rem' }}>Fits in your pocket.</h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
                The mobile dashboard is optimized for small screens, allowing you to update tasks and upload evidence on the go.
              </p>
              <Link href="/login" className="btn btn-lg btn-inline" style={{ background: 'white', color: 'var(--brand)', border: 'none' }}>
                Experience Mobile <ChevronRight size={20} />
              </Link>
           </div>
           
           <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <div style={{ 
                width: '100%', 
                maxWidth: '280px', 
                aspectRatio: '9/16', 
                background: 'rgba(255,255,255,0.1)', 
                border: '8px solid rgba(255,255,255,0.1)',
                borderRadius: '40px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                 {[1,2,3].map(i => (
                   <div key={i} style={{ height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }} />
                 ))}
              </div>
           </div>
        </section>

      </main>

      <footer style={{ padding: '4rem var(--p-safe)', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
         <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '1rem' }}>GroupFlow</div>
         <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>&copy; 2026 GroupFlow Analytics. Education at scale.</p>
      </footer>
    </div>
  )
}
