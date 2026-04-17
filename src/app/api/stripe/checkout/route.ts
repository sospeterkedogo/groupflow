import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/utils/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
})

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return new NextResponse(JSON.stringify({ error: 'Authentication required.' }), { status: 401 })
  }

  const { plan } = await req.json()
  const selectedPlan = plan === 'premium' ? 'premium' : 'pro'
  const isSubscription = selectedPlan === 'pro'

  const priceId = isSubscription
    ? process.env.STRIPE_PRICE_SUBSCRIPTION_ID
    : process.env.STRIPE_PRICE_ONE_TIME_ID

  const successUrl = process.env.STRIPE_SUCCESS_URL
  const cancelUrl = process.env.STRIPE_CANCEL_URL

  if (!priceId || !successUrl || !cancelUrl) {
    return new NextResponse(JSON.stringify({ error: 'Stripe is not configured correctly.' }), { status: 500 })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email ?? undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      metadata: {
        user_id: user.id,
        plan: selectedPlan,
        product_label: isSubscription ? 'Pro Mission Support' : 'Premium Mission Support'
      }
    })

    if (!session.url) {
      throw new Error('Unable to initialize Stripe checkout session.')
    }

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: error.message || 'Stripe session creation failed.' }), { status: 500 })
  }
}
