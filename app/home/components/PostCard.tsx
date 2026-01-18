'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { Post } from '@/lib/types';
import UserAvatar from '@/components/UserAvatar';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const [likes, setLikes] = useState(post.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <UserAvatar 
              src={post.author.avatar} 
              alt={post.author.name}
            />
            <div>
              <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
              <p className="text-sm text-gray-500">@{post.author.username} · {post.timestamp}</p>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <p className="text-gray-800 mb-4 leading-relaxed">{post.content}</p>
        
        {post.image && (
          <img
            src={post.image}
            alt="Post content"
            className="w-full rounded-xl object-cover mb-4"
            style={{ maxHeight: '400px' }}
          />
        )}
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <button
            onClick={handleLike}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors group"
          >
            <Heart 
              className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''} group-hover:scale-110 transition-transform`} 
            />
            <span className="text-sm font-medium">{likes}</span>
          </button>
          
          <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors group">
            <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">{post.comments}</span>
          </button>
          
          <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors group">
            <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className="flex items-center space-x-2 text-gray-600 hover:text-yellow-500 transition-colors group"
          >
            <Bookmark 
              className={`w-5 h-5 ${isBookmarked ? 'fill-yellow-500 text-yellow-500' : ''} group-hover:scale-110 transition-transform`} 
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;