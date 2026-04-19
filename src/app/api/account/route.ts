import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { checkBotId } from 'botid/server'

export async function GET(req: Request) {
  // BotID Verification
  const verification = await checkBotId()
  if (verification.isBot) {
    return new NextResponse('Automated request intercepted. Only verified scholars may export archives.', { status: 403 })
  }

  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse('Unauthorized Pipeline', { status: 401 })
    }

    // 1. Fetch Master Profile
    const { data: profile } = await supabase.from('profiles').select('*, groups(*)').eq('id', user.id).single()

    // 2. Fetch Supervised Tasks (using PostgreSQL Array contains logic)
    const { data: tasks } = await supabase.from('tasks').select('*').contains('assignees', [user.id])
    
    // 3. Fetch Delivered Evidence Pipeline
    const { data: artifacts } = await supabase.from('artifacts').select('*').eq('uploaded_by', user.id)

    // Assemble "Takeout" Package
    const exportData = {
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      identity: profile,
      execution_log: tasks || [],
      evidence_ledger: artifacts || []
    }

    // Deliver as JSON Blob
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="GroupFlow2026-archive-${user.id}.json"`
      }
    })

  } catch (err: any) {
    console.error("Export Engine Failure:", err)
    return new NextResponse(`Server Fault: ${err.message}`, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  // BotID Verification
  const verification = await checkBotId()
  if (verification.isBot) {
    return new NextResponse('Automated termination request intercepted. Only verified scholars may obliterate their identity.', { status: 403 })
  }

  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse('Unauthorized Pipeline', { status: 401 })
    }

    // Initialize Admin Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!serviceRoleKey) {
       return new NextResponse('Critical Architecture Fault: Missing Service Role Key bounds to perform global trace deletion.', { status: 500 })
    }

    const adminClient = createAdminClient(supabaseUrl, serviceRoleKey)

    // 1. Permanently Obliterate Auth Bounds (This automatically cascades via Database RLS policies deleting the profile)
    const { error } = await adminClient.auth.admin.deleteUser(user.id)
    
    if (error) {
       return new NextResponse(`Admin Deletion Fault: ${error.message}`, { status: 400 })
    }

    // Successfully purged.
    return new NextResponse('Account successfully terminated.', { status: 200 })

  } catch (err: any) {
    console.error("Termination Engine Failure:", err)
    return new NextResponse(`Server Fault: ${err.message}`, { status: 500 })
  }
}
