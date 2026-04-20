import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient, createAdminClient } from '@/utils/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2022-11-15' })

// POST /api/hustle/connect — create Stripe Connect onboarding link
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const svc = await createAdminClient()

  // Fetch or create connected account
  const { data: profile } = await svc.from('profiles').select('stripe_account_id, stripe_account_status, account_status, full_name, email').eq('id', user.id).single()

  if (profile?.account_status === 'deactivated') {
    return NextResponse.json({ error: 'Your account has been permanently deactivated.' }, { status: 403 })
  }

  let accountId = profile?.stripe_account_id

  if (!accountId) {
    // Create a new Express Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      email: profile?.email ?? undefined,
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
      business_type: 'individual',
      metadata: { platform_user_id: user.id },
    })
    accountId = account.id

    await svc.from('profiles').update({
      stripe_account_id: accountId,
      stripe_account_status: 'pending',
    }).eq('id', user.id)
  }

  // Create onboarding link
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://flowspace.app'
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/dashboard/hustle/connect?refresh=1`,
    return_url: `${appUrl}/dashboard/hustle/connect?success=1`,
    type: 'account_onboarding',
  })

  await svc.from('profiles').update({ stripe_onboarding_url: accountLink.url }).eq('id', user.id)

  return NextResponse.json({ url: accountLink.url })
}

// GET /api/hustle/connect — check Connect account status
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const svc = await createAdminClient()
  const { data: profile } = await svc.from('profiles').select('stripe_account_id, stripe_account_status').eq('id', user.id).single()

  if (!profile?.stripe_account_id) {
    return NextResponse.json({ status: 'none' })
  }

  // Check with Stripe for current status
  try {
    const account = await stripe.accounts.retrieve(profile.stripe_account_id)
    const newStatus = account.payouts_enabled ? 'active' : (account.details_submitted ? 'restricted' : 'pending')

    if (newStatus !== profile.stripe_account_status) {
      await svc.from('profiles').update({ stripe_account_status: newStatus }).eq('id', user.id)
    }

    return NextResponse.json({
      status: newStatus,
      payoutsEnabled: account.payouts_enabled,
      chargesEnabled: account.charges_enabled,
      detailsSubmitted: account.details_submitted,
    })
  } catch {
    return NextResponse.json({ status: profile.stripe_account_status ?? 'unknown' })
  }
}
