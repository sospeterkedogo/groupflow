'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createGroup(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const groupName = formData.get('name') as string
  const moduleCode = formData.get('module_code') as string

  // Create the group
  const { data: newGroup, error: groupError } = await supabase
    .from('groups')
    .insert([{ name: groupName, module_code: moduleCode }])
    .select('id')
    .single()

  if (groupError || !newGroup) {
    redirect('/dashboard/join?error=' + encodeURIComponent(groupError?.message || 'Failed to create group'))
  }

  // Update the user's profile to join this group
  await supabase
    .from('profiles')
    .update({ 
      group_id: newGroup.id,
      role: 'admin' 
    })
    .eq('id', user.id)

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}

export async function joinGroup(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const moduleCode = formData.get('module_code') as string

  // Search for the group
  const { data: group } = await supabase
    .from('groups')
    .select('id')
    .eq('module_code', moduleCode)
    .single()

  if (!group) {
    redirect('/dashboard/join?error=' + encodeURIComponent('Could not find a group with that Module Code.'))
  }

  // Update the user's profile to join this group
  const { data: updatedProfile, error: updateError } = await supabase
    .from('profiles')
    .update({ group_id: group.id })
    .eq('id', user.id)
    .select('id')
    .single()

  if (updateError || !updatedProfile) {
    redirect('/dashboard/join?error=' + encodeURIComponent('Security Blocked: Database requires an UPDATE policy on the profiles table to allow assigning groups.'))
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}

export async function kickUser(userId: string) {
  const supabase = await createClient()
  const { data: { user: adminUser } } = await supabase.auth.getUser()
  if (!adminUser) return { error: 'Not authenticated' }

  // 1. Verify caller is admin of the same group
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('group_id, role')
    .eq('id', adminUser.id)
    .single()

  if (!adminProfile || adminProfile.role !== 'admin') {
    return { error: 'Unauthorized: Only admins can manage team members' }
  }

  // 2. Verify target user is in the same group and NOT an admin
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('group_id, role')
    .eq('id', userId)
    .single()

  if (!targetProfile || targetProfile.group_id !== adminProfile.group_id) {
    return { error: 'Target user not found in your team' }
  }

  if (targetProfile.role === 'admin') {
    return { error: 'Cannot kick another administrator' }
  }

  // 3. Kick the user (Reset group and role)
  const { error } = await supabase
    .from('profiles')
    .update({ 
      group_id: null,
      role: 'collaborator' 
    })
    .eq('id', userId)

  if (error) return { error: error.message }
  
  revalidatePath('/dashboard/settings')
  return { success: true }
}
