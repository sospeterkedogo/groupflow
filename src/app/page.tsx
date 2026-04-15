'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowRight, Zap, Shield, Users, Activity, BarChart3, 
  ChevronRight, Globe, Layers, HelpCircle, CheckCircle, 
  Lock, Trash2, Milestone, BookOpen, Quote
} from 'lucide-react'

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

  const faqs = [
    {
      q: "Is GroupFlow free to use?",
      a: "Yes. During our 2026 Dissertation research phase, all features including advanced analytics and the Proof of Work engine are completely free for students and tutors."
    },
    {
      q: "How is my data protected?",
      a: "We use enterprise-grade Supabase encryption for all project data. Your academic work and personal identification are never shared with third parties."
    },
    {
      q: "Can I delete my account?",
      a: "Absolutely. We believe in data sovereignty. You can delete your account and all associated project data permanently with a single click in your settings at any time."
    },
    {
      q: "Who is the creator of GroupFlow?",
      a: "GroupFlow is a project by Sospeter, developed as a final year dissertation focusing on mitigating social loafing through behavioral telemetry and automated attribution."
    }
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', position: 'relative' }}>
      
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
               RESEARCH MANIFESTO 2026
             </div>
             <h2 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-0.04em' }}>Restoring Team Balance</h2>
             
             <div style={{ display: 'grid', gap: '1.5rem', fontSize: '1rem', lineHeight: 1.6, color: 'var(--text-sub)' }}>
                <div>
                   <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>What is the goal?</strong>
                   To bridge the "Accountability Gap" in group projects. Traditional tools manage tasks; GroupFlow verifies participation.
                </div>
                <div>
                   <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>Why it matters?</strong>
                   Social loafing isn't just annoying—it's mathematically unfair. I am building a system where every commit, file, and update is a ledger entry for your grade.
                </div>
             </div>

             <button className="btn btn-primary" style={{ marginTop: '2rem', width: '100%' }} onClick={() => setIsModalOpen(false)}>
               Continue to Explore
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
          <Link href="/login" className="btn btn-primary btn-sm btn-inline">Get Started</Link>
        </div>
      </header>

      <main style={{ padding: '4rem 0' }}>
        
        {/* HERO: The Hook */}
        <section style={{ textAlign: 'center', marginBottom: '8rem', padding: '0 var(--p-safe)' }}>
           <div style={{ 
             display: 'inline-flex', 
             alignItems: 'center', 
             gap: '0.5rem', 
             padding: '8px 20px', 
             background: 'rgba(var(--brand-rgb), 0.1)', 
             borderRadius: '99px', 
             color: 'var(--brand)',
             fontSize: '0.8rem',
             fontWeight: 800,
             textTransform: 'uppercase',
             letterSpacing: '1px',
             marginBottom: '2rem'
           }}>
             <Zap size={14} /> Dissertation Project: V3 Fairness Protocols Active
           </div>
           
           <h1 className="fluid-h1" style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', maxWidth: '1000px', margin: '0 auto 1.5rem' }}>
             Accountability for <br />
             <span style={{ 
               background: 'linear-gradient(90deg, var(--brand) 0%, var(--accent) 100%)',
               WebkitBackgroundClip: 'text',
               WebkitTextFillColor: 'transparent',
               display: 'inline-block'
             }}>Ambitious Teams.</span>
           </h1>
           
           <p className="fluid-p" style={{ color: 'var(--text-sub)', maxWidth: '750px', margin: '0 auto 3rem', fontWeight: 500, fontSize: '1.25rem' }}>
              Stop the free riders. GroupFlow connects your workflow to real-time verification 
              intelligence, ensuring fair grades through verifiable proof of work.
           </p>

           <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login" className="btn btn-primary btn-lg" style={{ minWidth: '240px', padding: '1.25rem 2rem' }}>
                Launch Dashboard <ArrowRight size={20} />
              </Link>
              <button onClick={() => setIsModalOpen(true)} className="btn btn-secondary btn-lg" style={{ minWidth: '240px' }}>
                The Science <BookOpen size={20} />
              </button>
           </div>
        </section>

        {/* THE PROBLEM: Social Loafing */}
        <section style={{ padding: '8rem var(--p-safe)', background: 'var(--bg-sub)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '320px' }}>
               <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1.5rem' }}>The Hidden Cost of "Teamwork"</h2>
               <p style={{ fontSize: '1.15rem', color: 'var(--text-sub)', lineHeight: 1.7, marginBottom: '2rem' }}>
                  In most group projects, effort is invisible. This creates an environment where 20% of the team does 80% of the work. 
                  GroupFlow was built to bridge this <strong>Accountability Gap</strong> by making contribution data visible, verifiable, and fair.
               </p>
               <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1rem' }}>
                 {[
                   { icon: <Users />, text: "Identify silent partners instantly" },
                   { icon: <Milestone />, text: "Track evidence-to-grade matching" },
                   { icon: <Lock />, text: "Private, secure research sandbox" }
                 ].map((item, i) => (
                   <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 700 }}>
                     <div style={{ color: 'var(--brand)' }}>{item.icon}</div>
                     {item.text}
                   </li>
                 ))}
               </ul>
            </div>
            <div style={{ flex: 1, minWidth: '320px', position: 'relative' }}>
               <div className="glass" style={{ padding: '2.5rem', borderRadius: '32px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)', position: 'relative' }}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                     <div style={{ width: '48px', height: '12px', background: 'var(--brand)', borderRadius: '99px' }} />
                     <div style={{ width: '48px', height: '12px', background: 'var(--border)', borderRadius: '99px' }} />
                     <div style={{ width: '48px', height: '12px', background: 'var(--border)', borderRadius: '99px' }} />
                  </div>
                  <h4 style={{ margin: 0, fontSize: '1.5rem', marginBottom: '0.5rem' }}>Individual Contribution Ratio</h4>
                  <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--brand)' }}>0.8x <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--error)' }}>-15.4% BELOW AVG</span></div>
                  <p style={{ color: 'var(--text-sub)' }}>Warning: Silent partner identification system active for this node.</p>
               </div>
               {/* Decorative floating dots */}
               <div style={{ position: 'absolute', top: -20, right: -20, width: '40px', height: '40px', background: 'var(--accent)', borderRadius: '50%', filter: 'blur(10px)', opacity: 0.3 }} />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ padding: '10rem var(--p-safe)', textAlign: 'center' }}>
           <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1rem' }}>Engineered for Accountability.</h2>
           <p style={{ color: 'var(--text-sub)', fontSize: '1.25rem', marginBottom: '5rem' }}>Three steps to a fair project grade.</p>

           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', maxWidth: '1200px', margin: '0 auto' }}>
              {[
                { step: '01', title: 'Connect Workflows', desc: 'Plug into our task engine and assign responsible members with clear evidence requirements.' },
                { step: '02', title: 'Verify Proof', desc: 'Artifacts are attached to every task. No link, no points. Simple, verifiable proof of work.' },
                { step: '03', title: 'Analyze Flow', desc: 'View real-time attribution ratios and team health metrics in a high-fidelity dashboard.' }
              ].map((s, i) => (
                <div key={i} className="hover-lift" style={{ padding: '3rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '32px', textAlign: 'left' }}>
                   <div style={{ fontSize: '3rem', fontWeight: 900, color: 'rgba(var(--brand-rgb), 0.1)', marginBottom: '1rem' }}>{s.step}</div>
                   <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>{s.title}</h3>
                   <p style={{ color: 'var(--text-sub)', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              ))}
           </div>
        </section>

        {/* FAQ SECTION */}
        <section style={{ padding: '8rem var(--p-safe)', background: 'var(--bg-sub)' }}>
           <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                 <HelpCircle size={48} style={{ color: 'var(--brand)', marginBottom: '1rem' }} />
                 <h2 style={{ fontSize: '3rem', fontWeight: 900 }}>Your Questions, Answered.</h2>
              </div>

              <div style={{ display: 'grid', gap: '1.5rem' }}>
                 {faqs.map((faq, i) => (
                    <div key={i} style={{ padding: '2rem', background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                       <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                          {faq.q}
                          < ChevronRight size={20} style={{ color: 'var(--brand)' }} />
                       </h4>
                       <p style={{ color: 'var(--text-sub)', lineHeight: 1.6 }}>{faq.a}</p>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* FINAL CTA */}
        <section style={{ padding: '10rem var(--p-safe)', textAlign: 'center' }}>
           <div className="glass" style={{ maxWidth: '1000px', margin: '0 auto', padding: '5rem 2rem', borderRadius: '48px', border: '1px solid var(--border)', background: 'linear-gradient(135deg, var(--brand) 0%, var(--bg-sub) 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                 <h2 style={{ fontSize: '3.5rem', fontWeight: 900, color: 'white', marginBottom: '1rem' }}>Ready to Scale Fairness?</h2>
                 <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                    Join hundreds of students already verifying their project effort. No cost, total control.
                 </p>
                 <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/login" className="btn btn-lg" style={{ background: 'white', color: 'var(--brand)', minWidth: '240px' }}>Join the Platform</Link>
                    <Link href="/demo" className="btn btn-secondary btn-lg" style={{ border: '1px solid white', color: 'white', minWidth: '240px' }}>Try Sandboxed Demo</Link>
                 </div>
                 
                 <div style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
                    <Trash2 size={16} />
                    <span>No strings attached: Delete your account and all data instantly anytime.</span>
                 </div>
              </div>
           </div>
        </section>

      </main>

      <footer style={{ padding: '6rem var(--p-safe)', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: 900, justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Activity size={24} color="var(--brand)" /> GroupFlow
         </div>
         <p style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>Architecture by Sospeter • Dissertation 2026</p>
         <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>Empowering student teams through verifiable data and behavioral telemetry.</p>
         
         <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
            <Link href="/login" style={{ color: 'var(--text-sub)', textDecoration: 'none', fontSize: '0.85rem' }}>Sign In</Link>
            <Link href="/login" style={{ color: 'var(--text-sub)', textDecoration: 'none', fontSize: '0.85rem' }}>Privacy Policy</Link>
            <Link href="/login" style={{ color: 'var(--text-sub)', textDecoration: 'none', fontSize: '0.85rem' }}>Terms of Service</Link>
         </div>
      </footer>

      <style jsx>{`
         .fluid-h1 { line-height: 1.1; letter-spacing: -0.05em; }
         .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
         .hover-lift:hover { transform: translateY(-10px); box-shadow: var(--shadow-xl); border-color: var(--brand); }
         .glass { backdrop-filter: blur(10px); }
      `}</style>
    </div>
  )
}
