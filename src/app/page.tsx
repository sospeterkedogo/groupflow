'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowRight, Zap, Shield, Users, Activity, BarChart3, 
  ChevronRight, Globe, Layers, HelpCircle, CheckCircle, 
  Lock, Trash2, Milestone, BookOpen, Fingerprint, Sparkles
} from 'lucide-react'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const features = [
    { 
      icon: <Zap size={24} />, 
      title: "Real-time Verification", 
      desc: "Total confidence through evidence: we analyze commit patterns to verify impact instantly and fairly.",
      color: "#0ea5e9"
    },
    { 
      icon: <Shield size={24} />, 
      title: "Fairness Protocol", 
      desc: "Our algorithms celebrate true contribution. We identify the quiet leaders and the over-performers.",
      color: "#10b981"
    },
    { 
      icon: <Layers size={24} />, 
      title: "Evidence Ledger", 
      desc: "Every milestone is anchored by a verifiable artifact ledger: Proof of Work that tutors can trust.",
      color: "#6366f1"
    }
  ]

  const faqs = [
    {
      q: "Is GroupFlow free to use?",
      a: "Yes. During my 2026 Dissertation research phase, all features including advanced analytics and the Proof of Work engine are completely free for students and tutors."
    },
    {
      q: "How is my data protected?",
      a: "We use enterprise-grade Supabase encryption for all project data. Your academic work and personal identification are never shared with third parties."
    },
    {
      q: "Can I delete my account?",
      a: "Absolutely. I believe in data sovereignty: you can delete your account and all associated project data permanently with a single click in your settings at any time."
    },
    {
      q: "Who is the creator of GroupFlow?",
      a: "GroupFlow is a project by Sospeter, developed as a final year dissertation focusing on mitigating social loafing through behavioral telemetry and automated attribution."
    }
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Animated Background Mesh */}
      <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(var(--brand-rgb), 0.05) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.05) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

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
                   <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>What is index?</strong>
                   To bridge the "Accountability Gap" in group projects. Traditional tools manage tasks; GroupFlow verifies participation.
                </div>
                <div>
                   <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>Why it matters?</strong>
                   Social loafing isn't just annoying: it's mathematically unfair. I am building a system where every update and artifact is a ledger entry for your grade.
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
          <Link href="/login" className="btn btn-primary btn-sm btn-inline" style={{ padding: '0.6rem 1.25rem', borderRadius: '12px' }}>Get Started</Link>
        </div>
      </header>
      <main style={{ padding: '4rem 0' }}>
        
        {/* HERO: The Accountability Hook */}
        <section style={{ textAlign: 'center', marginBottom: '8rem', padding: '0 var(--p-safe)', position: 'relative' }}>
           
           <div style={{ 
             display: 'inline-flex', 
             alignItems: 'center', 
             gap: '0.6rem', 
             padding: '10px 24px', 
             background: 'rgba(var(--brand-rgb), 0.08)', 
             borderRadius: '99px', 
             color: 'var(--brand)',
             fontSize: '0.85rem',
             fontWeight: 800,
             textTransform: 'uppercase',
             letterSpacing: '1.5px',
             marginBottom: '2rem',
             border: '1px solid rgba(var(--brand-rgb), 0.1)'
           }}>
             <Shield size={16} /> Orchestrate Accountability
           </div>
           
           <h1 className="fluid-h1" style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: 'clamp(2.5rem, 8vw, 5.5rem)', maxWidth: '1200px', margin: '0 auto 2rem', fontWeight: 900, letterSpacing: '-0.05em' }}>
             Stop Managing Tasks. <br />
             <span style={{ 
                background: 'linear-gradient(90deg, var(--brand) 0%, var(--accent) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>Start Verifying Impact.</span>
           </h1>
           
           <p className="fluid-p" style={{ color: 'var(--text-sub)', maxWidth: '850px', margin: '0 auto 3.5rem', fontWeight: 500, fontSize: '1.4rem', lineHeight: 1.5 }}>
              The current education system forces group work without the metrics to track it. 
              Social loafing isn't a student failure: it's a technical void. 
              GroupFlow transforms invisible effort into a verifiable ledger of academic achievement.
           </p>

           <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/login" className="btn btn-primary btn-lg" style={{ minWidth: '260px', padding: '1.25rem 2rem', fontSize: '1.1rem', borderRadius: '20px', boxShadow: '0 20px 40px -10px rgba(var(--brand-rgb), 0.3)' }}>
                Initialize Your Project <ArrowRight size={22} />
              </Link>
              <Link href="/demo" className="btn btn-secondary btn-lg" style={{ minWidth: '260px', padding: '1.25rem 2rem', fontSize: '1.1rem', borderRadius: '20px' }}>
                Explore Sandbox < Fingerprint size={22} />
              </Link>
           </div>
        </section>

        {/* THE MANIFESTO: Why Teamwork Fails */}
        <section style={{ padding: '10rem var(--p-safe)', background: 'var(--bg-sub)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '6rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '1 1 500px' }}>
               <div style={{ color: 'var(--error)', fontWeight: 900, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>The Great Collaboration Myth</div>
               <h2 style={{ fontSize: '3.75rem', fontWeight: 900, marginBottom: '2rem', letterSpacing: '-0.04em', lineHeight: 1.1 }}>A Problem Decades in the Making.</h2>
               <p style={{ fontSize: '1.25rem', color: 'var(--text-sub)', lineHeight: 1.8, marginBottom: '2rem' }}>
                  For forty years, students have been graded on "group performance" while the actual distribution of labor remained a black box. 
                  Tutors lack visibility, and elite performers shoulder the weight of silent collaborators.
               </p>
               <p style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 700, lineHeight: 1.8, marginBottom: '2.5rem' }}>
                  In 2026, this opacity ends here. GroupFlow uses behavioral telemetry to ensure accountability is more than a goal: it's an automated, immutable record.
               </p>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
                  <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
                     <div style={{ color: 'var(--brand)', marginBottom: '0.75rem' }}><CheckCircle size={24} /></div>
                     <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Verifiable Evidence</div>
                     <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', margin: 0 }}>Anchor your real work to your grade, not just your status updates.</p>
                  </div>
                  <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
                     <div style={{ color: 'var(--brand)', marginBottom: '0.75rem' }}><Zap size={24} /></div>
                     <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Elite Attribution</div>
                     <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', margin: 0 }}>Recognize the quiet leaders who drive project trajectories forward.</p>
                  </div>
               </div>
            </div>
            <div style={{ flex: '1 1 400px', position: 'relative' }}>
               <div className="glass" style={{ padding: '3.5rem', borderRadius: '48px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
                     <div style={{ padding: '10px', background: 'rgba(var(--brand-rgb), 0.1)', borderRadius: '12px' }}>
                        <Activity size={24} color="var(--brand)" />
                     </div>
                     <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Live Analytics Stream</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>Accountability Engine Active</div>
                     </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                     {[
                        { label: 'Attribution Accuracy', val: '99.9%', color: 'var(--success)' },
                        { label: 'Social Loafing Inhibited', val: '98.5%', color: 'var(--brand)' },
                        { label: 'Artifact Verification', val: 'Secured', color: 'var(--success)' }
                     ].map((stat, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'rgba(var(--brand-rgb), 0.03)', borderRadius: '16px', border: '1px solid rgba(var(--brand-rgb), 0.1)' }}>
                           <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-sub)' }}>{stat.label}</span>
                           <span style={{ fontSize: '0.85rem', fontWeight: 900, color: stat.color }}>{stat.val}</span>
                        </div>
                     ))}
                  </div>
                  
                  <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                     <div style={{ fontSize: '0.65rem', color: 'var(--text-sub)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>behavioral heartrate pulse</div>
                     <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '1rem' }}>
                        {[0.1, 0.4, 0.1, 0.7, 0.3, 0.9, 0.2, 0.5, 0.8, 0.4, 0.6, 0.5].map((opacity, i) => (
                           <div 
                             key={i} 
                             style={{ 
                               width: '4px', 
                               height: '20px', 
                               background: 'var(--brand)', 
                               borderRadius: '99px', 
                               opacity, 
                               animation: `spin ${1 + (i % 5) * 0.2}s infinite linear` 
                             }} 
                           />
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* EXTERNAL COLLABORATION: The Sync Layer */}
        <section style={{ padding: '10rem var(--p-safe)', textAlign: 'center' }}>
           <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div style={{ display: 'inline-flex', padding: '8px 16px', background: 'rgba(var(--brand-rgb), 0.05)', borderRadius: '12px', color: 'var(--brand)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '1px' }}>Frictionless Integration</div>
              <h2 style={{ fontSize: '3.75rem', fontWeight: 900, marginBottom: '2rem', letterSpacing: '-0.04em' }}>Your Tools: My Analytics.</h2>
              <p style={{ fontSize: '1.3rem', color: 'var(--text-sub)', lineHeight: 1.7, marginBottom: '4.5rem' }}>
                 I never force you into a new editor. Collaborate where you thrive: keep using your Google Docs, Figma system, or Overleaf reports. Just link your workspace and let the engine handle the rest.
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '4.5rem', flexWrap: 'wrap', opacity: 0.6, filter: 'grayscale(1)' }}>
                 {[
                   { name: 'Google Docs', icon: <Globe size={40} /> },
                   { name: 'Sheets', icon: <BarChart3 size={40} /> },
                   { name: 'Figma', icon: <Layers size={40} /> },
                   { name: 'GitHub', icon: <Activity size={40} /> },
                   { name: 'Overleaf', icon: <BookOpen size={40} /> }
                 ].map((tool, i) => (
                   <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      {tool.icon}
                      <span style={{ fontWeight: 800, fontSize: '0.75rem' }}>{tool.name}</span>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* ACADEMIC USE CASES */}
        <section style={{ padding: '8rem var(--p-safe)', background: 'var(--bg-sub)' }}>
           <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '2.75rem', fontWeight: 900, marginBottom: '4rem', textAlign: 'center', letterSpacing: '-0.03em' }}>Built for High-Stakes Achievement.</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
                 {[
                    { title: 'Dissertations & Capstones', desc: 'Secure your year-long effort with a verifiable ledger of every draft and research evolution.', icon: <Milestone /> },
                    { title: 'Group Lab Reports', desc: 'Ensure data analysis and scientific writing duties are clearly attributed across your squad.', icon: <Activity /> },
                    { title: 'Software Engineering', desc: 'Connect your Git flow directly for deep insights into modular impact and code ownership.', icon: <Zap /> },
                    { title: 'High-Level Case Studies', desc: 'Verify each member\'s contribution in fast-paced, competitive team environments.', icon: <Users /> }
                 ].map((usecase, i) => (
                    <div key={i} className="hover-lift" style={{ padding: '2.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '32px' }}>
                       <div style={{ width: '52px', height: '52px', borderRadius: '13px', background: 'rgba(var(--brand-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', marginBottom: '1.5rem' }}>
                          {usecase.icon}
                       </div>
                       <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1rem' }}>{usecase.title}</h3>
                       <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', lineHeight: 1.6 }}>{usecase.desc}</p>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* HOW IT WORKS: The 4-Step Ledger */}
        <section style={{ padding: '10rem var(--p-safe)', textAlign: 'center' }}>
           <h2 style={{ fontSize: '3.75rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-0.04em' }}>Evidence Over Administration.</h2>
           <p style={{ color: 'var(--text-sub)', fontSize: '1.4rem', marginBottom: '6rem', maxWidth: '850px', margin: '0 auto 6rem' }}>I transform team project friction into a verified record of collaborative excellence.</p>

           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', maxWidth: '1200px', margin: '0 auto' }}>
              {[
                { step: '01', title: 'Link Workspaces', desc: 'Connect your existing Google Docs, GitHub repositories, or Figma files in seconds.' },
                { step: '02', title: 'Capture Telemetry', desc: 'I silently verify activity patterns while you focus on the creative heavy lifting.' },
                { step: '03', title: 'Anchor Artifacts', desc: 'Every major upgrade is pushed to a verifiable ledger: clear, immutable proof of work.' },
                { step: '04', title: 'Extract Insights', desc: 'Experience a transparent view into contribution and balance for both teams and tutors.' }
              ].map((s, i) => (
                <div key={i} style={{ padding: '3.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '44px', textAlign: 'left', position: 'relative' }}>
                   <div style={{ fontSize: '4.5rem', fontWeight: 900, color: 'rgba(var(--brand-rgb), 0.05)', position: 'absolute', top: '1.5rem', right: '2rem', letterSpacing: '-0.05em' }}>{s.step}</div>
                   <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1rem', position: 'relative' }}>{s.title}</h3>
                   <p style={{ color: 'var(--text-sub)', fontSize: '1.1rem', lineHeight: 1.6, position: 'relative' }}>{s.desc}</p>
                </div>
              ))}
           </div>
        </section>

        {/* FAQ SECTION */}
        <section style={{ padding: '10rem var(--p-safe)', background: 'var(--bg-sub)', borderTop: '1px solid var(--border)' }}>
           <div style={{ maxWidth: '850px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                 <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(var(--brand-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: 'var(--brand)' }}>
                    <HelpCircle size={32} />
                 </div>
                 <h2 style={{ fontSize: '3.75rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Clarity & Absolute Trust.</h2>
                 <p style={{ color: 'var(--text-sub)', fontSize: '1.15rem', marginTop: '1rem' }}>Everything you need to know about the GroupFlow mission.</p>
              </div>

              <div style={{ display: 'grid', gap: '2rem' }}>
                 {faqs.map((faq, i) => (
                    <div key={i} style={{ padding: '2.5rem', background: 'var(--surface)', borderRadius: '32px', border: '1px solid var(--border)', transition: 'all 0.3s ease' }}>
                       <h4 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', letterSpacing: '-0.02em' }}>
                          {faq.q}
                          < ChevronRight size={22} style={{ color: 'var(--brand)' }} />
                       </h4>
                       <p style={{ color: 'var(--text-sub)', fontSize: '1.15rem', lineHeight: 1.75 }}>{faq.a}</p>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* FINAL CTA */}
        <section style={{ padding: '10rem var(--p-safe)', textAlign: 'center' }}>
           <div className="glass" style={{ maxWidth: '1150px', margin: '0 auto', padding: '7rem 3rem', borderRadius: '64px', border: '1px solid var(--border)', background: 'linear-gradient(135deg, var(--brand) 0%, rgba(var(--brand-rgb), 0.8) 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '40%', height: '80%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)', filter: 'blur(40px)', transform: 'rotate(15deg)' }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                 <h2 style={{ fontSize: '4.5rem', fontWeight: 900, color: 'white', marginBottom: '1.5rem', letterSpacing: '-0.04em' }}>Join the Mission.</h2>
                 <p style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.9)', marginBottom: '4rem', maxWidth: '750px', margin: '0 auto 4rem', lineHeight: 1.5 }}>
                    Help me pioneer the next generation of academic collaboration:
                    no cost, total data sovereignty, and pure recognition.
                 </p>
                 <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/login" className="btn btn-lg" style={{ background: 'white', color: 'var(--brand)', minWidth: '300px', padding: '1.25rem 2.5rem', borderRadius: '22px', border: 'none', fontWeight: 900, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>Initialize Account</Link>
                    <Link href="/demo" className="btn btn-secondary btn-lg" style={{ border: '2.5px solid white', color: 'white', minWidth: '300px', padding: '1.25rem 2.5rem', borderRadius: '22px', fontWeight: 900 }}>Enter the Sandbox</Link>
                 </div>
                 
                 <div style={{ marginTop: '4.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                    <Trash2 size={20} />
                    <span>Permanent Sovereignty: delete everything instantly at any time.</span>
                 </div>
              </div>
           </div>
        </section>

      </main>

      <footer style={{ padding: '8rem var(--p-safe)', borderTop: '1px solid var(--border)', textAlign: 'center', background: 'var(--bg-sub)' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem', fontWeight: 900, justifyContent: 'center', marginBottom: '2rem', letterSpacing: '-0.04em' }}>
            <Activity size={36} color="var(--brand)" /> GroupFlow
         </div>
         <p style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.75rem' }}>Architecture by Sospeter • Dissertation 2026</p>
         <p style={{ color: 'var(--text-sub)', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto 4rem', lineHeight: 1.6 }}>
            Dedicated to empowering student teams through deep metrics, behavioral telemetry, and verifiable artifact recognition.
         </p>
         
         <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', borderTop: '1px solid var(--border)', paddingTop: '4rem' }}>
            <Link href="/login" style={{ color: 'var(--text-sub)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 700 }}>Inbound Portal</Link>
            <Link href="/login" style={{ color: 'var(--text-sub)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 700 }}>Privacy Ledger</Link>
            <Link href="/login" style={{ color: 'var(--text-sub)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 700 }}>Service Agreement</Link>
         </div>
      </footer>

      <style jsx>{`
        .fluid-h1 { line-height: 1.05; letter-spacing: -0.05em; }
        .hover-lift { transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease, border-color 0.4s ease; }
        .hover-lift:hover { transform: translateY(-12px); box-shadow: var(--shadow-xl); border-color: var(--brand); }
        .glass { backdrop-filter: blur(12px); }
        
        @media (min-width: 1024px) {
          .floating-element { display: block !important; }
        }

        .floating-element {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
      `}</style>
    </div>
  )
}
