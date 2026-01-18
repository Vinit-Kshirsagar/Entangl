import React from 'react';
import { Users, UserCheck } from 'lucide-react';
import { FollowUser } from '@/lib/types';

interface FollowingListProps {
  users: FollowUser[];
  onUnfollow: (userId: string) => void;
}

const FollowingList: React.FC<FollowingListProps> = ({ users, onUnfollow }) => {
  return (
    <div className="border-t border-gray-200 pt-4 mt-4 px-6">
      <h3 className="font-semibold text-lg mb-3 flex items-center">
        <Users className="w-5 h-5 mr-2" />
        Following
      </h3>
      <div className="space-y-3">
        {users.filter(u => u.isFollowing).map(user => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
              <div>
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
            </div>
            <button 
              onClick={() => onUnfollow(user.id)}
              className="px-4 py-1.5 rounded-full text-sm font-semibold bg-gray-200 text-gray-800 flex items-center"
            >
              <UserCheck className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowingList;