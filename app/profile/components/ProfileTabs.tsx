'use client';

import React from 'react';

interface ProfileTabsProps {
  activeTab: 'posts' | 'followers' | 'following';
  onTabChange: (tab: 'posts' | 'followers' | 'following') => void;
  postCount: number;
  followerCount: number;
  followingCount: number;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  onTabChange,
  postCount,
  followerCount,
  followingCount
}) => {
  return (
    <div className="border-t border-gray-200">
      <div className="flex">
        <button
          onClick={() => onTabChange('posts')}
          className={`flex-1 py-4 text-center font-semibold transition-colors ${
            activeTab === 'posts'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Posts ({postCount})
        </button>
        <button
          onClick={() => onTabChange('followers')}
          className={`flex-1 py-4 text-center font-semibold transition-colors ${
            activeTab === 'followers'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Followers ({followerCount})
        </button>
        <button
          onClick={() => onTabChange('following')}
          className={`flex-1 py-4 text-center font-semibold transition-colors ${
            activeTab === 'following'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Following ({followingCount})
        </button>
      </div>
    </div>
  );
};

export default ProfileTabs;