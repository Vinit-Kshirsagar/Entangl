'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, UserPlus, ThumbsDown, CornerDownRight, Trash2, CheckCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, subscribeToNotifications, Notification } from '../../lib/notifications';
import { getCurrentUser, getCurrentUserProfile } from '@/lib/auth';
import PushSettings from './components/PushSettings';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAvatar, setUserAvatar] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const profile = await getCurrentUserProfile();
        if (profile?.avatar_url) {
          setUserAvatar(profile.avatar_url);
        }

        const notificationsData = await getNotifications();
        setNotifications(notificationsData);

        // Subscribe to real-time notifications
        const unsubscribe = subscribeToNotifications(user.id, (newNotification) => {
          setNotifications(prev => [newNotification, ...prev]);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.is_read) {
        await markAsRead(notification.id);
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, is_read: true } : n
        ));
      }

      // Navigate based on notification type
      if (notification.type === 'follow') {
        router.push(`/profile/${notification.actor_id}`);
      } else if (notification.post_id) {
        router.push(`/home`); // You could navigate to specific post
      }
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return <UserPlus className="w-5 h-5 text-purple-600" />;
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'dislike':
        return <ThumbsDown className="w-5 h-5 text-orange-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'reply':
        return <CornerDownRight className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getNotificationText = (notification: Notification) => {
    const actorName = notification.actor.full_name;
    
    switch (notification.type) {
      case 'follow':
        return `${actorName} started following you`;
      case 'like':
        return `${actorName} liked your post`;
      case 'dislike':
        return `${actorName} disliked your post`;
      case 'comment':
        return `${actorName} commented on your post`;
      case 'reply':
        return `${actorName} replied to your comment`;
      default:
        return '';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 1) return 'just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentView="notifications" userAvatar={userAvatar} />
      
      <main className="max-w-2xl mx-auto px-4 pt-32 md:pt-20 pb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 text-sm font-semibold"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          // Add this inside the main container, before notifications list:
          <div className="p-4 border-b border-gray-200">
            <PushSettings />
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p className="text-lg mb-2">No notifications yet</p>
                <p className="text-sm">When someone interacts with your content, you'll see it here</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.is_read ? 'bg-purple-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={notification.actor.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notification.actor.username}`}
                      alt={notification.actor.full_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            {getNotificationIcon(notification.type)}
                            <p className="text-sm text-gray-900 font-medium">
                              {getNotificationText(notification)}
                            </p>
                          </div>
                          {notification.post && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {notification.post.content}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTimestamp(notification.created_at)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          className="p-1 hover:bg-red-50 rounded-full transition-colors ml-2"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                      {notification.post?.image_url && (
                        <img
                          src={notification.post.image_url}
                          alt="Post"
                          className="mt-2 w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}