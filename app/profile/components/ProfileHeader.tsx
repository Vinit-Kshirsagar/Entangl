'use client';

import React from 'react';
import { UserProfile } from '@/lib/types';

interface ProfileHeaderProps {
  profile: UserProfile;
  onFollowToggle: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, onFollowToggle }) => {
  return (
    <>
      <div className="h-48 bg-gradient-to-r from-purple-400 via-pink-500 to-red-400"></div>
      
      <div className="px-6 pb-6">
        <div className="flex items-end justify-between -mt-16 mb-4">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
          />
          <button
            onClick={onFollowToggle}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              profile.isFollowing
                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
            }`}
          >
            {profile.isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
        <p className="text-gray-500 mb-3">@{profile.username}</p>
        <p className="text-gray-700 mb-4">{profile.bio}</p>
      </div>
    </>
  );
};

export default ProfileHeader;