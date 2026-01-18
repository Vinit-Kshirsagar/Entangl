'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PostForm from './components/PostForm';

const mockUserAvatar = '../../SF25.jpg';

export default function CreatePostPage() {
  const router = useRouter();

  const handlePostSubmit = (content: string, image: string | null) => {
    // TODO: API call to create post
    console.log('Creating post:', { content, image });
    
    // Redirect to home after post creation
    router.push('/home');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentView="create" userAvatar={mockUserAvatar} />
      
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-8">
        <PostForm 
          userAvatar={mockUserAvatar} 
          onSubmit={handlePostSubmit}
        />
      </main>
      
      <Footer />
    </div>
  );
}