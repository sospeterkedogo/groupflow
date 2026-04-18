'use server'

import { createServerSupabaseClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createGroup(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const groupName = (formData.get('name') as string || '').trim()
  const moduleCode = (formData.get('module_code') as string || '').trim().toUpperCase()
  const joinPassword = (formData.get('join_password') as string || '').trim()
  const capacity = parseInt(formData.get('capacity') as string || '5', 10)

  // Create the group
  const { data: newGroup, error: groupError } = await supabase
    .from('groups')
    .insert([{ 
      name: groupName, 
      module_code: moduleCode, 
      join_password: joinPassword,
      capacity: capacity 
    }])
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
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const moduleCode = (formData.get('module_code') as string || '').trim().toUpperCase()
  const joinPassword = (formData.get('join_password') as string || '').trim()

  // 1. Search for the group and its current member count
  const { data: group } = await supabase
    .from('groups')
    .select('id, join_password, capacity')
    .eq('module_code', moduleCode)
    .single()

  if (!group) {
    redirect('/dashboard/join?error=' + encodeURIComponent('Could not find a group with that Module Code.'))
  }

  // 2. Verify capacity
  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', group.id)

  if (count !== null && count >= (group.capacity || 5)) {
    redirect('/dashboard/join?error=' + encodeURIComponent(`Transmission Blocked: This research team has reached its maximum capacity of ${group.capacity} scholars.`))
  }

  // 3. Verify password
  if (group.join_password && group.join_password !== joinPassword) {
    redirect('/dashboard/join?error=' + encodeURIComponent('Incorrect Join Password for this module.'))
  }

  // 4. Update the user's profile to join this group
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
  const supabase = await createServerSupabaseClient()
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

export async function sendJoinRequest(groupId: string, senderName: string) {
  const { createAdminClient, createServerSupabaseClient } = await import('@/utils/supabase/server')
  const supabase = await createServerSupabaseClient()
  const adminSupabase = await createAdminClient()

  // 1. Verify the requester is actually logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // 2. Avoid duplicate join request messages for the same group
  const { data: existingRequest, error: fetchError } = await adminSupabase
    .from('messages')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .ilike('content', '%[JOIN REQUEST]%')
    .limit(1)
    .maybeSingle()

  if (fetchError) {
    throw new Error(fetchError.message)
  }

  if (existingRequest) {
    return { success: true, alreadySent: true }
  }

  const { error } = await adminSupabase.from('messages').insert({
    group_id: groupId,
    user_id: user.id,
    content: `👋 [JOIN REQUEST] I'd like to join the team. I'm ${senderName}.`,
    is_system: true
  })

  if (error) throw new Error(error.message)
  return { success: true }
}
