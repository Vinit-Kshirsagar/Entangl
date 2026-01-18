'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // TODO: Check if user is authenticated with Supabase
    // For now, redirect to login
    const isAuthenticated = false; // Replace with actual auth check
    
    if (isAuthenticated) {
      router.push('/home');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
      <div className="text-white text-center">
        <h1 className="text-6xl font-bold mb-4">SocialHub</h1>
        <p className="text-xl">Loading...</p>
      </div>
    </div>
  );
}