'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, XCircle, LogOut } from 'lucide-react';
import { getCurrentUser, signOut, getCurrentUserProfile } from '@/lib/auth';

export default function ApprovalStatusPage() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
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

        // If user is approved, redirect them to home
        if (profile.status === 'approved' || 
            profile.status === 'approved_email_changed' || 
            profile.status.startsWith('email_change_pending:') ||
            profile.status.startsWith('email_change_approved:')) {
          router.push('/home');
          return;
        }

        setStatus(profile.status);
      } catch (error) {
        console.error('Error checking status:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Checking account status...</p>
        </div>
      </div>
    );
  }

  const isPending = status === 'pending';
  const isRejected = status === 'rejected';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Entangl
          </h1>
        </div>

        {isPending && (
          <>
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Awaiting Approval</h2>
            <p className="text-gray-600 mb-2">
              Your account has been created successfully!
            </p>
            <p className="text-gray-500 text-sm mb-8">
              The platform owner needs to approve your account before you can start using Entangl. You&apos;ll be able to access the platform once approved.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-amber-800 text-sm font-medium">
                ⏳ Your request is being reviewed. Please check back later.
              </p>
            </div>
          </>
        )}

        {isRejected && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h2>
            <p className="text-gray-600 mb-2">
              Your registration request has been rejected.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              Unfortunately, the platform owner has not approved your account at this time. If you believe this is a mistake, please contact the administrator.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm font-medium">
                ❌ Your registration was not approved.
              </p>
            </div>
          </>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
