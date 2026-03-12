'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfileHeader from '../components/ProfileHeader';
import FollowStats from '../components/FollowStats';
import FollowersList from '../components/FollowersList';
import FollowingList from '../components/FollowingList';
import UserPosts from '../components/UserPosts';
import { getUserProfile, getFollowers, getFollowing, followUser as followUserApi, unfollowUser as unfollowUserApi } from '@/lib/users';
import { getUserPosts } from '@/lib/posts';
import { getCurrentUser } from '@/lib/auth';
import { Post } from '@/lib/types';

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [profile, setProfile] = useState<any>(null);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserAvatar, setCurrentUserAvatar] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }

        setCurrentUserId(user.id);

        // If viewing own profile, redirect to /profile
        if (user.id === userId) {
          router.push('/profile');
          return;
        }

        // Get current user profile for navbar avatar
        const currentProfile = await getUserProfile(user.id);
        setCurrentUserAvatar(currentProfile.avatar_url || '');

        // Get target user's profile
        const profileData = await getUserProfile(userId);
        setProfile(profileData);

        const followersData = await getFollowers(userId);
        setFollowers(followersData);

        const followingData = await getFollowing(userId);
        setFollowing(followingData);

        // Get user's posts
        const userPostsData = await getUserPosts(userId);
        
        // Transform posts to match Post interface
        const transformedPosts: Post[] = userPostsData.map((post: any) => ({
          id: post.id,
          author: {
            id: post.profiles.id,
            name: post.profiles.full_name,
            username: post.profiles.username,
            avatar: post.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.profiles.username}`
          },
          content: post.content,
          image: post.image_url,
          likes: post.likes?.length || 0,
          comments: post.comments?.length || 0,
          timestamp: formatTimestamp(post.created_at),
          isLiked: post.isLiked || false,
          isBookmarked: false
        }));

        setPosts(transformedPosts);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadProfile();
    }
  }, [router, userId]);

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

  const handleFollowToggle = async () => {
    try {
      if (profile.isFollowing) {
        await unfollowUserApi(userId);
      } else {
        await followUserApi(userId);
      }

      // Refresh profile
      const updatedProfile = await getUserProfile(userId);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleFollowerFollowToggle = async (followerId: string) => {
    try {
      const follower = followers.find(f => f.id === followerId);
      if (follower?.isFollowing) {
        await unfollowUserApi(followerId);
      } else {
        await followUserApi(followerId);
      }

      setFollowers(followers.map(user => 
        user.id === followerId ? { ...user, isFollowing: !user.isFollowing } : user
      ));
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleUnfollow = async (followingId: string) => {
    try {
      await unfollowUserApi(followingId);
      setFollowing(following.filter(user => user.id !== followingId));
    } catch (error) {
      console.error('Error unfollowing:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentView="profile" userAvatar={currentUserAvatar} />
      
      <main className="max-w-4xl mx-auto px-4 pt-20 pb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <ProfileHeader 
            profile={{
              id: profile.id,
              name: profile.full_name,
              username: profile.username,
              avatar: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
              bio: profile.bio || '',
              followers: profile.followers,
              following: profile.following,
              posts: profile.posts,
              isFollowing: profile.isFollowing
            }}
            onFollowToggle={handleFollowToggle}
            onLogout={() => {}}
            isOwnProfile={false}
          />
          
          <FollowStats
            posts={profile.posts}
            followers={profile.followers}
            following={profile.following}
            onFollowersClick={() => setShowFollowers(!showFollowers)}
            onFollowingClick={() => setShowFollowing(!showFollowing)}
          />

          {showFollowers && (
            <FollowersList 
              users={followers} 
              onFollowToggle={handleFollowerFollowToggle}
            />
          )}

          {showFollowing && (
            <FollowingList 
              users={following} 
              onUnfollow={handleUnfollow}
            />
          )}

          {/* User Posts Section */}
          <UserPosts posts={posts} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}