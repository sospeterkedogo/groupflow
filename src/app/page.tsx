'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowRight, Zap, Shield, Users, Activity, BarChart3, 
  ChevronRight, Globe, Layers, HelpCircle, CheckCircle, 
  Lock, Trash2, Milestone, BookOpen, Fingerprint, Sparkles, Award,
  ChevronDown, Search, Code, Smartphone, LayoutGrid, Info, Menu, X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PricingSection from '@/components/PricingSection'
import UserCount from '@/components/UserCount'
import CookieBanner from '@/components/CookieBanner'
import { MessageSquarePlus } from 'lucide-react'


export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  
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
      q: "How can I support GroupFlow2026?",
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
      q: "Who is behind GroupFlow2026?",
      a: "I created GroupFlow2026 to help student teams feel more supported and recognized during group work."
    }
  ]

  const navMenus = {
    product: {
      label: 'Product',
      categories: [
        {
          label: 'Infrastructure',
          items: [
            { id: 'kanban', title: 'Project Intelligence', desc: 'Real-time Kanban for technical research teams.', icon: <LayoutGrid size={18} /> },
            { id: 'sync', title: 'Real-time Sync', desc: 'Universal presence and file state synchronization.', icon: <Zap size={18} /> }
          ]
        },
        {
          label: 'Insights',
          items: [
            { id: 'roadmap', title: 'Academic Roadmap', desc: 'Phased timeline intervals for complex submissions.', icon: <Milestone size={18} /> }
          ]
        }
      ]
    },
    solutions: {
      label: 'Solutions',
      categories: [
        {
          label: 'Use Cases',
          items: [
            { id: 'research', title: 'Scholars & Researchers', desc: 'Secure contribute logs for high-stakes projects.', icon: <BookOpen size={18} /> },
            { id: 'teams', title: 'Team Collaboration', desc: 'Departmental project management at global scale.', icon: <Users size={18} /> }
          ]
        },
        {
          label: 'Scale',
          items: [
            { id: 'enterprise', title: 'Institutional Flow', desc: 'Integrated university ecosystems and audit-ready data.', icon: <Globe size={18} /> }
          ]
        }
      ]
    },
    resources: {
      label: 'Resources',
      categories: [
        {
          label: 'Community',
          items: [
            { id: 'mission', title: 'Global Mission 2026', desc: 'Read our manifesto for student support tech.', icon: <Fingerprint size={18} /> },
            { id: 'achievements', title: 'Impact Stats', desc: 'Global contribution metrics of the community.', icon: <Award size={18} /> }
          ]
        },
        {
          label: 'Support',
          items: [
            { id: 'help', title: 'Help & Knowledge', desc: 'Step-by-step guides for technical leads.', icon: <HelpCircle size={18} /> }
          ]
        }
      ]
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0a', position: 'relative', overflowX: 'hidden' }}>
      
      {/* High-Fidelity Technical Mesh & Grid Overlay */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.03) 0%, transparent 70%)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Institutional Mission Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div 
            className="page-fade"
            style={{ background: '#111111', maxWidth: '650px', width: '100%', borderRadius: '12px', border: '1px solid #222222', boxShadow: '0 30px 60px rgba(0,0,0,0.7)', padding: '2.5rem', position: 'relative' }}
          >
             <button 
               onClick={() => setIsModalOpen(false)}
               style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#222222', border: 'none', width: '36px', height: '36px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}
             >✕</button>
             
             <div style={{ display: 'inline-flex', padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '1px' }}>
                THE GroupFlow MISSION
             </div>

             <h2 style={{ fontSize: '2rem', fontWeight: 650, marginBottom: '1.5rem', letterSpacing: '-0.03em', color: '#f3f4f6' }}>Revolutionizing academic collaboration.</h2>
             
             <div style={{ display: 'grid', gap: '1.5rem', fontSize: '0.95rem', lineHeight: 1.6, color: '#9ca3af' }}>
                <div>
                   <strong style={{ color: '#f3f4f6', display: 'block', marginBottom: '0.25rem' }}>Solving Invisibility</strong>
                   GroupFlow was built to eliminate opaque group dynamics. We make every contribution audit-ready and visible to ensure fair recognition for all researchers.
                </div>
                <div>
                   <strong style={{ color: '#f3f4f6', display: 'block', marginBottom: '0.25rem' }}>Our Goal</strong>
                   On a mission to integrate this toolkit into global school systems, bridging the gap between individual effort and community goals.
                </div>
             </div>

             <button className="btn btn-primary" style={{ marginTop: '2rem', width: '100%', borderRadius: '8px', background: '#10b981', color: '#0a0a0a', border: 'none' }} onClick={() => setIsModalOpen(false)}>
               Support Global Scale
             </button>
          </div>
        </div>
      )}

      {/* Floating Tactical Sidebar Dock */}
      <aside 
        style={{ 
          position: 'fixed', 
          left: '1.5rem', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          zIndex: 900, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.75rem', 
          padding: '0.75rem', 
          background: 'rgba(10, 10, 10, 0.6)', 
          backdropFilter: 'blur(12px)', 
          borderRadius: '12px', 
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}
        className="hide-mobile"
      >
         {[
           { icon: <LayoutGrid size={20} />, label: 'Kanban' },
           { icon: <Activity size={20} />, label: 'Analytics' },
           { icon: <Users size={20} />, label: 'Network' },
           { icon: <Code size={20} />, label: 'GitHub' }
         ].map((tool, i) => (
           <div 
             key={i} 
             className="nav-util-btn"
             style={{ 
               width: '38px', 
               height: '38px', 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center', 
               borderRadius: '6px', 
               color: '#6b7280', 
               cursor: 'pointer',
               transition: 'all 0.2s ease'
             }}
           >
             {tool.icon}
           </div>
         ))}
      </aside>

      {/* Professional Navigation Overhaul (Supabase Style) */}
      <header 
        style={{ 
          height: '64px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(10, 10, 10, 0.8)',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          {/* Brand Identity */}
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', transition: 'opacity 0.2s ease' }} 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
             <div style={{ width: '28px', height: '28px', background: '#10b981', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)' }}>
                <img src="/logo.png" style={{ width: '20px', height: '20px', objectFit: 'contain' }} alt="Logo" />
             </div>
             <span style={{ fontSize: '1rem', fontWeight: 650, letterSpacing: '-0.02em', color: '#f3f4f6' }}>GroupFlow</span>
          </div>

          {/* Architectural Navigation - Desktop Only */}
          <nav 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            className="hide-mobile-flex"
          >
            {Object.keys(navMenus).map((key) => (
              <div 
                key={key} 
                className="nav-item-wrapper" 
                style={{ position: 'relative' }}
                onMouseEnter={() => setActiveDropdown(key)}
              >
                <button 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    padding: '0.5rem 0.75rem', 
                    color: activeDropdown === key ? '#f3f4f6' : '#9ca3af', 
                    fontWeight: 500, 
                    fontSize: '0.875rem', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    transition: 'color 0.2s ease'
                  }}
                >
                  {(navMenus as any)[key].label}
                  <ChevronDown size={12} style={{ opacity: 0.5, transform: activeDropdown === key ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }} />
                </button>

                <AnimatePresence>
                  {activeDropdown === key && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.99 }}
                      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '-2rem',
                        paddingTop: '0.75rem',
                        zIndex: 1100
                      }}
                    >
                      <div 
                        style={{
                          width: '560px',
                          background: '#111111',
                          borderRadius: '12px',
                          border: '1px solid #222222',
                          padding: '1.5rem',
                          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '1.5rem'
                        }}
                      >
                        {(navMenus as any)[key].categories.map((category: any, idx: number) => (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', marginBottom: '0.25rem' }}>
                              {category.label}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              {category.items.map((item: any) => (
                                <Link 
                                  key={item.id}
                                  href={
                                    item.id === 'kanban' ? '/product/intelligence' :
                                    item.id === 'sync' ? '/product/sync' :
                                    item.id === 'roadmap' ? '/product/roadmap' :
                                    item.id === 'research' ? '/solutions/scholars' :
                                    item.id === 'teams' ? '/solutions/teams' :
                                    item.id === 'enterprise' ? '/solutions/enterprise' :
                                    item.id === 'mission' ? '/docs/vision' :
                                    item.id === 'achievements' ? '/docs/impact' :
                                    item.id === 'help' ? '/docs' :
                                    '/login?signup=true'
                                  }
                                  className="nav-link-pro"
                                  style={{
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '0.75rem',
                                    textDecoration: 'none',
                                    transition: 'background 0.2s ease'
                                  }}
                                >
                                  <div style={{ color: '#10b981', marginTop: '0.1rem' }}>{item.icon}</div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ color: '#f3f4f6', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.1rem' }}>{item.title}</div>
                                    <div style={{ color: '#9ca3af', fontSize: '0.75rem', lineHeight: 1.5 }}>{item.desc}</div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            <Link href="/docs" style={{ padding: '0.5rem 0.75rem', color: '#9ca3af', fontWeight: 500, fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#f3f4f6')} onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}>Documentation</Link>
          </nav>
        </div>

        {/* Global Utilities & Authentication - Desktop Only */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
          className="hide-mobile-flex"
        >
          <a 
             href="mailto:support@groupflow2026.com" 
             title="Send Feedback"
             style={{ 
               background: 'rgba(16, 185, 129, 0.05)', 
               border: '1px solid rgba(16, 185, 129, 0.1)', 
               borderRadius: '6px', 
               padding: '0.4rem 0.6rem', 
               color: '#10b981',
               display: 'flex',
               alignItems: 'center',
               gap: '0.5rem',
               cursor: 'pointer',
               transition: 'all 0.2s ease',
               textDecoration: 'none',
               fontSize: '0.75rem',
               fontWeight: 600
             }}
             onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)')}
             onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)')}
          >
             <MessageSquarePlus size={14} /> Feedback
          </a>

          <button 
             className="nav-util-btn"
             style={{ 
               background: 'rgba(255,255,255,0.03)', 
               border: '1px solid #222222', 
               borderRadius: '6px', 
               padding: '0.4rem 0.75rem', 
               color: '#6b7280',
               fontSize: '0.75rem',
               display: 'flex',
               alignItems: 'center',
               gap: '3rem',
               cursor: 'pointer',
               transition: 'all 0.2s ease'
             }}
          >
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Search size={14} /> Search...
             </div>
             <div style={{ padding: '2px 4px', background: '#222222', borderRadius: '4px', fontSize: '0.65rem' }}>⌘K</div>
          </button>

          <Link 
            href="https://github.com/sospeterkedogo/groupflow" 
            target="_blank"
            style={{ color: '#9ca3af', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#f3f4f6')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
          >
             <Code size={16} /> <UserCount />
          </Link>

          <div style={{ height: '20px', width: '1px', background: '#222222' }} />

          <Link href="/login" style={{ color: '#f3f4f6', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, padding: '0.5rem 0.75rem' }}>Sign in</Link>
          <Link 
            href="/login?signup=true" 
            style={{ 
              background: '#10b981', 
              color: '#0a0a0a', 
              textDecoration: 'none', 
              fontSize: '0.875rem', 
              fontWeight: 650, 
              padding: '0.5rem 1rem', 
              borderRadius: '6px',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.1)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Start Project
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-only-flex"
          style={{ background: 'none', border: 'none', color: '#f3f4f6', cursor: 'pointer', padding: '0.5rem' }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'fixed',
                inset: 0,
                top: '64px',
                background: '#0a0a0a',
                zIndex: 2000,
                padding: '2rem',
                overflowY: 'auto'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                {Object.keys(navMenus).map((key) => (
                  <div key={key}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', marginBottom: '1rem' }}>
                      {(navMenus as any)[key].label}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {(navMenus as any)[key].categories.flatMap((cat: any) => cat.items).map((item: any) => (
                        <Link 
                          key={item.id}
                          href={
                              item.id === 'kanban' ? '/product/intelligence' :
                              item.id === 'sync' ? '/product/sync' :
                              item.id === 'roadmap' ? '/product/roadmap' :
                              item.id === 'research' ? '/solutions/scholars' :
                              item.id === 'teams' ? '/solutions/teams' :
                              item.id === 'enterprise' ? '/solutions/enterprise' :
                              item.id === 'mission' ? '/docs/vision' :
                              item.id === 'achievements' ? '/docs/impact' :
                              item.id === 'help' ? '/docs' :
                              '/login?signup=true'
                            }
                          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <div style={{ color: '#10b981' }}>{item.icon}</div>
                          <div style={{ color: '#f3f4f6', fontWeight: 600 }}>{item.title}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
                <div style={{ paddingTop: '1rem', borderTop: '1px solid #222', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                   <Link href="/docs" style={{ color: '#f3f4f6', textDecoration: 'none', fontWeight: 600 }} onClick={() => setIsMobileMenuOpen(false)}>Documentation</Link>
                   <Link href="/login" style={{ color: '#f3f4f6', textDecoration: 'none', fontWeight: 600 }} onClick={() => setIsMobileMenuOpen(false)}>Sign in</Link>
                   <Link href="/login?signup=true" style={{ background: '#10b981', color: '#0a0a0a', padding: '1rem', borderRadius: '8px', textAlign: 'center', fontWeight: 700, textDecoration: 'none' }} onClick={() => setIsMobileMenuOpen(false)}>Start Project</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main style={{ padding: '8rem 0', position: 'relative', zIndex: 10 }}>
        
        {/* Unified Architectural HERO */}
        <section 
          style={{ textAlign: 'center', padding: '0 2rem' }}
          className="hero-section-mobile"
        >
           
           <div style={{ 
             display: 'inline-flex', 
             alignItems: 'center', 
             gap: '0.6rem', 
             padding: '8px 20px', 
             background: 'rgba(16, 185, 129, 0.08)', 
             borderRadius: '6px', 
             color: '#10b981',
             fontSize: '0.7rem',
             fontWeight: 700,
             textTransform: 'uppercase',
             letterSpacing: '0.05em',
             marginBottom: '1.5rem',
             border: '1px solid rgba(16, 185, 129, 0.2)'
           }} className="hero-badge">
             <Sparkles size={14} /> Technical sync active
           </div>
           
           <h1 style={{ marginBottom: '1.5rem', color: '#f3f4f6', maxWidth: '1000px', margin: '0 auto 2rem', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.1 }} className="hero-title">
             Unified Academic <br />
             <span style={{ 
                background: 'linear-gradient(90deg, #10b981 0%, #f3f4f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>Collaboration Engine.</span>
           </h1>
           
           <p style={{ color: '#9ca3af', maxWidth: '750px', margin: '0 auto 4rem', fontWeight: 400, fontSize: '1.125rem', lineHeight: 1.6 }}>
              Professionalizing research output through real-time state persistence, verified contribution logging, and cross-departmental peer networking. 
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.25rem', color: '#10b981', fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.1em' }}>
                <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981', animation: 'pulse 1.5s infinite' }} />
                RECOGNITION FOR EVERY CONTRIBUTOR • LIVE ARCHIVE
              </span>
           </p>

           <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link 
                href="/login?signup=true&plan=pro" 
                style={{ 
                  background: '#10b981', 
                  color: '#0a0a0a', 
                  textDecoration: 'none', 
                  padding: '1.25rem 2.5rem', 
                  fontSize: '1.125rem', 
                  fontWeight: 900, 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  boxShadow: '0 10px 40px rgba(16, 185, 129, 0.25)',
                  transform: 'scale(1.05)',
                  transition: 'all 0.2s ease'
                }}
                className="hover-lift"
              >
                Try Pro Now <Zap size={20} fill="#0a0a0a" />
              </Link>
              <Link 
                href="/login?signup=true" 
                style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  color: '#f3f4f6', 
                  textDecoration: 'none', 
                  padding: '1.25rem 2.5rem', 
                  fontSize: '1.125rem', 
                  fontWeight: 650, 
                  borderRadius: '12px', 
                  border: '1px solid #222222',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem'
                }}
              >
                Start free project <ArrowRight size={18} />
              </Link>
           </div>

        </section>

        {/* INSTITUTIONAL MISSION SECTION */}
        <section id="mission" style={{ padding: '10rem 2rem', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
           <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '6rem', alignItems: 'center' }} className="grid-responsive">
              <div>
                 <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Global Scholarly Support</div>
                 <h2 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '2rem', letterSpacing: '-0.03em', lineHeight: 1.1, color: '#f3f4f6' }}>Bridging the gap in academic recognition.</h2>
                 <p style={{ fontSize: '1.125rem', color: '#9ca3af', lineHeight: 1.7, marginBottom: '3rem' }}>
                    Standard tools fail to capture the nuance of collaborative research. GroupFlow was architected to ensure that every participant—from lead creators to reviewers—receives verifiable recognition for their effort.
                 </p>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div style={{ background: '#111111', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222222' }}>
                       <div style={{ color: '#10b981', marginBottom: '1rem' }}><CheckCircle size={20} /></div>
                       <div style={{ fontWeight: 650, fontSize: '1rem', marginBottom: '0.5rem', color: '#f3f4f6' }}>Verifiable Output</div>
                       <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>Audit logs provide a transparent history of every project milestone.</p>
                    </div>
                    <div style={{ background: '#111111', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222222' }}>
                       <div style={{ color: '#10b981', marginBottom: '1rem' }}><Zap size={20} /></div>
                       <div style={{ fontWeight: 650, fontSize: '1rem', marginBottom: '0.5rem', color: '#f3f4f6' }}>Instant Sync</div>
                       <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>Synchronize across global departments without state loss.</p>
                    </div>
                 </div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #111111 0%, #0a0a0a 100%)', padding: '3rem', borderRadius: '16px', border: '1px solid #222222', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2.5rem' }}>
                    <div style={{ width: '42px', height: '42px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <img src="/logo.png" style={{ width: '24px', height: '24px' }} alt="Protocol" />
                    </div>
                    <div>
                       <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>SYSTEM STATUS</div>
                       <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#f3f4f6' }}>Peer-to-Peer Relay Active</div>
                    </div>
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {[
                       { label: 'Workforce Balance', val: 'Architectural', color: '#10b981' },
                       { label: 'Data Integrity', val: 'Encrypted', color: '#10b981' },
                       { label: 'Cloud Persistence', val: 'Real-time', color: '#10b981' }
                    ].map((stat, i) => (
                       <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{stat.label}</span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: stat.color }}>{stat.val}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </section>

        {/* UNIFIED CORE FEATURES GRID */}
        <section style={{ padding: '10rem 2rem' }}>
           <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                 <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Architectural Capabilities</div>
                 <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#f3f4f6', letterSpacing: '-0.03em' }}>Built for technical scholarship.</h2>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                 {features.map((feature, i) => (
                    <div key={i} style={{ padding: '2.5rem', background: '#111111', border: '1px solid #222222', borderRadius: '12px', transition: 'border-color 0.2s ease' }} className="nav-link-pro">
                       <div style={{ color: '#10b981', marginBottom: '1.5rem' }}>{feature.icon}</div>
                       <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f3f4f6', marginBottom: '1rem' }}>{feature.title}</h3>
                       <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.6 }}>{feature.desc}</p>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* REFINED FAQ SECTION */}
        <section style={{ padding: '10rem 2rem', background: '#0d0d0d', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
           <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                 <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#f3f4f6', letterSpacing: '-0.02em' }}>Technical FAQ</h2>
                 <p style={{ color: '#9ca3af', fontSize: '1rem', marginTop: '1rem' }}>Protocols and mission statements.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {faqs.map((faq, i) => (
                    <div key={i} style={{ padding: '1.5rem 2.5rem', background: '#111111', borderRadius: '12px', border: '1px solid #222222' }}>
                       <h4 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f3f4f6', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          {faq.q}
                          <ChevronRight size={18} style={{ color: '#10b981' }} />
                       </h4>
                       <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.6 }}>{faq.a}</p>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" style={{ padding: '10rem 2rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
           <PricingSection isLanding={true} />
        </section>

        {/* FINAL UNIFIED CTA */}
        <section style={{ padding: '10rem 2rem', textAlign: 'center' }}>
           <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'linear-gradient(rgba(16, 185, 129, 0.1), transparent)', padding: '6rem 3rem', borderRadius: '24px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <h2 style={{ fontSize: '3rem', fontWeight: 700, color: '#f3f4f6', marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>Start your mission.</h2>
              <p style={{ fontSize: '1.125rem', color: '#9ca3af', marginBottom: '3.5rem', maxWidth: '650px', margin: '0 auto 3.5rem', lineHeight: 1.6 }}>
                 Access individual research tiers, project workflows, and Peer-to-Peer recognition protocols. Free for verified students.
              </p>
              <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                 <Link href="/login?signup=true&plan=pro" style={{ background: '#10b981', color: '#0a0a0a', padding: '1.25rem 2.5rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 900, textDecoration: 'none', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.15)' }}>Try Pro Now</Link>
                 <Link href="/login?signup=true" style={{ border: '1px solid #222222', color: '#f3f4f6', padding: '1.25rem 2.5rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 650, textDecoration: 'none', background: 'rgba(255,255,255,0.02)' }}>Initialize Workspace</Link>
              </div>
           </div>
        </section>


      </main>

      <footer style={{ padding: '6rem 2rem', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', background: '#0a0a0a', position: 'relative', zIndex: 10 }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.5rem', fontWeight: 700, justifyContent: 'center', marginBottom: '2rem', color: '#f3f4f6' }}>
            <img src="/logo.png" style={{ width: '38px', height: '38px', borderRadius: '8px' }} alt="Protocol" /> GroupFlow2026
         </div>
         <p style={{ color: '#f3f4f6', fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>Built by Sospeter • Project Lead</p>

         <p style={{ color: '#6b7280', fontSize: '0.875rem', maxWidth: '500px', margin: '0 auto 4rem', lineHeight: 1.6 }}>
            Unified collaboration architecture for global academic initiatives. Designed for researchers, scholars, and institutional teams.
         </p>
         
         <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', opacity: 0.6 }}>
            <Link href="/login" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500 }}>Sign in</Link>
            <Link href="/login" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500 }}>Privacy Policy</Link>
            <Link href="/login" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500 }}>Global Terms</Link>
         </div>
      </footer>

      <CookieBanner />

      <style jsx>{`
        .fluid-h1 { line-height: 1.05; letter-spacing: -0.05em; }
        .hover-lift { transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease, border-color 0.4s ease; }
        .hover-lift:hover { transform: translateY(-12px); box-shadow: var(--shadow-xl); border-color: var(--brand); }
        .glass { backdrop-filter: blur(12px); }
        
        .nav-link-pro:hover {
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .nav-util-btn:hover {
          border-color: #444444 !important;
          color: #f3f4f6 !important;
          background: rgba(255,255,255,0.05) !important;
        }

        @media (min-width: 1024px) {
          .floating-element { display: block !important; }
        }

        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }

        @media (max-width: 1024px) {
          .hide-mobile-flex { display: none !important; }
          .mobile-only-flex { display: flex !important; }
          
          .hero-section-mobile {
            padding-top: 4rem !important;
            padding-bottom: 6rem !important;
            margin-bottom: 4rem !important;
          }

          .hero-title {
            font-size: clamp(2.2rem, 8vw, 3.5rem) !important;
          }

          .hero-badge {
            margin-bottom: 1.5rem !important;
          }
        }

        @media (min-width: 1025px) {
          .mobile-only-flex { display: none !important; }
          
          .hero-section-mobile {
            padding-top: 8rem !important;
            padding-bottom: 10rem !important;
            margin-bottom: 10rem !important;
          }

          .hero-title {
            font-size: clamp(3rem, 7vw, 4.5rem) !important;
          }
        }
      `}</style>
    </div>
  )
}
