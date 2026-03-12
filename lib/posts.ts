import { createClient } from '@/lib/supabase/client'

export interface PostWithAuthor {
  id: string
  content: string
  image_url: string | null
  created_at: string
  user_id: string
  profiles: {
    id: string
    username: string
    full_name: string
    avatar_url: string | null
  }
  likes: { id: string; user_id: string }[]
  comments: { id: string }[]
}

// Get all posts for feed
export const getFeedPosts = async (userId: string) => {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .rpc('get_feed_posts', { 
      user_id: userId,
      page_limit: 50,
      page_offset: 0
    })

  if (error) {
    console.error('Error fetching feed:', error)
    throw error
  }
  
  return data
}

// Get all posts (alternative - direct query)
export const getAllPosts = async () => {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        full_name,
        avatar_url
      ),
      likes (
        id,
        user_id
      ),
      comments (
        id
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Create a new post
export const createPost = async (content: string, imageUrl?: string | null) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('posts')
    .insert([
      {
        user_id: user.id,
        content,
        image_url: imageUrl
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

// Like a post
export const likePost = async (postId: string) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('likes')
    .insert([
      {
        user_id: user.id,
        post_id: postId
      }
    ])

  if (error) throw error
}

// Unlike a post
export const unlikePost = async (postId: string) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id)

  if (error) throw error
}

// Upload post image to Supabase Storage
export const uploadPostImage = async (file: File) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${Math.random()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('post-images')
    .upload(fileName, file)

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('post-images')
    .getPublicUrl(fileName)

  return publicUrl
}