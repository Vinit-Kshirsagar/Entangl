'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfileHeader from './components/ProfileHeader';
import FollowStats from './components/FollowStats';
import FollowersList from './components/FollowersList';
import FollowingList from './components/FollowingList';
import UserPosts from './components/UserPosts';
import { getUserProfile, getFollowers, getFollowing, followUser as followUserApi, unfollowUser as unfollowUserApi } from '@/lib/users';
import { getUserPosts } from '@/lib/posts';
import { getCurrentUser } from '@/lib/auth';
import { signOut } from '@/lib/auth';
import { Post } from '@/lib/types';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }

        setCurrentUserId(user.id);

        const profileData = await getUserProfile(user.id);
        setProfile(profileData);

        const followersData = await getFollowers(user.id);
        setFollowers(followersData);

        const followingData = await getFollowing(user.id);
        setFollowing(followingData);

        // Get user's posts
        const userPostsData = await getUserPosts(user.id);
        
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
          dislikes: post.dislikes?.length || 0,
          isDisliked: post.isDisliked || false,
          isBookmarked: false
        }));

        setPosts(transformedPosts);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

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

  const handleFollowerFollowToggle = async (userId: string) => {
    try {
      const follower = followers.find(f => f.id === userId);
      if (follower?.isFollowing) {
        await unfollowUserApi(userId);
      } else {
        await followUserApi(userId);
      }

      setFollowers(followers.map(user => 
        user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user
      ));
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      await unfollowUserApi(userId);
      setFollowing(following.filter(user => user.id !== userId));
      
      // Refresh profile to update counts
      const user = await getCurrentUser();
      if (user) {
        const profileData = await getUserProfile(user.id);
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error unfollowing:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
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
      <Navbar currentView="profile" userAvatar={profile.avatar_url} />
      
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
              isFollowing: false
            }}
            onFollowToggle={() => {}}
            onLogout={handleLogout}
            isOwnProfile={true}
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