'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfileHeader from './components/ProfileHeader';
import FollowStats from './components/FollowStats';
import FollowersList from './components/FollowersList';
import FollowingList from './components/FollowingList';
import { UserProfile, FollowUser } from '@/lib/types';

// Mock data - replace with API call later
const mockProfile: UserProfile = {
  id: '1',
  name: 'Vinit K',
  username: 'vinitk',
  avatar: '../../SF25.jpg',
  bio: 'Full-stack developer | UI/UX enthusiast | Coffee lover ☕️',
  followers: 2847,
  following: 456,
  posts: 189,
  isFollowing: false
};

const mockFollowers: FollowUser[] = [
  { 
    id: '1', 
    name: 'Alex Chen', 
    username: 'alexdev', 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', 
    isFollowing: true 
  },
  { 
    id: '2', 
    name: 'Emma Wilson', 
    username: 'emmawrites', 
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop', 
    isFollowing: false 
  },
  { 
    id: '3', 
    name: 'John Doe', 
    username: 'johndoe', 
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop', 
    isFollowing: true 
  },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState(mockProfile);
  const [followers, setFollowers] = useState(mockFollowers);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const handleFollowToggle = () => {
    setProfile({ ...profile, isFollowing: !profile.isFollowing });
  };

  const handleFollowerFollowToggle = (userId: string) => {
    setFollowers(followers.map(user => 
      user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user
    ));
  };

  const handleUnfollow = (userId: string) => {
    setFollowers(followers.map(user => 
      user.id === userId ? { ...user, isFollowing: false } : user
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentView="profile" userAvatar={profile.avatar} />
      
      <main className="max-w-4xl mx-auto px-4 pt-20 pb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <ProfileHeader profile={profile} onFollowToggle={handleFollowToggle} />
          
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
              users={followers} 
              onUnfollow={handleUnfollow}
            />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}