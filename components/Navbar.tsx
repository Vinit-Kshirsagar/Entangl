'use client';

import React from 'react';
import { Search, Bell, Home, PlusSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  currentView?: string;
  userAvatar?: string;
}

const Navbar: React.FC<NavbarProps> = ({ 
  currentView = 'home',
  userAvatar = '../../SF25.jpg'
}) => {
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <button 
              onClick={() => router.push('/home')}
              className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
            >
              Entangl
            </button>
            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-80">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <button
              onClick={() => router.push('/home')}
              className={`p-2 rounded-lg transition-colors ${
                currentView === 'home' 
                  ? 'text-purple-600 bg-purple-50' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home className="w-6 h-6" />
            </button>
            <button
              onClick={() => router.push('/create-post')}
              className={`p-2 rounded-lg transition-colors ${
                currentView === 'create' 
                  ? 'text-purple-600 bg-purple-50' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <PlusSquare className="w-6 h-6" />
            </button>
            <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-purple-600"
            >
              <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;