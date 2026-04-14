import { createClient } from './supabase/client'

export type ActionType = 
  | 'task_created' 
  | 'task_updated' 
  | 'task_deleted' 
  | 'message_sent' 
  | 'message_deleted' 
  | 'setting_updated' 
  | 'theme_changed' 
  | 'privacy_toggled'
  | 'member_kicked'
  | 'artifact_uploaded'

export async function logActivity(
  userId: string, 
  groupId: string | null, 
  actionType: ActionType, 
  description: string, 
  metadata: any = {},
  notifyUserId?: string // Optional: targeted notification
) {
  const supabase = createClient()
  
  // 1. Audit Log Entry
  const { error: logError } = await supabase
    .from('activity_log')
    .insert({
      user_id: userId,
      group_id: groupId,
      action_type: actionType,
      description,
      metadata
    })

  if (logError) {
    console.error('Audit Logging Failed:', {
      action: actionType,
      error: logError.message || logError,
      code: (logError as any).code,
      details: (logError as any).details
    })
  }

  // 2. Real-time Notification Trigger (if applicable)
  if (notifyUserId) {
    await supabase.from('notifications').insert({
      user_id: notifyUserId,
      type: actionType,
      title: actionType.replace('_', ' ').toUpperCase(),
      message: description,
      link: '/dashboard'
    })
  } else if (actionType === 'task_created' || actionType === 'privacy_toggled') {
    // Broadcast notification to group members (conceptual)
    // For a real app, we'd use an Edge Function to scatter-gather.
    // For now, we target the current group if needed.
  }
}
