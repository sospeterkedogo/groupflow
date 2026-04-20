import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient, createAdminClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2022-11-15' })

// GET /api/admin/tasks/[id] — admin fetch task by id
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const svc = await createAdminClient()
  const { data: adminProfile } = await svc.from('profiles').select('role').eq('id', user.id).single()
  if (adminProfile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const { data, error } = await svc.from('hustle_tasks').select('*').eq('id', id).single()
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

// POST /api/admin/payout — admin sends money to a user
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const svc = await createAdminClient()

  // Verify admin
  const { data: adminProfile } = await svc.from('profiles').select('role').eq('id', user.id).single()
  if (adminProfile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { recipient_id, amount_cents, note } = await req.json()
  if (!recipient_id || !amount_cents || amount_cents < 100) {
    return NextResponse.json({ error: 'recipient_id and amount_cents (min $1) required' }, { status: 400 })
  }

  const { data: recipient } = await svc
    .from('profiles')
    .select('stripe_account_id, stripe_account_status, full_name, account_status')
    .eq('id', recipient_id)
    .single()

  if (!recipient) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (!recipient.stripe_account_id || recipient.stripe_account_status !== 'active') {
    return NextResponse.json({ error: 'Recipient has no active bank account connected.' }, { status: 400 })
  }

  let transfer: Stripe.Transfer
  try {
    transfer = await stripe.transfers.create({
      amount: Math.round(amount_cents),
      currency: 'usd',
      destination: recipient.stripe_account_id,
      description: note ?? 'Admin payout from espeezy.com',
      metadata: {
        admin_id: user.id,
        recipient_id,
        note: note ?? '',
      },
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Stripe transfer failed'
    return NextResponse.json({ error: msg }, { status: 502 })
  }

  await svc.from('admin_payouts').insert({
    admin_id: user.id,
    recipient_id,
    amount_cents: Math.round(amount_cents),
    stripe_transfer_id: transfer.id,
    note: note ?? null,
  })

  try {
    await svc.rpc('log_activity', {
      p_user_id: user.id,
      p_action: 'admin_payout',
      p_resource_type: 'admin_payout',
      p_resource_id: transfer.id,
      p_metadata: { recipient_id, amount_cents, note },
      p_severity: 'warning',
    })
  } catch { /* non-critical log */ }

  return NextResponse.json({ success: true, transfer_id: transfer.id })
}
