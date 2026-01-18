import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Entangl
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Connect, Share, Inspire
            </p>
          </div>
          
          <div className="flex space-x-6 text-sm text-gray-600">
            <a href="#" className="hover:text-purple-600 transition-colors">About</a>
            <a href="#" className="hover:text-purple-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-purple-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-purple-600 transition-colors">Help</a>
          </div>
        </div>
        
        <div className="text-center mt-6 text-sm text-gray-500">
          © 2024 Entangl. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;