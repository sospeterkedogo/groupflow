import Link from 'next/link';

export default function Home() {
  return (
    <div className="dashboard-layout">
      <header className="main-header">
        <div className="header-logo">
          GroupFlow
        </div>
        <div>
          <Link href="/login" className="btn btn-primary">Login</Link>
        </div>
      </header>
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--primary-color)', marginBottom: '1rem' }}>
          Automating Accountability
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '2rem' }}>
          A Data-Driven Collaboration Platform for Mitigating Social Loafing in Undergraduate Software Engineering Modules.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/login" className="btn btn-primary">Get Started</Link>
        </div>
      </main>
    </div>
  );
}
