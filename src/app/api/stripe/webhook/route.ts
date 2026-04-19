import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { start } from 'workflow/api'
import { paymentWorkflow, type PaymentWorkflowPayload } from '@/workflows/paymentWorkflow'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
})

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new NextResponse('Missing Stripe signature', { status: 400 })
  }

  const rawBody = Buffer.from(await req.arrayBuffer())

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error: any) {
    return new NextResponse(`Stripe webhook verification failed: ${error.message}`, { status: 400 })
  }

  const payload = buildWebhookPayload(event)
  if (!payload) {
    return new NextResponse('Event ignored', { status: 200 })
  }

  try {
    await start(paymentWorkflow, [payload as any])
    return new NextResponse('Webhook received', { status: 200 })
  } catch (error: any) {
    return new NextResponse(`Workflow startup failed: ${error.message}`, { status: 500 })
  }
}

function buildWebhookPayload(event: Stripe.Event) {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    return {
      eventType: event.type,
      sessionId: session.id,
      stripeCustomerId: session.customer?.toString() ?? null,
      stripeSubscriptionId: session.subscription?.toString() ?? null,
      userId: session.metadata?.user_id ?? session.client_reference_id ?? null,
      plan: session.metadata?.plan ?? 'pro',
      productLabel: session.metadata?.product_label ?? 'GroupFlow2026 pre-registration',
      amountTotal: session.amount_total ?? null,
      currency: session.currency ?? null,
      mode: session.mode ?? 'payment',
      status: session.payment_status ?? 'unknown',
      metadata: session.metadata ?? {}
    } as PaymentWorkflowPayload
  }

  if (event.type === 'invoice.payment_succeeded' || event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    return {
      eventType: event.type,
      sessionId: invoice.payment_intent?.toString() ?? invoice.id,
      stripeCustomerId: invoice.customer?.toString() ?? null,
      stripeSubscriptionId: invoice.subscription?.toString() ?? null,
      userId: null,
      plan: invoice.lines?.data?.[0]?.price?.nickname ?? 'subscription',
      productLabel: invoice.lines?.data?.[0]?.description ?? 'Subscription billing',
      amountTotal: invoice.amount_paid ?? invoice.amount_due ?? null,
      currency: invoice.currency ?? null,
      mode: invoice.billing_reason === 'subscription_cycle' ? 'subscription' : 'payment',
      status: invoice.status ?? 'unknown',
      invoiceId: invoice.id
    } as PaymentWorkflowPayload
  }

  return null
}
