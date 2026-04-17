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

  // Get the stripe customer id from the profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    return new NextResponse(JSON.stringify({ error: 'No active subscription found. Please upgrade first.' }), { status: 400 })
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/dashboard/settings`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe Portal Error:', error)
    return new NextResponse(JSON.stringify({ error: error.message || 'Stripe portal creation failed.' }), { status: 500 })
  }
}
