import { createAdminClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const svc = await createAdminClient()
  const { data: profile } = await svc
    .from('profiles')
    .select('id, full_name, username, avatar_url, bio, role, subscription_plan, created_at, account_status')
    .eq('username', username)
    .single()

  if (!profile || profile.account_status === 'deactivated') notFound()

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '3rem 1rem' }}>
      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2rem', textAlign: 'center' }}>
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="" style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem', display: 'block', border: '3px solid #10B981' }} />
        ) : (
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1rem', border: '3px solid #10B981' }}>
            <span style={{ color: '#10B981', fontWeight: 900 }}>{profile.full_name?.[0]?.toUpperCase()}</span>
          </div>
        )}
        <h1 style={{ fontSize: '1.6rem', fontWeight: 950, letterSpacing: '-0.03em', margin: '0 0 0.3rem', color: '#F3F4F6' }}>{profile.full_name}</h1>
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: '#10B981', fontWeight: 700 }}>@{profile.username}</p>
        {profile.role === 'admin' && (
          <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', fontSize: '0.65rem', fontWeight: 900, padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>espeezy.com Team</span>
        )}
        {profile.bio && (
          <p style={{ margin: '1rem 0 0', fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>{profile.bio}</p>
        )}
        <p style={{ margin: '1.5rem 0 0', fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>
          Member since {new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
        </p>
      </div>
    </div>
  )
}
