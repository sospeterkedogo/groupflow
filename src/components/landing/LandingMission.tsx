'use client'

import { CheckCircle, Zap } from 'lucide-react'

export default function LandingMission() {
  return (
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
  )
}
