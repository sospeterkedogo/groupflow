'use client'

import { useState } from 'react'
import { 
  Users, Activity, LayoutGrid, Code
} from 'lucide-react'
import { features, faqs, navMenus } from '@/config/landing'

// Component Imports
import PricingSection from '@/components/PricingSection'
import CookieBanner from '@/components/CookieBanner'
import LandingHeader from '@/components/landing/LandingHeader'
import LandingHero from '@/components/landing/LandingHero'
import LandingMission from '@/components/landing/LandingMission'
import LandingFeatures from '@/components/landing/LandingFeatures'
import LandingFAQ from '@/components/landing/LandingFAQ'
import LandingFooter from '@/components/landing/LandingFooter'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
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
             
             <div style={{ display: 'inline-flex', padding: '6px 14px', background: 'rgba(var(--brand-rgb), 0.1)', color: 'var(--brand)', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 950, marginBottom: '1.25rem', letterSpacing: '2px', border: '1px solid rgba(var(--brand-rgb), 0.2)' }}>
                STRATEGIC MISSION PROTOCOL
             </div>

             <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 950, marginBottom: '1.5rem', letterSpacing: '-0.04em', color: 'white', lineHeight: 1.1 }}>Authorizing Fairness in <br /><span style={{ color: 'var(--brand)' }}>Academic Capital.</span></h2>
             
             <div style={{ display: 'grid', gap: '2rem', fontSize: '1rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.6)' }}>
                <div>
                   <strong style={{ color: 'white', display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '1px' }}>Protocol 01: Visibility</strong>
                   GroupFlow eliminates opaque group dynamics. We ensure every intellectual contribution is audit-ready and attributed, securing fair recognition for all researchers.
                </div>
                <div>
                   <strong style={{ color: 'white', display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '1px' }}>Protocol 02: Integration</strong>
                   Our mandate is to bridge the gap between individual effort and institutional outcomes, scaling this toolkit across the global educational ecosystem.
                </div>
             </div>

             <button className="btn btn-primary" style={{ marginTop: '2.5rem', width: '100%', padding: '1.25rem', borderRadius: '20px', background: 'var(--brand)', color: '#0a0a0a', fontWeight: 950, fontSize: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(var(--brand-rgb), 0.3)' }} onClick={() => setIsModalOpen(false)}>
               Support Institutional Scale
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

      <LandingHeader navMenus={navMenus} />

      <main style={{ padding: '0', position: 'relative', zIndex: 10 }}>
        <LandingHero />
        <LandingMission />
        <LandingFeatures features={features} />
        <LandingFAQ faqs={faqs} />

        {/* PRICING SECTION */}
        <section id="pricing" style={{ padding: '10rem 2rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
           <PricingSection isLanding={true} />
        </section>

        {/* FINAL UNIFIED CTA */}
        <section style={{ padding: 'clamp(5rem, 15vw, 12rem) 2rem', textAlign: 'center', position: 'relative' }}>
           <div style={{ 
             maxWidth: '1200px', 
             margin: '0 auto', 
             background: 'linear-gradient(135deg, rgba(var(--brand-rgb), 0.08) 0%, rgba(0,0,0,0) 100%)', 
             padding: 'clamp(3rem, 10vw, 8rem) 2rem', 
             borderRadius: '56px', 
             border: '1px solid rgba(var(--brand-rgb), 0.15)',
             backdropFilter: 'blur(10px)',
             position: 'relative',
             overflow: 'hidden'
           }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 50% 120%, rgba(var(--brand-rgb), 0.15), transparent 70%)', pointerEvents: 'none' }} />
              
              <h2 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: 950, color: '#f3f4f6', marginBottom: '1.5rem', letterSpacing: '-0.05em', lineHeight: 1 }}>Begin your mission.</h2>
              <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.5)', marginBottom: '4rem', maxWidth: '700px', margin: '0 auto 4rem', lineHeight: 1.4, fontWeight: 500 }}>
                 Authorize individual research nodes, synchronize project workflows, and implement peer-to-Peer recognition protocols. 
                 <br /><span style={{ color: 'var(--brand)', fontWeight: 800 }}>Institutional clearance remains free for verified academic specialists.</span>
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
                 <button onClick={() => setIsModalOpen(true)} style={{ background: 'var(--brand)', color: '#0a0a0a', padding: '1.4rem 3.5rem', borderRadius: '24px', fontSize: '1.1rem', fontWeight: 950, border: 'none', cursor: 'pointer', boxShadow: '0 20px 40px rgba(var(--brand-rgb), 0.3)', transition: '0.3s' }}>Secure Clearance</button>
                 <a href="/login" style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '1.4rem 3.5rem', borderRadius: '24px', fontSize: '1.1rem', fontWeight: 800, textDecoration: 'none', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', transition: '0.3s' }}>Initialize Workspace</a>
              </div>
           </div>
        </section>
      </main>

      <LandingFooter />
      <CookieBanner />

      <style jsx>{`
        .fluid-h1 { line-height: 1.05; letter-spacing: -0.05em; }
        .hover-lift { transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease, border-color 0.4s ease; }
        .hover-lift:hover { transform: translateY(-12px); box-shadow: var(--shadow-xl); border-color: var(--brand); }
        .glass { backdrop-filter: blur(12px); }
        
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
