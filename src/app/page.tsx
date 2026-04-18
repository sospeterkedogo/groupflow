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
      icon: <Layers size={21} />, 
      title: "Kanban Project Intelligence", 
      desc: "Synchronized workflow management with real-time state persistence and automated assignment tracking.",
      color: "var(--brand)"
    },
    { 
      icon: <Users size={21} />, 
      title: "Global Academic Networking", 
      desc: "Connect with peers across departments, exchange credentials, and build your professional university network.",
      color: "#10b981"
    },
    { 
      icon: <Zap size={21} />, 
      title: "Real-time Synchronization", 
      desc: "High-performance synchronization for chat, presence, and file management across all team devices.",
      color: "var(--accent)"
    },
    { 
      icon: <Shield size={21} />, 
      title: "Verifiable Contribution Hub", 
      desc: "Secure, audit-ready logs of every research contribution, ensuring transparency for students and faculty.",
      color: "#6366f1"
    },
    { 
      icon: <Milestone size={21} />, 
      title: "Intelligent Roadmapping", 
      desc: "Project timeline visualization with 5-stage academic status intervals from research to final submission.",
      color: "#f59e0b"
    },
    { 
       icon: <Award size={21} />, 
       title: "Achievement Tier System", 
       desc: "Differentiated recognition levels based on contribution metrics, unlocking professional profile enhancements.",
       color: "#fbbf24"
    }
  ]

  const faqs = [
    {
      q: "How can I support GroupFlow?",
      a: "You can support this project by upgrading to Pro (£2.99/mo) or Premium (£99 Lifetime). Your contribution directly helps me bring this tool to many more schools and support learning worldwide."
    },
    {
      q: "How is my data protected?",
      a: "Your privacy is my primary focus. I utilize industry-standard encryption to protect your work, ensuring your personal information remains confidential and is never shared with third parties."
    },
    {
      q: "Can I delete my account?",
      a: "Of course. You're in control of your data. You can permanently delete your account and all your project info with a single click whenever you like."
    },
    {
      q: "Who is behind GroupFlow?",
      a: "I created GroupFlow to help student teams feel more supported and recognized during group work."
    }
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Animated Background Mesh */}
      <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(var(--brand-rgb), 0.05) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.05) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Mission Project Modal */}
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
               THE GROUPFLOW MISSION
             </div>
             <h2 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-0.04em' }}>Transforming collaboration in schools</h2>
             
             <div style={{ display: 'grid', gap: '1.5rem', fontSize: '1rem', lineHeight: 1.6, color: 'var(--text-sub)' }}>
                <div>
                   <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>Solving a Real Problem</strong>
                   I built GroupFlow to solve the unfair group dynamics that many students face daily. <a>Please support this project to go into many schools and support learning.</a>
                </div>
                <div>
                   <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>Our Goal</strong>
                   I'm on a mission to bring this tool into many more schools to truly support learning by making every contribution visible and valued.
                </div>
             </div>

             <button className="btn btn-primary" style={{ marginTop: '2rem', width: '100%' }} onClick={() => setIsModalOpen(false)}>
               Support the Project
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
          <Link href="/login" className="btn btn-ghost btn-sm btn-inline" style={{ border: 'none' }}>Sign in</Link>
          <Link href="/login" className="btn btn-primary btn-sm btn-inline" style={{ padding: '0.6rem 1.25rem', borderRadius: '12px' }}>Get started</Link>
        </div>
      </header>
      <main style={{ padding: '4rem 0' }}>
        
        {/* HERO */}
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
             <Sparkles size={16} /> Celebrate every contribution
           </div>
           
           <h1 className="fluid-h1" style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: 'clamp(2.5rem, 8vw, 5rem)', maxWidth: '1200px', margin: '0 auto 2rem', fontWeight: 950, letterSpacing: '-0.05em' }}>
             Unified Academic <br />
             <span style={{ 
                background: 'linear-gradient(90deg, var(--brand) 0%, var(--accent) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>Collaboration Engine.</span>
           </h1>
           
           <p className="fluid-p" style={{ color: 'var(--text-sub)', maxWidth: '850px', margin: '0 auto 3.5rem', fontWeight: 500, fontSize: '1.35rem', lineHeight: 1.5 }}>
              GroupFlow professionalizes university group projects through real-time synchronization, verified contribution tracking, and cross-departmental networking. 
              <span style={{ display: 'block', marginTop: '1rem', color: 'var(--success)', fontWeight: 800, fontSize: '1rem' }}>FREE FOR STUDENTS FOREVER</span>
           </p>

           <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/login" className="btn btn-primary btn-lg" style={{ minWidth: '260px', padding: '1.25rem 2rem', fontSize: '1.1rem', borderRadius: '20px', boxShadow: '0 20px 40px -10px rgba(var(--brand-rgb), 0.3)' }}>
                Start your project <ArrowRight size={22} />
              </Link>
              <Link href="/demo" className="btn btn-secondary btn-lg" style={{ minWidth: '260px', padding: '1.25rem 2rem', fontSize: '1.1rem', borderRadius: '20px' }}>
                See how it works < ChevronRight size={22} />
              </Link>
           </div>
        </section>

        {/* SUPPORT THE MISSION */}
        <section id="mission" style={{ padding: '10rem var(--p-safe)', background: 'var(--bg-sub)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '6rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '1 1 500px' }}>
               <div style={{ color: 'var(--brand)', fontWeight: 900, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>Support the Mission</div>
               <h2 style={{ fontSize: '3.75rem', fontWeight: 900, marginBottom: '2rem', letterSpacing: '-0.04em', lineHeight: 1.1 }}>Solving the real problems in our schools.</h2>
               <p style={{ fontSize: '1.25rem', color: 'var(--text-sub)', lineHeight: 1.8, marginBottom: '2rem' }}>
                  This isn't just another app—it's a mission to transform how students work together. I built GroupFlow because I've seen first-hand how invisible work and unfair group dynamics can discourage even the most dedicated students.
               </p>
               <p style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 700, lineHeight: 1.8, marginBottom: '2.5rem' }}>
                  I'm on a mission to bring this tool into many more schools to truly support learning. By joining the mission, you aren't just getting a tool; you're helping bridge the gap for students everywhere.
               </p>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
                  <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
                     <div style={{ color: 'var(--brand)', marginBottom: '0.75rem' }}><CheckCircle size={24} /></div>
                     <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>See your impact</div>
                     <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', margin: 0 }}>Every part of your project is naturally linked to your shared goals.</p>
                  </div>
                  <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
                     <div style={{ color: 'var(--brand)', marginBottom: '0.75rem' }}><Zap size={24} /></div>
                     <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Work that matters</div>
                     <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', margin: 0 }}>I'll help you highlight the effort of every team member, from leaders to creators.</p>
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
                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Your Team Hub</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>Always in sync</div>
                     </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                     {[
                        { label: 'Work accurately tracked', val: 'Real-time', color: 'var(--success)' },
                        { label: 'Team balance', val: 'Optimized', color: 'var(--brand)' },
                        { label: 'Project records', val: 'Secure', color: 'var(--success)' }
                     ].map((stat, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'rgba(var(--brand-rgb), 0.03)', borderRadius: '16px', border: '1px solid rgba(var(--brand-rgb), 0.1)' }}>
                           <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-sub)' }}>{stat.label}</span>
                           <span style={{ fontSize: '0.85rem', fontWeight: 900, color: stat.color }}>{stat.val}</span>
                        </div>
                     ))}
                  </div>
                  
                  <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                     <div style={{ fontSize: '0.65rem', color: 'var(--text-sub)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Team pulse</div>
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

        {/* EXTERNAL COLLABORATION */}
        <section style={{ padding: '10rem var(--p-safe)', textAlign: 'center' }}>
           <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div style={{ display: 'inline-flex', padding: '8px 16px', background: 'rgba(var(--brand-rgb), 0.05)', borderRadius: '12px', color: 'var(--brand)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '1px' }}>Work your way</div>
              <h2 style={{ fontSize: '3.75rem', fontWeight: 900, marginBottom: '2rem', letterSpacing: '-0.04em' }}>Use the tools you love.</h2>
              <p style={{ fontSize: '1.3rem', color: 'var(--text-sub)', lineHeight: 1.7, marginBottom: '4.5rem' }}>
                 I work with the tools you already use every day. Collaborate where you feel most creative, whether it's Google Docs, Figma, or GitHub, and I'll help you keep everything organized.
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

        {/* CORE FEATURES SECTION */}
        <section style={{ padding: '8rem var(--p-safe)', background: 'var(--bg-sub)', borderTop: '1px solid var(--border)' }}>
           <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                 <div style={{ display: 'inline-flex', padding: '8px 16px', background: 'rgba(var(--brand-rgb), 0.05)', borderRadius: '12px', color: 'var(--brand)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '1px' }}>Platform Capabilities</div>
                 <h2 style={{ fontSize: '3.25rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Built for the high-performance student.</h2>
              </div>
              
              <div style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', display: 'grid', gap: '2.5rem' }}>
                 {features.map((feature, i) => (
                    <div key={i} className="hover-lift" style={{ padding: '2.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '32px' }}>
                       <div style={{ width: '52px', height: '52px', borderRadius: '13px', background: 'rgba(var(--brand-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: feature.color, marginBottom: '1.5rem' }}>
                          {feature.icon}
                       </div>
                       <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1rem' }}>{feature.title}</h3>
                       <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', lineHeight: 1.6 }}>{feature.desc}</p>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ padding: '10rem var(--p-safe)', textAlign: 'center' }}>
           <h2 style={{ fontSize: '3.75rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-0.04em' }}>Simple, transparent, and fair.</h2>
           <p style={{ color: 'var(--text-sub)', fontSize: '1.4rem', marginBottom: '6rem', maxWidth: '850px', margin: '0 auto 6rem' }}>I'll help you focus on the work, while I take care of the organization.</p>

           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', maxWidth: '1200px', margin: '0 auto' }}>
              {[
                { step: '01', title: 'Connect your work', desc: "Easily link your Google Docs, GitHub projects, or Figma designs in a few taps." },
                { step: '02', title: 'Focus on creating', desc: "Work naturally with your team. I'll help you keep track of progress as it happens." },
                { step: '03', title: 'Share your progress', desc: "Every milestone is saved, creating a clear and reliable history of your achievement." },
                { step: '04', title: 'Succeed together', desc: "Get a clear view of how everyone is contributing, so your entire team can thrive." }
              ].map((s, i) => (
                <div key={i} style={{ padding: '3.5rem 2.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '44px', textAlign: 'left', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                   <div style={{ 
                     fontSize: 'clamp(3.5rem, 6vw, 5rem)', 
                     fontWeight: 900, 
                     color: 'rgba(var(--brand-rgb), 0.04)', 
                     position: 'absolute', 
                     top: '1rem', 
                     right: '1.5rem', 
                     letterSpacing: '-0.06em',
                     zIndex: 0,
                     userSelect: 'none'
                   }}>{s.step}</div>
                   <h3 style={{ 
                     fontSize: 'clamp(1.5rem, 4vw, 1.85rem)', 
                     fontWeight: 950, 
                     marginBottom: '0.75rem', 
                     position: 'relative', 
                     letterSpacing: '-0.03em',
                     maxWidth: '85%',
                     zIndex: 1
                   }}>{s.title}</h3>
                   <p style={{ 
                     color: 'var(--text-sub)', 
                     fontSize: 'clamp(1rem, 3vw, 1.15rem)', 
                     lineHeight: 1.6, 
                     position: 'relative', 
                     fontWeight: 500,
                     zIndex: 1
                   }}>{s.desc}</p>
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
                 <h2 style={{ fontSize: '3.75rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Always here to help.</h2>
                 <p style={{ color: 'var(--text-sub)', fontSize: '1.15rem', marginTop: '1rem' }}>A few things you might want to know about my mission.</p>
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
                 <h2 style={{ fontSize: '4.25rem', fontWeight: 900, color: 'white', marginBottom: '1.5rem', letterSpacing: '-0.04em' }}>Believe in better learning.</h2>
                 <p style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.9)', marginBottom: '4rem', maxWidth: '800px', margin: '0 auto 4rem', lineHeight: 1.5 }}>
                    Support this mission to help reach students in schools worldwide. Get access to advanced features for just £2.99/mo or £99 for a lifetime.
                 </p>
                 <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/login" className="btn btn-lg" style={{ background: 'white', color: 'var(--brand)', minWidth: '300px', padding: '1.25rem 2.5rem', borderRadius: '22px', border: 'none', fontWeight: 900, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>Create your account</Link>
                    <Link href="/demo" className="btn btn-secondary btn-lg" style={{ border: '2.5px solid white', color: 'white', minWidth: '300px', padding: '1.25rem 2.5rem', borderRadius: '22px', fontWeight: 900 }}>See it in action</Link>
                 </div>
                 
                 <div style={{ marginTop: '4.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                    <Shield size={20} />
                    <span>Your work is always yours, and you can delete everything at any time.</span>
                 </div>
              </div>
           </div>
        </section>

      </main>

      <footer style={{ padding: '8rem var(--p-safe)', borderTop: '1px solid var(--border)', textAlign: 'center', background: 'var(--bg-sub)' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem', fontWeight: 900, justifyContent: 'center', marginBottom: '2rem', letterSpacing: '-0.04em' }}>
            <Activity size={36} color="var(--brand)" /> GroupFlow
         </div>
         <p style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.75rem' }}>Built by Sospeter • Mission 2026</p>
         <p style={{ color: 'var(--text-sub)', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto 4rem', lineHeight: 1.6 }}>
            Dedicated to helping student teams work better together through transparency, recognition, and fair teamwork.
         </p>
         
         <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', borderTop: '1px solid var(--border)', paddingTop: '4rem' }}>
            <Link href="/login" style={{ color: 'var(--text-sub)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 700 }}>Sign in</Link>
            <Link href="/login" style={{ color: 'var(--text-sub)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 700 }}>Privacy</Link>
            <Link href="/login" style={{ color: 'var(--text-sub)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 700 }}>Terms</Link>
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
