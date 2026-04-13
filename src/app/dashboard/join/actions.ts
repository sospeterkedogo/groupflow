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
    .update({ group_id: newGroup.id })
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
  await supabase
    .from('profiles')
    .update({ group_id: group.id })
    .eq('id', user.id)

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}
