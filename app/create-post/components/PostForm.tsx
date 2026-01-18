'use client';

import React, { useState } from 'react';

interface PostFormProps {
  userAvatar: string;
  onSubmit: (content: string, image: string | null) => void;
}

const PostForm: React.FC<PostFormProps> = ({ userAvatar, onSubmit }) => {
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content, imagePreview);
      setContent('');
      setImagePreview(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Post</h2>
      
      <div className="flex items-start space-x-4 mb-4">
        <img
          src={userAvatar}
          alt="Your avatar"
          className="w-12 h-12 rounded-full object-cover"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="flex-1 resize-none outline-none text-lg p-3 border border-gray-200 rounded-xl focus:border-purple-400 transition-colors"
          rows={5}
        />
      </div>
      
      {imagePreview && (
        <div className="mb-4 relative">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full rounded-xl object-cover"
            style={{ maxHeight: '400px' }}
          />
          <button
            onClick={() => setImagePreview(null)}
            className="absolute top-3 right-3 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
          >
            ✕
          </button>
        </div>
      )}
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <label className="cursor-pointer px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
</svg>
<span className="font-medium">Add Photo</span>
<input
         type="file"
         accept="image/*"
         onChange={handleImageUpload}
         className="hidden"
       />
</label>
    <button
      onClick={handleSubmit}
      disabled={!content.trim()}
      className={`px-8 py-2.5 rounded-full font-semibold transition-all ${
        content.trim()
          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
      }`}
    >
      Post
    </button>
  </div>
</div>
);
};
export default PostForm;
