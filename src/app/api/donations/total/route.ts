import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createAdminClient()
    const { data, error } = await supabase.rpc('get_donation_total')
    if (error) throw error
    return NextResponse.json(data ?? { total_cents: 0, count: 0 })
  } catch {
    return NextResponse.json({ total_cents: 0, count: 0 })
  }
}
