import { createClient } from '@/lib/supabase/client'

export interface Notification {
  id: string
  user_id: string
  actor_id: string
  type: 'follow' | 'like' | 'dislike' | 'comment' | 'reply'
  post_id: string | null
  comment_id: string | null
  is_read: boolean
  created_at: string
  actor: {
    id: string
    username: string
    full_name: string
    avatar_url: string | null
  }
  post?: {
    id: string
    content: string
    image_url: string | null
  } | null
}

// Get user's notifications
export const getNotifications = async (): Promise<Notification[]> => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      actor:actor_id (
        id,
        username,
        full_name,
        avatar_url
      ),
      post:post_id (
        id,
        content,
        image_url
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching notifications:', error)
    throw error
  }

  return (data as any[]).map(item => ({
    ...item,
    actor: Array.isArray(item.actor) ? item.actor[0] : item.actor,
    post: Array.isArray(item.post) ? item.post[0] : item.post
  })) as Notification[]
}

// Get unread notification count
export const getUnreadCount = async (): Promise<number> => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return 0

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) {
    console.error('Error fetching unread count:', error)
    return 0
  }

  return count || 0
}

// Mark notification as read
export const markAsRead = async (notificationId: string): Promise<void> => {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) throw error
}

// Mark all notifications as read
export const markAllAsRead = async (): Promise<void> => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) throw error
}

// Delete notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)

  if (error) throw error
}

// Subscribe to real-time notifications
export const subscribeToNotifications = (
  userId: string,
  callback: (notification: Notification) => void
): (() => void) => {
  const supabase = createClient()

  const channel = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      async (payload) => {
        // Fetch full notification details
        const { data } = await supabase
          .from('notifications')
          .select(`
            *,
            actor:actor_id (
              id,
              username,
              full_name,
              avatar_url
            ),
            post:post_id (
              id,
              content,
              image_url
            )
          `)
          .eq('id', payload.new.id)
          .single()

        if (data) {
          const notification = {
            ...data,
            actor: Array.isArray(data.actor) ? data.actor[0] : data.actor,
            post: Array.isArray(data.post) ? data.post[0] : data.post
          } as Notification
          callback(notification)
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Send push notification
export const sendPushNotification = async (
  userId: string,
  notification: {
    title: string;
    body: string;
    icon?: string;
    url?: string;
    notificationId?: string;
  }
): Promise<void> => {
  try {
    const response = await fetch('/api/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        notification
      })
    });

    if (!response.ok) {
      console.error('Failed to send push notification');
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}