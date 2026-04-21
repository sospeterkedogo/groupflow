import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/utils/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/services/email'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

// ── Auth helper ──────────────────────────────────────────────────────────────
async function requireAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
    .catch(() => ({ data: { user: null } }))
  if (!user) return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { user: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { user, error: null }
}

// ── GET /api/admin/email-campaigns ──────────────────────────────────────────
export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const admin = adminClient()
  const { data, error: dbErr } = await admin
    .from('marketing_campaigns')
    .select('id, title, subject, status, sent_count, created_at, sent_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json({ campaigns: data })
}

// ── Schema ───────────────────────────────────────────────────────────────────
const CampaignSchema = z.object({
  title:     z.string().min(1).max(200),
  subject:   z.string().min(1).max(300),
  preview:   z.string().max(200).optional(),
  html_body: z.string().min(1),
  text_body: z.string().optional(),
})

// ── POST /api/admin/email-campaigns ─────────────────────────────────────────
export async function POST(req: Request) {
  const { user, error: authErr } = await requireAdmin()
  if (authErr) return authErr

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 422 })
  }

  const parsed = CampaignSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { title, subject, preview, html_body, text_body } = parsed.data
  const admin = adminClient()

  // 1. Insert campaign as 'sending'
  const { data: campaign, error: insertErr } = await admin
    .from('marketing_campaigns')
    .insert({
      title, subject, preview, html_body, text_body,
      status: 'sending',
      created_by: user!.id,
    })
    .select()
    .single()

  if (insertErr || !campaign) {
    return NextResponse.json({ error: insertErr?.message ?? 'Insert failed' }, { status: 500 })
  }

  // 2. Fetch all opted-in users (marketing_emails = true)
  const { data: recipients } = await admin
    .from('profiles')
    .select('id, email, full_name')
    .eq('marketing_emails', true)
    .not('email', 'is', null)

  const list = recipients ?? []
  let sentCount = 0
  const errors: string[] = []

  // 3. Send emails in batches (avoid Vercel function timeout on huge lists)
  const BATCH = 20
  for (let i = 0; i < list.length; i += BATCH) {
    const batch = list.slice(i, i + BATCH)
    await Promise.allSettled(
      batch.map(async (r) => {
        try {
          // Personalise the body with a plain-text unsubscribe note
          const personalHtml = `${html_body}
<div style="margin-top:40px;padding-top:20px;border-top:1px solid #eee;font-size:12px;color:#999;text-align:center">
  You received this because you opted in to marketing updates.
  <a href="https://espeezy.com/dashboard/notifications" style="color:#10b981">Manage preferences</a>
</div>`
          await sendEmail({
            to: r.email,
            subject,
            html: personalHtml,
            text: text_body,
          })
          sentCount++
        } catch (e) {
          errors.push(`${r.email}: ${(e as Error).message}`)
        }
      })
    )
  }

  // 4. Insert persistent in-app notifications for opted-in users
  if (list.length > 0) {
    const notifRows = list.map((r) => ({
      user_id: r.id,
      type: 'marketing',
      title: subject,
      message: preview ?? text_body?.slice(0, 160) ?? 'New announcement from Espeezy.',
      link: null,
      read: false,
    }))
    // Insert in chunks to stay within PostgREST request size limits
    for (let i = 0; i < notifRows.length; i += 500) {
      await admin.from('notifications').insert(notifRows.slice(i, i + 500))
    }
  }

  // 5. Mark campaign sent
  const finalStatus = errors.length === list.length && list.length > 0 ? 'failed' : 'sent'
  await admin
    .from('marketing_campaigns')
    .update({ status: finalStatus, sent_count: sentCount, sent_at: new Date().toISOString() })
    .eq('id', campaign.id)

  return NextResponse.json({
    campaign_id: campaign.id,
    sent_count: sentCount,
    total_recipients: list.length,
    errors: errors.length > 0 ? errors : undefined,
  })
}
