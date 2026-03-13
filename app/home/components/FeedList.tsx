import React from 'react';
import { Post } from '@/lib/types';
import PostCard from './PostCard';

interface FeedListProps {
  posts: Post[];
  onPostDelete?: (postId: string) => void;
}

const FeedList: React.FC<FeedListProps> = ({ posts, onPostDelete }) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {posts.map(post => (
        <PostCard key={post.id} post={post} onDelete={onPostDelete} />
      ))}
    </div>
  );
};

export default FeedList;