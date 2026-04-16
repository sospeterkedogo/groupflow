import { FatalError } from 'workflow'
import { createAdminClient } from '@/utils/supabase/server'

export type PaymentWorkflowPayload = {
  eventType: 'checkout.session.completed' | 'invoice.payment_succeeded' | 'invoice.payment_failed'
  sessionId: string | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  userId: string | null
  plan: string | null
  productLabel: string | null
  amountTotal: number | null
  currency: string | null
  mode: string | null
  status: string | null
}

export async function paymentWorkflow(payload: PaymentWorkflowPayload) {
  'use workflow'

  if (!payload.eventType) {
    throw new FatalError('Invalid payment event payload.')
  }

  const supabase = await createAdminClient()
  const userId = await resolveUserId(supabase, payload)

  if (!userId) {
    throw new FatalError('Unable to resolve payment owner.')
  }

  if (payload.eventType === 'checkout.session.completed') {
    await handleCheckoutCompleted(supabase, userId, payload)
    return { handled: true }
  }

  if (payload.eventType === 'invoice.payment_succeeded') {
    await handleInvoiceSucceeded(supabase, userId, payload)
    return { handled: true }
  }

  if (payload.eventType === 'invoice.payment_failed') {
    await handleInvoiceFailed(supabase, userId, payload)
    return { handled: true }
  }

  throw new FatalError('Unsupported payment event type.')
}

type SupabaseAdminClient = Awaited<ReturnType<typeof createAdminClient>>

async function resolveUserId(supabase: SupabaseAdminClient, payload: PaymentWorkflowPayload) {
  'use step'

  if (payload.userId) {
    return payload.userId
  }

  const filters = [
    payload.stripeSubscriptionId ? `stripe_subscription_id.eq.${payload.stripeSubscriptionId}` : null,
    payload.sessionId ? `stripe_session_id.eq.${payload.sessionId}` : null,
    payload.stripeCustomerId ? `stripe_customer_id.eq.${payload.stripeCustomerId}` : null
  ].filter(Boolean) as string[]

  if (filters.length === 0) {
    return null
  }

  const { data, error } = await supabase
    .from('payments')
    .select('user_id')
    .or(filters.join(','))
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data?.user_id ?? null
}

async function handleCheckoutCompleted(supabase: SupabaseAdminClient, userId: string, payload: PaymentWorkflowPayload) {
  'use step'

  const planLabel = payload.productLabel || (payload.plan === 'premium' ? 'Premium pre-registration' : 'Pro pre-registration')
  const status = payload.status === 'paid' || payload.status === 'complete' ? 'paid' : payload.status || 'pending'

  const { error: paymentError } = await supabase.from('payments').upsert([
    {
      user_id: userId,
      stripe_customer_id: payload.stripeCustomerId,
      stripe_subscription_id: payload.stripeSubscriptionId,
      stripe_session_id: payload.sessionId,
      price_type: payload.plan || 'pro',
      plan_label: planLabel,
      mode: payload.mode || 'payment',
      amount_total: payload.amountTotal,
      currency: payload.currency,
      status,
      metadata: {
        raw_status: payload.status,
        stripe_event: payload.eventType
      }
    }
  ], { onConflict: 'stripe_session_id' })

  if (paymentError) {
    throw new Error(paymentError.message)
  }

  await supabase.from('profiles').update({
    subscription_plan: payload.plan || 'pro',
    subscription_status: 'active',
    subscription_started_at: new Date().toISOString()
  }).eq('id', userId)

  await supabase.from('activity_log').insert([{
    user_id: userId,
    group_id: null,
    action_type: 'payment_completed',
    description: `Payment completed for ${planLabel}`,
    metadata: { stripe_session_id: payload.sessionId, amount_total: payload.amountTotal, currency: payload.currency }
  }])

  await supabase.from('notifications').insert([{
    user_id: userId,
    type: 'payment_completed',
    title: 'Payment confirmed',
    message: `Thank you! Your ${planLabel} has been received and your access is now secured.`,
    link: '/dashboard'
  }])
}

async function handleInvoiceSucceeded(supabase: SupabaseAdminClient, userId: string, payload: PaymentWorkflowPayload) {
  'use step'
  if (!payload.stripeSubscriptionId) {
    throw new FatalError('Missing subscription id for invoice payment success.')
  }
  const { error: updateError } = await supabase.from('payments').update({
    status: 'paid',
    amount_total: payload.amountTotal,
    currency: payload.currency,
    metadata: { stripe_event: payload.eventType }
  }).eq('stripe_subscription_id', payload.stripeSubscriptionId)

  if (updateError) {
    throw new Error(updateError.message)
  }

  await supabase.from('profiles').update({ subscription_status: 'active' }).eq('id', userId)

  await supabase.from('activity_log').insert([{
    user_id: userId,
    group_id: null,
    action_type: 'payment_completed',
    description: `Subscription payment succeeded for ${payload.productLabel || 'your plan'}`,
    metadata: { stripe_subscription_id: payload.stripeSubscriptionId, amount_total: payload.amountTotal }
  }])

  await supabase.from('notifications').insert([{
    user_id: userId,
    type: 'payment_completed',
    title: 'Subscription payment received',
    message: `Your plan payment was processed successfully. Access remains active.`,
    link: '/dashboard'
  }])
}

async function handleInvoiceFailed(supabase: SupabaseAdminClient, userId: string, payload: PaymentWorkflowPayload) {
  'use step'

  if (!payload.stripeSubscriptionId) {
    throw new FatalError('Missing subscription id for failed invoice event.')
  }

  await supabase.from('payments').update({
    status: 'failed',
    metadata: { stripe_event: payload.eventType }
  }).eq('stripe_subscription_id', payload.stripeSubscriptionId)

  await supabase.from('activity_log').insert([{
    user_id: userId,
    group_id: null,
    action_type: 'payment_failed',
    description: `Subscription payment failed for ${payload.productLabel || 'your plan'}`,
    metadata: { stripe_subscription_id: payload.stripeSubscriptionId, amount_total: payload.amountTotal }
  }])

  await supabase.from('notifications').insert([{
    user_id: userId,
    type: 'payment_failed',
    title: 'Payment issue',
    message: `We were unable to process your plan payment. Please update your payment details in Stripe.`,
    link: '/dashboard'
  }])
}
