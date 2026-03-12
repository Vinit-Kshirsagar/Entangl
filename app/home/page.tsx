'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FeedList from './components/FeedList';
import { Post } from '@/lib/types';
import { getAllPosts } from '@/lib/posts';
import { getCurrentUser, getCurrentUserProfile } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAvatar, setUserAvatar] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check auth
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }

        setCurrentUserId(user.id);

        // Get user profile for avatar
        const profile = await getCurrentUserProfile();
        if (profile?.avatar_url) {
          setUserAvatar(profile.avatar_url);
        } else {
          setUserAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`);
        }

        // Get posts from database
        const postsData = await getAllPosts();
        
        console.log('Fetched posts from DB:', postsData); // Debug log

        // Transform to match Post interface
        const transformedPosts: Post[] = postsData.map((post: any) => ({
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
          isLiked: post.likes?.some((like: any) => like.user_id === user.id) || false,
          isBookmarked: false
        }));

        console.log('Transformed posts:', transformedPosts); // Debug log
        setPosts(transformedPosts);
      } catch (error) {
        console.error('Error loading feed:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentView="home" userAvatar={userAvatar} />
      
      <main className="max-w-2xl mx-auto px-4 pt-20 pb-8">
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">No posts yet!</p>
            <p className="text-gray-400 mb-6">Be the first to create a post.</p>
            <button
              onClick={() => router.push('/create-post')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          <FeedList posts={posts} onPostDelete={(postId) => {
  setPosts(posts.filter(p => p.id !== postId));
}} />
        )}
      </main>
      
      <Footer />
    </div>
  );
}