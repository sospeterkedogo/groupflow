import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
})

const SUCCESS_URL = process.env.STRIPE_SUCCESS_URL || 'http://localhost:3000/dashboard/payment-success'
const CANCEL_URL = process.env.STRIPE_CANCEL_URL || 'http://localhost:3000/dashboard/marketplace'

/**
 * Portable Financial Service
 * Designed to be set-and-forget for multi-frontend reuse.
 */
export async function createCheckoutSession({
  userId,
  email,
  price,
  type,
  metadata = {}
}: {
  userId: string,
  email: string | undefined,
  price: number,
  type: 'subscription' | 'purchase',
  metadata?: Record<string, string>
}) {
  const isSubscription = type === 'subscription'
  
  // Platform Flux Fee calculation (5%)
  const amountToCharge = Math.round(price * 100) // Stripe uses cents
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // PRIORITIZE Apple Pay / Google Pay via automatic detection
    mode: isSubscription ? 'subscription' : 'payment',
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: metadata.product_name || 'GroupFlow2026 Flux Provision',
            description: metadata.description || 'Academic Resource Exchange',
          },
          unit_amount: amountToCharge,
          // If subscription, use recurring logic. For now, we assume marketplace is 'payment'
          ...(isSubscription && { recurring: { interval: 'month' } })
        },
        quantity: 1,
      },
    ],
    metadata: {
      user_id: userId,
      type,
      ...metadata,
    },
    success_url: `${SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: CANCEL_URL,
  })

  return session
}

export { stripe }
