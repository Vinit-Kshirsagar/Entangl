'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, Trash2, CornerDownRight } from 'lucide-react';
import { getPostComments, addComment, addCommentReply, deleteComment } from '@/lib/posts';
import { getCurrentUser } from '@/lib/auth';

interface Reply {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  post_id: string;
  profiles: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
  replies?: Reply[];
}

interface CommentsModalProps {
  postId: string;
  postAuthorId: string;
  onClose: () => void;
  initialCommentCount: number;
  onCommentAdded?: () => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ 
  postId,
  postAuthorId,
  onClose, 
  initialCommentCount,
  onCommentAdded 
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getCurrentUser();
        if (user) setCurrentUserId(user.id);

        const commentsData = await getPostComments(postId);
        setComments(commentsData);
      } catch (error) {
        console.error('Error loading comments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const comment = await addComment(postId, newComment.trim());
      setComments([...comments, { ...comment, replies: [] }]);
      setNewComment('');
      if (onCommentAdded) onCommentAdded();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (commentId: string) => {
    if (!replyContent.trim() || submitting) return;

    setSubmitting(true);
    try {
      const reply = await addCommentReply(postId, commentId, replyContent.trim());
      
      setComments(comments.map(comment => 
        comment.id === commentId
          ? { ...comment, replies: [...(comment.replies || []), reply] }
          : comment
      ));
      
      setReplyContent('');
      setReplyingTo(null);
      if (onCommentAdded) onCommentAdded();
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    try {
      await deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
      if (onCommentAdded) onCommentAdded();
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    if (!confirm('Delete this reply?')) return;

    try {
      await deleteComment(replyId);
      setComments(comments.map(comment => 
        comment.id === commentId
          ? { ...comment, replies: comment.replies?.filter(r => r.id !== replyId) }
          : comment
      ));
      if (onCommentAdded) onCommentAdded();
    } catch (error) {
      console.error('Error deleting reply:', error);
      alert('Failed to delete reply');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 1) return 'just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const isPostAuthor = currentUserId === postAuthorId;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Comments ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="space-y-3">
                {/* Main Comment */}
                <div className="flex space-x-3">
                  <img
                    src={comment.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.profiles.username}`}
                    alt={comment.profiles.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-2xl px-4 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900">
                          {comment.profiles.full_name}
                        </p>
                        {currentUserId === comment.user_id && (
                          <button
                            onClick={() => handleDelete(comment.id)}
                            className="text-red-500 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-gray-800">{comment.content}</p>
                    </div>
                    <div className="flex items-center space-x-3 mt-1 ml-4">
                      <p className="text-xs text-gray-500">
                        {formatTimestamp(comment.created_at)}
                      </p>
                      {isPostAuthor && (
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="text-xs text-purple-600 hover:text-purple-700 font-semibold"
                        >
                          Reply
                        </button>
                      )}
                    </div>

                    {/* Reply Input for Post Author */}
                    {replyingTo === comment.id && (
                      <div className="mt-2 ml-4 flex items-center space-x-2">
                        <input
                          type="text"
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write a reply..."
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-full outline-none focus:border-purple-500"
                          disabled={submitting}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !submitting) {
                              handleReply(comment.id);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleReply(comment.id)}
                          disabled={!replyContent.trim() || submitting}
                          className="p-1.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 ml-6 space-y-2">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex space-x-2">
                            <CornerDownRight className="w-4 h-4 text-gray-400 mt-2" />
                            <div className="flex-1">
                              <div className="bg-purple-50 rounded-2xl px-3 py-2">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="font-semibold text-sm text-gray-900">
                                    {reply.profiles.full_name}
                                  </p>
                                  {currentUserId === reply.user_id && (
                                    <button
                                      onClick={() => handleDeleteReply(comment.id, reply.id)}
                                      className="text-red-500 hover:text-red-600 p-1"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                                <p className="text-sm text-gray-800">{reply.content}</p>
                              </div>
                              <p className="text-xs text-gray-500 mt-1 ml-3">
                                {formatTimestamp(reply.created_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full outline-none focus:border-purple-500 transition-colors"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentsModal;