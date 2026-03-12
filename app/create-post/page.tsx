'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PostForm from './components/PostForm';
import { createPost, uploadPostImage } from '@/lib/posts';
import { getCurrentUser, getCurrentUserProfile } from '@/lib/auth';

export default function CreatePostPage() {
  const router = useRouter();
  const [userAvatar, setUserAvatar] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
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
      } catch (error) {
        console.error('Error loading user:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const handlePostSubmit = async (content: string, imageFile: File | null) => {
    try {
      let imageUrl = null;

      // Upload image if provided
      if (imageFile) {
        imageUrl = await uploadPostImage(imageFile);
      }

      // Create post
      await createPost(content, imageUrl);
      
      // Redirect to home
      router.push('/home');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentView="create" userAvatar={userAvatar} />
      
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-8">
        <PostForm 
          userAvatar={userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=default`}
          onSubmit={handlePostSubmit}
        />
      </main>
      
      <Footer />
    </div>
  );
}