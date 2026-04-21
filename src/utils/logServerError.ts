/**
 * logServerError — write an unhandled server error to public.server_error_log
 * using the service-role client so RLS is bypassed.
 *
 * Call this inside catch blocks in API routes where you want errors to
 * surface on the admin dashboard.
 */

import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export interface ErrorLogPayload {
  route?: string
  method?: string
  message: string
  stack?: string
  userId?: string
  metadata?: Record<string, unknown>
}

export async function logServerError(payload: ErrorLogPayload): Promise<void> {
  try {
    const admin = getAdminClient()
    if (!admin) return

    await admin.from('server_error_log').insert({
      route:    payload.route   ?? null,
      method:   payload.method  ?? null,
      message:  payload.message.slice(0, 2000),
      stack:    payload.stack   ? payload.stack.slice(0, 2000) : null,
      user_id:  payload.userId  ?? null,
      metadata: payload.metadata ?? {},
    })
  } catch {
    // Never throw from error logger
  }
}
