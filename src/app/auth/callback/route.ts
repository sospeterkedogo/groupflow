import { createServerSupabaseClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // next is the path to redirect to after success
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if this is a password recovery flow
      const { data: { user } } = await supabase.auth.getUser()
      const isRecovery = searchParams.get('type') === 'recovery' || !user?.last_sign_in_at
      
      const redirectPath = isRecovery ? '/auth/reset-password' : next
      const redirectUrl = new URL(redirectPath, origin).toString()
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Authentication failed. Please try again.`)
}
