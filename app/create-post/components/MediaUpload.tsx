import React from 'react';

interface MediaUploadProps {
  onImageSelect: (file: File) => void;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ onImageSelect }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <label className="cursor-pointer px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center space-x-2">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
        />
      </svg>
      <span className="font-medium">Add Photo</span>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </label>
  );
};

export default MediaUpload;