'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FeedList from './components/FeedList';
import { Post } from '@/lib/types';

// Mock data - replace with API call later
const mockPosts: Post[] = [
  {
    id: '1',
    author: {
      id: '1',
      name: 'Vinit K',
      username: 'vinitk',
      avatar: '../../SF25.jpg'
    },
    content: 'Just deployed my new portfolio! Check it out and let me know what you think 🚀✨',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
    likes: 234,
    comments: 45,
    timestamp: '2h ago',
    isLiked: false,
    isBookmarked: false
  },
  {
    id: '2',
    author: {
      id: '2',
      name: 'Alex Chen',
      username: 'alexdev',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop'
    },
    content: 'Beautiful sunset at the beach today. Sometimes you just need to disconnect and enjoy nature 🌅',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop',
    likes: 567,
    comments: 89,
    timestamp: '5h ago',
    isLiked: true,
    isBookmarked: false
  },
  {
    id: '3',
    author: {
      id: '3',
      name: 'Emma Wilson',
      username: 'emmawrites',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop'
    },
    content: 'Working on my next big project! Can\'t wait to share it with you all. Stay tuned! 💻🎨',
    likes: 189,
    comments: 32,
    timestamp: '1d ago',
    isLiked: false,
    isBookmarked: true
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentView="home" />
      
      <main className="max-w-2xl mx-auto px-4 pt-20 pb-8">
        <FeedList posts={mockPosts} />
      </main>
      
      <Footer />
    </div>
  );
}