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
      desc: "Confidence through evidence. We track commit patterns to verify contributions instantly and fairly.",
      color: "#0ea5e9"
    },
    { 
      icon: <Shield size={24} />, 
      title: "Fairness Protocol", 
      desc: "Our algorithms celebrate every contribution, identifying the quiet leaders and over-performers.",
      color: "#10b981"
    },
    { 
      icon: <Layers size={24} />, 
      title: "Evidence Ledger", 
      desc: "Every milestone is backed by a verifiable artifact ledger. Proof of Work that tutors can trust.",
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
      a: "Absolutely. I believe in data sovereignty. You can delete your account and all associated project data permanently with a single click in your settings at any time."
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

      <main style={{ padding: '6rem 0' }}>
        
        {/* HERO: Immersive & Welcoming */}
        <section style={{ textAlign: 'center', marginBottom: '10rem', padding: '0 var(--p-safe)', position: 'relative' }}>
           
           {/* Floating UI Elements (Top Left) */}
           <div className="floating-element" style={{ position: 'absolute', top: '0', left: '10%', animationDelay: '0s', display: 'none' }}>
              <div className="glass" style={{ padding: '0.75rem 1rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-md)' }}>
                 <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BarChart3 size={16} color="white" />
                 </div>
                 <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-sub)' }}>GROUP FAIRNESS</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 900 }}>98.4% Accuracy</div>
                 </div>
              </div>
           </div>

           {/* Floating UI Elements (Bottom Right) */}
           <div className="floating-element" style={{ position: 'absolute', bottom: '-20px', right: '15%', animationDelay: '1s', display: 'none' }}>
              <div className="glass" style={{ padding: '0.75rem 1rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-md)' }}>
                 <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={16} color="white" />
                 </div>
                 <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-sub)' }}>VERIFIED ARTIFACT</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 900 }}>Ledger Entry #442</div>
                 </div>
              </div>
           </div>

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
             marginBottom: '2.5rem',
             border: '1px solid rgba(var(--brand-rgb), 0.1)'
           }}>
             <Sparkles size={16} /> Welcome to the Future of Collaboration
           </div>
           
           <h1 className="fluid-h1" style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: 'clamp(2.5rem, 9vw, 5.5rem)', maxWidth: '1100px', margin: '0 auto 2rem', fontWeight: 900 }}>
             Where Teamwork Meets <br />
             <span style={{ 
               background: 'linear-gradient(90deg, var(--brand) 0%, var(--accent) 100%)',
               WebkitBackgroundClip: 'text',
               WebkitTextFillColor: 'transparent',
               display: 'inline-block'
             }}>Deep Recognition.</span>
           </h1>
           
           <p className="fluid-p" style={{ color: 'var(--text-sub)', maxWidth: '750px', margin: '0 auto 3.5rem', fontWeight: 500, fontSize: '1.35rem', lineHeight: 1.5 }}>
              GroupFlow is a project intelligence space designed to bridge the accountability gap. 
              I turn every commit, every file, and every idea into a verifiable ledger of your team's success.
           </p>

           <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/login" className="btn btn-primary btn-lg" style={{ minWidth: '260px', padding: '1.4rem 2.5rem', fontSize: '1.1rem', borderRadius: '20px' }}>
                Join the Platform <ArrowRight size={22} />
              </Link>
              <Link href="/demo" className="btn btn-secondary btn-lg" style={{ minWidth: '260px', padding: '1.4rem 2.5rem', fontSize: '1.1rem', borderRadius: '20px' }}>
                Try Sandboxed Demo < Fingerprint size={22} />
              </Link>
           </div>
           
           <div style={{ marginTop: '3.5rem' }}>
              <button 
                onClick={() => setIsModalOpen(true)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-sub)', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px dashed var(--border)', paddingBottom: '4px' }}
                className="hover-opacity"
              >
                 <BookOpen size={18} /> Read the Research Manifesto
              </button>
           </div>
        </section>

        {/* THE PROBLEM: Understanding the Gap */}
        <section style={{ padding: '8rem var(--p-safe)', background: 'var(--bg-sub)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '320px' }}>
               <h2 style={{ fontSize: '3.25rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>Celebrate Every Voice.</h2>
               <p style={{ fontSize: '1.25rem', color: 'var(--text-sub)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
                  Group projects shouldn't be a game of hide-and-seek. GroupFlow makes contribution visible and verified, 
                  ensuring that the people who drive the project get the recognition they deserve. 
                  <strong> No more quiet contributors being left behind.</strong>
               </p>
               <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1.25rem' }}>
                 {[
                   { icon: <Users />, text: "Automated attribution for every team member" },
                   { icon: <Milestone />, text: "Verification of work through artifact ledgers" },
                   { icon: <Fingerprint />, text: "Secure, tamper-proof behavior telemetry" }
                 ].map((item, i) => (
                   <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 700, fontSize: '1.1rem' }}>
                     <div style={{ color: 'var(--brand)', background: 'rgba(var(--brand-rgb), 0.1)', padding: '8px', borderRadius: '12px' }}>{item.icon}</div>
                     {item.text}
                   </li>
                 ))}
               </ul>
            </div>
            <div style={{ flex: 1, minWidth: '320px', position: 'relative' }}>
               <div className="glass" style={{ padding: '3rem', borderRadius: '40px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, padding: '1.5rem' }}>
                     <div className="badge badge-success" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>STABILITY ACTIVE</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
                     <div style={{ width: '40px', height: '8px', background: 'var(--brand)', borderRadius: '99px' }} />
                     <div style={{ width: '40px', height: '8px', background: 'var(--brand)', borderRadius: '99px', opacity: 0.4 }} />
                     <div style={{ width: '40px', height: '8px', background: 'var(--brand)', borderRadius: '99px', opacity: 0.1 }} />
                  </div>
                  <h4 style={{ margin: 0, fontSize: '1.75rem', marginBottom: '0.75rem', fontWeight: 800 }}>Impact Recognition</h4>
                  <div style={{ fontSize: '4.5rem', fontWeight: 900, color: 'var(--brand)', letterSpacing: '-0.05em' }}>1.2x <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success)', verticalAlign: 'middle', marginLeft: '1rem' }}>TOP PERFORMER</span></div>
                  <p style={{ color: 'var(--text-sub)', fontSize: '1.1rem' }}>This member has verified 4 artifacts in the last 24 hours.</p>
                  
                  <div style={{ marginTop: '2rem', height: '60px', background: 'var(--bg-main)', borderRadius: '16px', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sub)', fontSize: '0.85rem' }}>
                     Telemetry Stream Verified... 100%
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ padding: '10rem var(--p-safe)', textAlign: 'center' }}>
           <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1.5rem' }}>Built for Transparency.</h2>
           <p style={{ color: 'var(--text-sub)', fontSize: '1.35rem', marginBottom: '6rem', maxWidth: '800px', margin: '0 auto 6rem' }}>I turn complex team dynamics into simple, verifiable metrics of success.</p>

           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', maxWidth: '1200px', margin: '0 auto' }}>
              {[
                { step: '01', title: 'Collaborate Naturally', desc: 'No complex overhead. Just connect your workflow and start building together.' },
                { step: '02', title: 'Verify Effortlessly', desc: 'Every task is anchored by a verifiable artifact. Authentic work, automatically attributed.' },
                { step: '03', title: 'Grow Fairly', desc: 'See deep insights into team health and individual contribution through clean, beautiful analytics.' }
              ].map((s, i) => (
                <div key={i} className="hover-lift" style={{ padding: '3.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '40px', textAlign: 'left' }}>
                   <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'rgba(var(--brand-rgb), 0.1)', marginBottom: '1.5rem', letterSpacing: '-0.05em' }}>{s.step}</div>
                   <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.25rem' }}>{s.title}</h3>
                   <p style={{ color: 'var(--text-sub)', fontSize: '1.1rem', lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              ))}
           </div>
        </section>

        {/* FAQ SECTION */}
        <section style={{ padding: '8rem var(--p-safe)', background: 'var(--bg-sub)' }}>
           <div style={{ maxWidth: '850px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                 <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(var(--brand-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: 'var(--brand)' }}>
                    <HelpCircle size={32} />
                 </div>
                 <h2 style={{ fontSize: '3.5rem', fontWeight: 900 }}>Clarity & Trust.</h2>
                 <p style={{ color: 'var(--text-sub)', fontSize: '1.1rem', marginTop: '1rem' }}>Everything you need to know about the GroupFlow mission.</p>
              </div>

              <div style={{ display: 'grid', gap: '2rem' }}>
                 {faqs.map((faq, i) => (
                    <div key={i} style={{ padding: '2.5rem', background: 'var(--surface)', borderRadius: '28px', border: '1px solid var(--border)', transition: 'border-color 0.3s' }}>
                       <h4 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          {faq.q}
                          < ChevronRight size={22} style={{ color: 'var(--brand)' }} />
                       </h4>
                       <p style={{ color: 'var(--text-sub)', fontSize: '1.1rem', lineHeight: 1.7 }}>{faq.a}</p>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* FINAL CTA */}
        <section style={{ padding: '10rem var(--p-safe)', textAlign: 'center' }}>
           <div className="glass" style={{ maxWidth: '1100px', margin: '0 auto', padding: '6rem 3rem', borderRadius: '56px', border: '1px solid var(--border)', background: 'linear-gradient(135deg, var(--brand) 0%, rgba(var(--brand-rgb), 0.8) 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '40%', height: '80%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)', filter: 'blur(40px)', transform: 'rotate(15deg)' }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                 <h2 style={{ fontSize: '4rem', fontWeight: 900, color: 'white', marginBottom: '1.5rem', letterSpacing: '-0.04em' }}>Join the Mission.</h2>
                 <p style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.9)', marginBottom: '3.5rem', maxWidth: '700px', margin: '0 auto 3.5rem', lineHeight: 1.5 }}>
                    Help me pioneer the next generation of academic collaboration. 
                    No cost, total data sovereignty, pure recognition.
                 </p>
                 <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/login" className="btn btn-lg" style={{ background: 'white', color: 'var(--brand)', minWidth: '280px', padding: '1.25rem 2.5rem', borderRadius: '20px', border: 'none', fontWeight: 900 }}>Sign Up for Free</Link>
                    <Link href="/demo" className="btn btn-secondary btn-lg" style={{ border: '2.5px solid white', color: 'white', minWidth: '280px', padding: '1.25rem 2.5rem', borderRadius: '20px', fontWeight: 900 }}>Explore the Sandbox</Link>
                 </div>
                 
                 <div style={{ marginTop: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                    <Trash2 size={18} />
                    <span>Permanent Data Sovereignty: Delete everything instantly at any time.</span>
                 </div>
              </div>
           </div>
        </section>

      </main>

      <footer style={{ padding: '8rem var(--p-safe)', borderTop: '1px solid var(--border)', textAlign: 'center', background: 'var(--bg-sub)' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.75rem', fontWeight: 900, justifyContent: 'center', marginBottom: '2rem' }}>
            <Activity size={32} color="var(--brand)" /> GroupFlow
         </div>
         <p style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.75rem' }}>Architecture by Sospeter • Dissertation 2026</p>
         <p style={{ color: 'var(--text-sub)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto 4rem', lineHeight: 1.6 }}>
            Dedicated to empowering student teams through deep metrics, behavior telemetry, and verifiable artifact recognition.
         </p>
         
         <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', borderTop: '1px solid var(--border)', paddingTop: '4rem' }}>
            <Link href="/login" style={{ color: 'var(--text-sub)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700 }}>Sign In</Link>
            <Link href="/login" style={{ color: 'var(--text-sub)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700 }}>Privacy Policy</Link>
            <Link href="/login" style={{ color: 'var(--text-sub)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700 }}>Terms of Service</Link>
         </div>
      </footer>

      <style jsx>{`
         .fluid-h1 { line-height: 1.05; letter-spacing: -0.05em; }
         .hover-lift { transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease, border-color 0.4s ease; }
         .hover-lift:hover { transform: translateY(-12px); box-shadow: var(--shadow-xl); border-color: var(--brand); }
         .glass { backdrop-filter: blur(12px); }
         .hover-opacity:hover { opacity: 0.7; }
         
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
