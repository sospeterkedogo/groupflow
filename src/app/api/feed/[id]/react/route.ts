import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/utils/supabase/server'

// POST /api/feed/[id]/react  — add or toggle reaction
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { reaction } = await req.json()
  const validReactions = ['like', 'love', 'fire', 'clap', 'insightful', 'celebrate']
  if (!validReactions.includes(reaction)) {
    return NextResponse.json({ error: 'Invalid reaction' }, { status: 400 })
  }

  const svc = await createAdminClient()

  // Check if reaction already exists
  const { data: existing } = await svc
    .from('post_reactions')
    .select('reaction')
    .eq('post_id', params.id)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    if (existing.reaction === reaction) {
      // Toggle off
      await svc.from('post_reactions').delete().eq('post_id', params.id).eq('user_id', user.id)
      return NextResponse.json({ removed: true })
    } else {
      // Change reaction
      await svc.from('post_reactions').update({ reaction }).eq('post_id', params.id).eq('user_id', user.id)
      return NextResponse.json({ updated: true, reaction })
    }
  }

  await svc.from('post_reactions').insert({ post_id: params.id, user_id: user.id, reaction })
  return NextResponse.json({ added: true, reaction }, { status: 201 })
}

// DELETE /api/feed/[id]/react
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const svc = await createAdminClient()
  await svc.from('post_reactions').delete().eq('post_id', params.id).eq('user_id', user.id)
  return NextResponse.json({ removed: true })
}
