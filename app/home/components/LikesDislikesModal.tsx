'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getPostLikes, getPostDislikes } from '@/lib/posts';

interface LikesDislikesModalProps {
  postId: string;
  onClose: () => void;
  initialTab?: 'likes' | 'dislikes';
}

interface UserItem {
  created_at: string;
  profiles: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
}

const LikesDislikesModal: React.FC<LikesDislikesModalProps> = ({ 
  postId, 
  onClose,
  initialTab = 'likes'
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'likes' | 'dislikes'>(initialTab);
  const [likes, setLikes] = useState<UserItem[]>([]);
  const [dislikes, setDislikes] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [likesData, dislikesData] = await Promise.all([
          getPostLikes(postId),
          getPostDislikes(postId)
        ]);
        
        // Transform the data to match UserItem type
        const transformedLikes: UserItem[] = likesData.map((item: any) => ({
          created_at: item.created_at,
          profiles: item.profiles
        }));
        
        const transformedDislikes: UserItem[] = dislikesData.map((item: any) => ({
          created_at: item.created_at,
          profiles: item.profiles
        }));
        
        setLikes(transformedLikes);
        setDislikes(transformedDislikes);
      } catch (error) {
        console.error('Error loading likes/dislikes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [postId]);

  const handleUserClick = (userId: string) => {
    router.push(`/profile/${userId}`);
    onClose();
  };

  const currentList = activeTab === 'likes' ? likes : dislikes;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] sm:max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Reactions</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('likes')}
            className={`flex-1 py-3 text-center font-semibold transition-colors ${
              activeTab === 'likes'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Likes ({likes.length})
          </button>
          <button
            onClick={() => setActiveTab('dislikes')}
            className={`flex-1 py-3 text-center font-semibold transition-colors ${
              activeTab === 'dislikes'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Dislikes ({dislikes.length})
          </button>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : currentList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No {activeTab} yet
            </div>
          ) : (
            <div className="space-y-3">
              {currentList.map((item) => (
                <button
                  key={item.profiles.id}
                  onClick={() => handleUserClick(item.profiles.id)}
                  className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <img
                    src={item.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.profiles.username}`}
                    alt={item.profiles.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">{item.profiles.full_name}</p>
                    <p className="text-sm text-gray-500">@{item.profiles.username}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LikesDislikesModal;