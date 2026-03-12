'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Trash2, ThumbsDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Post } from '@/lib/types';
import UserAvatar from '@/components/UserAvatar';
import { likePost, unlikePost, dislikePost, undislikePost, deletePost } from '@/lib/posts';
import { getCurrentUser } from '@/lib/auth';
import CommentsModal from './CommentsModal';
import LikesDislikesModal from './LikesDislikesModal';

interface PostCardProps {
  post: Post;
  onDelete?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onDelete }) => {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isDisliked, setIsDisliked] = useState(post.isDisliked);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const [likes, setLikes] = useState(post.likes);
  const [dislikes, setDislikes] = useState(post.dislikes);
  const [comments, setComments] = useState(post.comments);
  const [isLiking, setIsLiking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showLikesDislikes, setShowLikesDislikes] = useState(false);
  const [likesDislikesTab, setLikesDislikesTab] = useState<'likes' | 'dislikes'>('likes');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  React.useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUser();
      if (user) setCurrentUserId(user.id);
    };
    loadUser();
  }, []);

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    const previousLikedState = isLiked;
    const previousDislikedState = isDisliked;
    const previousLikes = likes;
    const previousDislikes = dislikes;

    // Optimistic update
    if (isLiked) {
      setIsLiked(false);
      setLikes(likes - 1);
    } else {
      setIsLiked(true);
      setLikes(likes + 1);
      if (isDisliked) {
        setIsDisliked(false);
        setDislikes(dislikes - 1);
      }
    }

    try {
      if (isLiked) {
        await unlikePost(post.id);
      } else {
        await likePost(post.id);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      setIsLiked(previousLikedState);
      setIsDisliked(previousDislikedState);
      setLikes(previousLikes);
      setDislikes(previousDislikes);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDislike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    const previousLikedState = isLiked;
    const previousDislikedState = isDisliked;
    const previousLikes = likes;
    const previousDislikes = dislikes;

    // Optimistic update
    if (isDisliked) {
      setIsDisliked(false);
      setDislikes(dislikes - 1);
    } else {
      setIsDisliked(true);
      setDislikes(dislikes + 1);
      if (isLiked) {
        setIsLiked(false);
        setLikes(likes - 1);
      }
    }

    try {
      if (isDisliked) {
        await undislikePost(post.id);
      } else {
        await dislikePost(post.id);
      }
    } catch (error) {
      console.error('Error toggling dislike:', error);
      // Revert on error
      setIsLiked(previousLikedState);
      setIsDisliked(previousDislikedState);
      setLikes(previousLikes);
      setDislikes(previousDislikes);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    setIsDeleting(true);
    try {
      await deletePost(post.id);
      if (onDelete) {
        onDelete(post.id);
      }
    } catch (error: any) {
      console.error('Error deleting post:', error);
      alert(error.message || 'Failed to delete post');
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const handleProfileClick = () => {
    router.push(`/profile/${post.author.id}`);
  };

  const handleCommentAdded = () => {
    setComments(comments + 1);
  };

  const handleShowLikes = () => {
    setLikesDislikesTab('likes');
    setShowLikesDislikes(true);
  };

  const handleShowDislikes = () => {
    setLikesDislikesTab('dislikes');
    setShowLikesDislikes(true);
  };

  const isOwnPost = currentUserId === post.author.id;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div 
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleProfileClick}
            >
              <UserAvatar 
                src={post.author.avatar} 
                alt={post.author.name}
              />
              <div>
                <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                <p className="text-sm text-gray-500">@{post.author.username} · {post.timestamp}</p>
              </div>
            </div>
            
            {isOwnPost && (
              <div className="relative">
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5 text-gray-600" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{isDeleting ? 'Deleting...' : 'Delete Post'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <p className="text-gray-800 mb-4 leading-relaxed">{post.content}</p>
          
          {post.image && (
            <div className="mb-4 w-full overflow-hidden rounded-xl">
              <img
                src={post.image}
                alt="Post content"
                className="w-full h-auto object-cover"
              />
            </div>
          )}
          
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors group disabled:opacity-50"
            >
              <Heart 
                className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''} group-hover:scale-110 transition-transform`} 
              />
              <span 
                onClick={(e) => {
                  e.stopPropagation();
                  if (likes > 0) handleShowLikes();
                }}
                className="text-sm font-medium cursor-pointer hover:underline"
              >
                {likes}
              </span>
            </button>

            <button
              onClick={handleDislike}
              disabled={isLiking}
              className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors group disabled:opacity-50"
            >
              <ThumbsDown 
                className={`w-5 h-5 ${isDisliked ? 'fill-orange-500 text-orange-500' : ''} group-hover:scale-110 transition-transform`} 
              />
              <span 
                onClick={(e) => {
                  e.stopPropagation();
                  if (dislikes > 0) handleShowDislikes();
                }}
                className="text-sm font-medium cursor-pointer hover:underline"
              >
                {dislikes}
              </span>
            </button>
            
            <button 
              onClick={() => setShowComments(true)}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors group"
            >
              <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{comments}</span>
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

      {/* Comments Modal */}
      {showComments && (
        <CommentsModal 
          postId={post.id}
          postAuthorId={post.author.id}
          onClose={() => setShowComments(false)}
          initialCommentCount={comments}
          onCommentAdded={handleCommentAdded}
        />
      )}

      {/* Likes/Dislikes Modal */}
      {showLikesDislikes && (
        <LikesDislikesModal
          postId={post.id}
          onClose={() => setShowLikesDislikes(false)}
          initialTab={likesDislikesTab}
        />
      )}
    </>
  );
};

export default PostCard;