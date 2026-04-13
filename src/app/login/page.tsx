import { login, signup } from './actions'
import { AlertCircle } from 'lucide-react'

export default async function LoginPage(props: { searchParams?: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams
  const error = searchParams?.error

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome to GroupFlow</h1>
        <p className="auth-subtitle">Sign in to your account</p>
        
        {error && (
          <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email:</label>
            <input className="form-input" id="email" name="email" type="email" required />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password:</label>
            <input className="form-input" id="password" name="password" type="password" required />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button className="btn btn-primary" formAction={login}>Log in</button>
            <button className="btn btn-secondary" formAction={signup}>Sign up</button>
          </div>
        </form>
      </div>
    </div>
  )
}
