'use client';

import React from 'react';
import { Post } from '@/lib/types';
import PostCard from '@/app/home/components/PostCard';

interface UserPostsProps {
  posts: Post[];
}

const UserPosts: React.FC<UserPostsProps> = ({ posts }) => {
  if (posts.length === 0) {
    return (
      <div className="px-6 pb-6">
        <div className="border-t border-gray-200 pt-6">
          <p className="text-center text-gray-500">No posts yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-6">
      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-semibold text-lg mb-4 text-gray-900">Posts</h3>
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserPosts;