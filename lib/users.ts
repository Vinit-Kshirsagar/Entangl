import { createClient } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  username: string
  full_name: string
  bio: string | null
  avatar_url: string | null
  created_at: string
}

// ... (keep existing functions)

// Update user profile
export const updateUserProfile = async (profileData: {
  full_name: string
  username: string
  bio: string
  avatar_url: string
}) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: profileData.full_name,
      username: profileData.username,
      bio: profileData.bio,
      avatar_url: profileData.avatar_url,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Upload avatar to Supabase Storage
export const uploadAvatar = async (file: File) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/avatar.${fileExt}`

  // Delete old avatar if exists
  await supabase.storage
    .from('avatars')
    .remove([fileName])

  // Upload new avatar
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  return publicUrl
}

// Get user profile with stats
export const getUserProfile = async (userId: string) => {
  const supabase = createClient()
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (profileError) throw profileError

  // Get follower count
  const { count: followerCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId)

  // Get following count
  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId)

  // Get post count
  const { count: postCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Check if current user follows this profile
  const { data: { user } } = await supabase.auth.getUser()
  let isFollowing = false
  
  if (user && user.id !== userId) {
    const { data: followData } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', userId)
      .single()
    
    isFollowing = !!followData
  }

  return {
    ...profile,
    followers: followerCount || 0,
    following: followingCount || 0,
    posts: postCount || 0,
    isFollowing
  }
}

// Follow a user
export const followUser = async (userId: string) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('follows')
    .insert([
      {
        follower_id: user.id,
        following_id: userId
      }
    ])

  if (error) throw error
}

// Unfollow a user
export const unfollowUser = async (userId: string) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', userId)

  if (error) throw error
}

// Get followers list
export const getFollowers = async (userId: string) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('follows')
    .select(`
      profiles:follower_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('following_id', userId)

  if (error) throw error

  // Check if current user follows each follower
  const followersWithStatus = await Promise.all(
    (data || []).map(async (item: any) => {
      const profile = item.profiles
      let isFollowing = false

      if (user && user.id !== profile.id) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', profile.id)
          .single()
        
        isFollowing = !!followData
      }

      return {
        id: profile.id,
        username: profile.username,
        name: profile.full_name,
        avatar: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
        isFollowing
      }
    })
  )

  return followersWithStatus
}

// Get following list
export const getFollowing = async (userId: string) => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('follows')
    .select(`
      profiles:following_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('follower_id', userId)

  if (error) throw error

  const following = (data || []).map((item: any) => ({
    id: item.profiles.id,
    username: item.profiles.username,
    name: item.profiles.full_name,
    avatar: item.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.profiles.username}`,
    isFollowing: true
  }))

  return following
}