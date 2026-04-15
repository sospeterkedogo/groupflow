import Link from 'next/link'
import { ArrowRight, BookOpen, Activity, ShieldCheck, Users } from 'lucide-react'

export default function Home() {
  const dummyProjects = [
    { title: "Quantum React Architecture", students: 4, tasks: 24, score: "94%" },
    { title: "Neuro-Net Authentication", students: 3, tasks: 12, score: "88%" },
    { title: "Cyber-Physical UI Demo", students: 5, tasks: 31, score: "99%" },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="main-header" style={{ padding: '0 5%', justifyContent: 'space-between' }}>
        <div className="header-logo">
           <Activity className="text-accent-color" size={24} color="var(--accent-color)" />
           GroupFlow
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/login" className="btn btn-secondary">Sign In</Link>
          <Link href="/login" className="btn btn-primary">Get Started</Link>
        </div>
      </header>

      <main style={{ flex: 1, padding: '4rem 5%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Hero Section */}
        <div style={{ textAlign: 'center', maxWidth: '800px', marginBottom: '5rem' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1 }}>
            Team Fairness <br />through <span style={{ color: 'var(--accent-color)' }}>Proof of Work</span>.
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            The easiest way to track team projects. We see who is working and who isn't by tracking your files, points, and helping hands.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/login" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Launch Dashboard <ArrowRight size={20} />
            </Link>
            <a href="https://github.com/sospeterkedogo/groupflow" target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              <BookOpen size={20} /> Read Project Docs
            </a>
          </div>
        </div>

        {/* Live Demos Section */}
        <div style={{ width: '100%', maxWidth: '1000px', marginBottom: '5rem' }}>
           <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>Explore Live Module Simulators</h2>
           
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
             {dummyProjects.map((proj, idx) => (
                <div key={idx} style={{ 
                  backgroundColor: 'var(--card-bg)', 
                  border: `1px solid var(--border-color)`, 
                  borderRadius: 'var(--radius)', 
                  padding: '2rem', 
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                className="hover-card"
                >
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{proj.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={16} /> {proj.students} Students</span>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><ShieldCheck size={16} /> {proj.score} Validity</span>
                  </div>
                  <Link href="/dashboard" className="btn btn-secondary" style={{ width: '100%' }}>
                    View Project
                  </Link>
                </div>
             ))}
           </div>
        </div>

      </main>

      {/* Global CSS for the subtle hover effects */}
      <style dangerouslySetInnerHTML={{__html: `
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-md);
          border-color: var(--accent-color) !important;
        }
        @media (max-width: 768px) {
          h1 { font-size: 2.5rem !important; }
        }
      `}} />
    </div>
  )
}
