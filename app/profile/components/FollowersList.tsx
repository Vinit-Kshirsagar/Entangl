import React from 'react';
import { Users, UserCheck, UserPlus } from 'lucide-react';
import { FollowUser } from '@/lib/types';

interface FollowersListProps {
  users: FollowUser[];
  onFollowToggle: (userId: string) => void;
}

const FollowersList: React.FC<FollowersListProps> = ({ users, onFollowToggle }) => {
  return (
    <div className="border-t border-gray-200 pt-4 mt-4 px-6">
      <h3 className="font-semibold text-lg mb-3 flex items-center">
        <Users className="w-5 h-5 mr-2" />
        Followers
      </h3>
      <div className="space-y-3">
        {users.map(user => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
              <div>
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
            </div>
            <button 
              onClick={() => onFollowToggle(user.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center ${
                user.isFollowing
                  ? 'bg-gray-200 text-gray-800'
                  : 'bg-purple-600 text-white'
              }`}
            >
              {user.isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowersList;