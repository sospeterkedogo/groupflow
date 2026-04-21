import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
})

// Allowed donation amounts in cents (min $1, max $10,000)
const MIN_CENTS = 100
const MAX_CENTS = 1_000_000

export async function POST(req: Request) {
  try {
    const { amountCents, donorEmail, donorName, message, featureTag, isAnonymous } = await req.json()

    const amount = parseInt(amountCents, 10)
    if (isNaN(amount) || amount < MIN_CENTS || amount > MAX_CENTS) {
      return NextResponse.json(
        { error: `Donation amount must be between $1.00 and $10,000.` },
        { status: 400 }
      )
    }

    const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://espeezy.com'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amount,
            product_data: {
              name: featureTag
                ? `Espeezy — ${featureTag}`
                : 'Espeezy — Mission Support Donation',
              description:
                'Your contribution funds free, equitable education tools for students worldwide.',
              images: [`${origin}/assets/og-image.png`],
            },
          },
          quantity: 1,
        },
      ],
      customer_email: isAnonymous ? undefined : (donorEmail ?? undefined),
      success_url: `${origin}/fund/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/fund`,
      billing_address_collection: 'auto',
      submit_type: 'donate',
      metadata: {
        type: 'donation',
        donor_name: isAnonymous ? 'Anonymous' : (donorName ?? ''),
        donor_email: isAnonymous ? '' : (donorEmail ?? ''),
        message: message ?? '',
        feature_tag: featureTag ?? 'general',
        is_anonymous: String(isAnonymous ?? false),
      },
    })

    if (!session.url) {
      throw new Error('No Stripe session URL returned.')
    }

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[donate] Stripe error:', err?.message)
    return NextResponse.json(
      { error: 'Could not initialize donation. Please try again.' },
      { status: 500 }
    )
  }
}
