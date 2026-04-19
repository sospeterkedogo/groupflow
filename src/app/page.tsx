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
        <section style={{ padding: '10rem 2rem', textAlign: 'center' }}>
           <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'linear-gradient(rgba(16, 185, 129, 0.1), transparent)', padding: '6rem 3rem', borderRadius: '24px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <h2 style={{ fontSize: '3rem', fontWeight: 700, color: '#f3f4f6', marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>Start your mission.</h2>
              <p style={{ fontSize: '1.125rem', color: '#9ca3af', marginBottom: '3.5rem', maxWidth: '650px', margin: '0 auto 3.5rem', lineHeight: 1.6 }}>
                 Access individual research tiers, project workflows, and Peer-to-Peer recognition protocols. Free for verified students.
              </p>
              <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                 <button onClick={() => setIsModalOpen(true)} style={{ background: '#10b981', color: '#0a0a0a', padding: '1.25rem 2.5rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 900, border: 'none', cursor: 'pointer', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.15)' }}>Join the Mission</button>
                 <a href="/login" style={{ border: '1px solid #222222', color: '#f3f4f6', padding: '1.25rem 2.5rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 650, textDecoration: 'none', background: 'rgba(255,255,255,0.02)' }}>Initialize Workspace</a>
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
