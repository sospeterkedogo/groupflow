import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/server'
import { createHash } from 'crypto'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, fullName, institution, role, source, campaignRef } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    // Hash IP for deduplication without storing raw IP
    const ipHeader = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
    const ip = ipHeader.split(',')[0].trim()
    const ipHash = createHash('sha256').update(ip + process.env.IP_HASH_SALT!).digest('hex').slice(0, 16)
    const userAgent = req.headers.get('user-agent') ?? ''

    const supabase = await createAdminClient()

    const { error } = await supabase
      .from('pre_registrations')
      .insert({
        email: email.trim().toLowerCase(),
        full_name: fullName ?? null,
        institution: institution ?? null,
        role: role ?? 'student',
        source: source ?? 'organic',
        campaign_ref: campaignRef ?? null,
        ip_hash: ipHash,
        user_agent: userAgent.slice(0, 500),
      })

    if (error) {
      // Unique constraint = already registered
      if (error.code === '23505') {
        return NextResponse.json({ success: true, message: 'You are already registered! We will be in touch.' })
      }
      console.error('[preregister] DB error:', error)
      return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
    }

    // Fetch updated count
    const { data: countData } = await supabase.rpc('get_prereg_count')
    const count = countData ?? 0

    return NextResponse.json({
      success: true,
      message: 'You are on the list! We will notify you at launch.',
      count,
    })
  } catch (err) {
    console.error('[preregister] Unexpected error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createAdminClient()
    const { data, error } = await supabase.rpc('get_prereg_count')
    if (error) throw error
    return NextResponse.json({ count: data ?? 0 })
  } catch (err) {
    return NextResponse.json({ count: 0 })
  }
}
