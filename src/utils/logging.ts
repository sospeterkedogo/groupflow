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
  metadata: any = {}
) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('activity_log')
    .insert({
      user_id: userId,
      group_id: groupId,
      action_type: actionType,
      description,
      metadata
    })

  if (error) {
    console.error('Activity Logging Failed:', error)
  }
}
