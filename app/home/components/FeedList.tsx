import React from 'react';
import { Post } from '@/lib/types';
import PostCard from './PostCard';

interface FeedListProps {
  posts: Post[];
}

const FeedList: React.FC<FeedListProps> = ({ posts }) => {
  return (
    <div className="space-y-6">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default FeedList;