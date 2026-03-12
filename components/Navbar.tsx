'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Home, PlusSquare, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { searchUsers } from '@/lib/users';

interface NavbarProps {
  currentView?: string;
  userAvatar?: string;
}

interface SearchResult {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
}

const Navbar: React.FC<NavbarProps> = ({ 
  currentView = 'home',
  userAvatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const results = await searchUsers(searchQuery);
          setSearchResults(results);
          setShowResults(true);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleUserClick = (userId: string) => {
    router.push(`/profile/${userId}`);
    setSearchQuery('');
    setShowResults(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <button 
              onClick={() => router.push('/home')}
              className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
            >
              SocialHub
            </button>
            
            <div className="hidden md:block relative" ref={searchRef}>
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-80">
                <Search className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none w-full text-sm"
                />
                {searchQuery && (
                  <button onClick={clearSearch} className="ml-2">
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showResults && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleUserClick(user.id)}
                          className="w-full px-4 py-3 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                        >
                          <img
                            src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                            alt={user.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-gray-900">{user.full_name}</p>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No users found
                    </div>
                  )}
                </div>
              )}
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