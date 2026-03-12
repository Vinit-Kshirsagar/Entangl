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
  dislikes: { id: string; user_id: string }[]
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

// Get all posts (direct query) - INCLUDES DISLIKES
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
      dislikes (
        id,
        user_id
      ),
      comments (
        id
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
  
  console.log('Raw posts from Supabase:', data);
  return data || [];
}

// Get posts by specific user - INCLUDES DISLIKES
export const getUserPosts = async (userId: string) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
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
      dislikes (
        id,
        user_id
      ),
      comments (
        id
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }
  
  // Transform the data to include isLiked and isDisliked status
  const transformedData = data?.map(post => ({
    ...post,
    isLiked: user ? post.likes?.some((like: any) => like.user_id === user.id) : false,
    isDisliked: user ? post.dislikes?.some((dislike: any) => dislike.user_id === user.id) : false
  }))
  
  return transformedData || [];
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

// Delete a post
export const deletePost = async (postId: string) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  // First, get the post to check ownership and get image URL
  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('user_id, image_url')
    .eq('id', postId)
    .single()

  if (fetchError) throw fetchError
  if (post.user_id !== user.id) throw new Error('Unauthorized')

  // Delete associated image from storage if exists
  if (post.image_url) {
    try {
      // Extract filename from URL
      const urlParts = post.image_url.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const folder = urlParts[urlParts.length - 2]
      
      if (fileName && folder) {
        await supabase.storage
          .from('post-images')
          .remove([`${folder}/${fileName}`])
      }
    } catch (error) {
      console.error('Error deleting image:', error)
    }
  }

  // Delete the post (likes, dislikes and comments will cascade delete)
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)

  if (error) throw error
}

// Like a post
export const likePost = async (postId: string) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  // Remove dislike if exists
  await supabase
    .from('dislikes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id)

  // Add like
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

// Dislike a post
export const dislikePost = async (postId: string) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  // Remove like if exists
  await supabase
    .from('likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id)

  // Add dislike
  const { error } = await supabase
    .from('dislikes')
    .insert([
      {
        user_id: user.id,
        post_id: postId
      }
    ])

  if (error) throw error
}

// Remove dislike from a post
export const undislikePost = async (postId: string) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('dislikes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id)

  if (error) throw error
}

// Get users who liked a post
export const getPostLikes = async (postId: string) => {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('likes')
    .select(`
      created_at,
      profiles:user_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching likes:', error);
    throw error;
  }
  
  return data || [];
}

// Get users who disliked a post
export const getPostDislikes = async (postId: string) => {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('dislikes')
    .select(`
      created_at,
      profiles:user_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching dislikes:', error);
    throw error;
  }
  
  return data || [];
}

// Upload post image to Supabase Storage
export const uploadPostImage = async (file: File) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `${user.id}/${fileName}`

  const { data, error } = await supabase.storage
    .from('post-images')
    .upload(filePath, file)

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('post-images')
    .getPublicUrl(filePath)

  return publicUrl
}

// Get comments for a post (includes replies)
export const getPostComments = async (postId: string) => {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        full_name,
        avatar_url
      ),
      replies:comments!parent_id (
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      )
    `)
    .eq('post_id', postId)
    .is('parent_id', null)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
  
  return data || [];
}

// Add a comment to a post
export const addComment = async (postId: string, content: string) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('comments')
    .insert([
      {
        user_id: user.id,
        post_id: postId,
        content
      }
    ])
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .single()

  if (error) throw error
  return data
}

// Add reply to a comment
export const addCommentReply = async (
  postId: string, 
  parentCommentId: string, 
  content: string
) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('comments')
    .insert([
      {
        user_id: user.id,
        post_id: postId,
        parent_id: parentCommentId,
        content
      }
    ])
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .single()

  if (error) throw error
  return data
}

// Delete a comment
export const deleteComment = async (commentId: string) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  // Check ownership
  const { data: comment, error: fetchError } = await supabase
    .from('comments')
    .select('user_id')
    .eq('id', commentId)
    .single()

  if (fetchError) throw fetchError
  if (comment.user_id !== user.id) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (error) throw error
}