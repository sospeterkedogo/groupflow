import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { summary } = await req.json()

  const svc = await createAdminClient()
  const { data: ticket, error } = await svc
    .from('support_tickets')
    .insert({ user_id: user.id, summary: summary?.slice(0, 2000) ?? '', status: 'escalated' })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ticket_id: ticket.id }, { status: 201 })
}
