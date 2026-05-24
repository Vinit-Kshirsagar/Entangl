'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, getCurrentUserProfile, processApprovedEmailChange } from '@/lib/auth';

// Pages that don't require authentication
const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

// Pages that pending/rejected users can access
const STATUS_PATHS = ['/approval-status'];

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Skip auth check for public pages
      if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Skip auth check for status page
      if (STATUS_PATHS.some(path => pathname.startsWith(path))) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const profile = await getCurrentUserProfile();
        if (!profile) {
          router.push('/login');
          return;
        }

        const status: string = profile.status;

        // Handle pending/rejected users
        if (status === 'pending' || status === 'rejected') {
          router.push('/approval-status');
          return;
        }

        // Handle approved email change — auto-process it
        if (status.startsWith('email_change_approved:')) {
          const newEmail = status.replace('email_change_approved:', '');
          try {
            await processApprovedEmailChange(newEmail);
          } catch (err) {
            console.error('Failed to process email change:', err);
          }
          // Continue to allow access regardless
        }

        // User is approved (or email_change_pending which still allows access)
        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">Entangl</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
