import { createClient } from '@/lib/supabase/client'

// Client-side auth functions ONLY
export const signUp = async (
  email: string,
  password: string,
  fullName: string,
  username: string
) => {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        username: username,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      },
    },
  })

  if (error) throw error
  return data
}

export const signIn = async (email: string, password: string) => {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export const signOut = async () => {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) throw error
  return user
}

export const getCurrentUserProfile = async () => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return profile
}

// Send password reset email
export const resetPassword = async (email: string) => {
  const supabase = createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw error
}

// Update password (used on the reset-password page after clicking email link)
export const updatePassword = async (newPassword: string) => {
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

// Change password (requires current session — used from profile settings)
export const changePassword = async (newPassword: string) => {
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

// Request email change — sets profile status to 'email_change_pending:<new_email>'
export const requestEmailChange = async (newEmail: string) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check current status
  const { data: profile } = await supabase
    .from('profiles')
    .select('status')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('Profile not found')
  if (profile.status === 'approved_email_changed') {
    throw new Error('Email has already been changed once. No further changes allowed.')
  }
  if (profile.status.startsWith('email_change_pending:')) {
    throw new Error('An email change request is already pending.')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ status: `email_change_pending:${newEmail}` })
    .eq('id', user.id)

  if (error) throw error
}

// Cancel email change request
export const cancelEmailChange = async () => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({ status: 'approved' })
    .eq('id', user.id)

  if (error) throw error
}

// Process approved email change — called by AuthGuard when status is 'email_change_approved:<email>'
export const processApprovedEmailChange = async (newEmail: string) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Call Supabase auth to update email (sends confirmation to new address)
  const { error: authError } = await supabase.auth.updateUser({ email: newEmail })
  if (authError) throw authError

  // Update profile status to mark email change as completed
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ status: 'approved_email_changed' })
    .eq('id', user.id)

  if (profileError) throw profileError
}