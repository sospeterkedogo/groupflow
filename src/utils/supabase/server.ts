import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// ─── ADMIN CLIENT SINGLETON ───────────────────────────────────────────────────
// The admin (service-role) client does NOT hold per-request state, so it is safe
// to reuse across requests within the same serverless function instance.
// This avoids the overhead of re-creating the PostgREST connection on each call.
let _adminClient: ReturnType<typeof createServerClient> | null = null

export async function createAdminClient() {
  if (!_adminClient) {
    _adminClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return [] },
          setAll() { /* no-op for admin client */ },
        },
        global: {
          headers: { 'x-application-name': 'espeezy-admin' },
        },
      }
    )
  }
  return _adminClient
}

// ─── PER-REQUEST AUTH CLIENT ──────────────────────────────────────────────────
// Must be created fresh per-request because it reads/writes auth cookies.
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — session middleware handles refresh
          }
        },
      },
    }
  )
}

