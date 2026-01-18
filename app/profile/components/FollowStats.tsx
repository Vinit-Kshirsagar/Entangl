import React from 'react';

interface FollowStatsProps {
  posts: number;
  followers: number;
  following: number;
  onFollowersClick: () => void;
  onFollowingClick: () => void;
}

const FollowStats: React.FC<FollowStatsProps> = ({
  posts,
  followers,
  following,
  onFollowersClick,
  onFollowingClick
}) => {
  return (
    <div className="flex items-center space-x-6 mb-6 px-6">
      <div>
        <span className="font-bold text-gray-900">{posts}</span>
        <span className="text-gray-600 ml-1">Posts</span>
      </div>
      <button onClick={onFollowersClick} className="hover:underline">
        <span className="font-bold text-gray-900">{followers}</span>
        <span className="text-gray-600 ml-1">Followers</span>
      </button>
      <button onClick={onFollowingClick} className="hover:underline">
        <span className="font-bold text-gray-900">{following}</span>
        <span className="text-gray-600 ml-1">Following</span>
      </button>
    </div>
  );
};

export default FollowStats;