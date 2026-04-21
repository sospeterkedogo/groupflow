import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/utils/supabase/server'
import { checkBotId } from 'botid/server'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia' as any,
})

const PLAN_CONFIG: Record<string, { priceEnvKey: string; mode: 'subscription' | 'payment'; label: string }> = {
  pro:      { priceEnvKey: 'STRIPE_PRICE_PRO_ID',      mode: 'subscription', label: 'Pro Scholar — $9/month' },
  premium:  { priceEnvKey: 'STRIPE_PRICE_PREMIUM_ID',  mode: 'subscription', label: 'Premium Scholar — $19/month' },
  lifetime: { priceEnvKey: 'STRIPE_PRICE_LIFETIME_ID', mode: 'payment',      label: 'Lifetime Founding Scholar — $149' },
}

export async function POST(req: Request) {
  // BotID Verification
  const verification = await checkBotId()
  if (verification.isBot) {
    return new NextResponse(JSON.stringify({ 
      error: 'Automated request detected. Please return to the dashboard and try again.' 
    }), { status: 403 })
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
    .catch(() => ({ data: { user: null } }))

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Authentication required.' }), { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const planKey = String(body?.plan ?? 'pro').toLowerCase()
  const config = PLAN_CONFIG[planKey]

  if (!config) {
    return new NextResponse(JSON.stringify({ error: 'Invalid plan selected.' }), { status: 422 })
  }

  const priceId = process.env[config.priceEnvKey]
  // Fallback: legacy env keys for backwards compatibility
  const fallbackPriceId = planKey === 'pro'
    ? process.env.STRIPE_PRICE_SUBSCRIPTION_ID
    : planKey === 'lifetime'
    ? process.env.STRIPE_PRICE_ONE_TIME_ID
    : undefined

  const resolvedPriceId = priceId ?? fallbackPriceId
  const successUrl = process.env.STRIPE_SUCCESS_URL
  const cancelUrl = process.env.STRIPE_CANCEL_URL

  if (!resolvedPriceId || !successUrl || !cancelUrl) {
    return new NextResponse(JSON.stringify({ error: 'Stripe is not configured correctly.' }), { status: 500 })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: config.mode,
      payment_method_types: ['card'],
      line_items: [{ price: resolvedPriceId, quantity: 1 }],
      customer_email: user.email ?? undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      metadata: {
        user_id: user.id,
        plan: planKey,
        product_label: config.label,
      },
    })

    if (!session.url) {
      throw new Error('Unable to initialize Stripe checkout session.')
    }

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: error.message || 'Stripe session creation failed.' }), { status: 500 })
  }
}
