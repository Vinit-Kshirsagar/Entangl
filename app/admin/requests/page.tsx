'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, Mail, UserCheck, UserX, Clock } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';

const OWNER_EMAIL = 'rekt11.cam@gmail.com';

interface PendingUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  status: string;
  created_at: string;
}

export default function AdminRequestsPage() {
  const router = useRouter();
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [emailChangeRequests, setEmailChangeRequests] = useState<PendingUser[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'registrations' | 'email_changes'>('registrations');

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getCurrentUser();
        if (!user || user.email !== OWNER_EMAIL) {
          router.push('/profile');
          return;
        }

        setIsOwner(true);
        await fetchRequests();
      } catch (error) {
        console.error('Error loading admin data:', error);
        router.push('/profile');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const fetchRequests = async () => {
    const supabase = createClient();

    // Fetch pending/rejected users
    const { data: pending } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, status, created_at')
      .in('status', ['pending', 'rejected'])
      .order('created_at', { ascending: false });

    setPendingUsers(pending || []);

    // Fetch email change requests
    const { data: emailChanges } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, status, created_at')
      .like('status', 'email_change_pending:%')
      .order('created_at', { ascending: false });

    setEmailChangeRequests(emailChanges || []);
  };

  const handleApproveUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'approved' })
        .eq('id', userId);

      if (error) throw error;
      await fetchRequests();
    } catch (error) {
      console.error('Error approving user:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'rejected' })
        .eq('id', userId);

      if (error) throw error;
      await fetchRequests();
    } catch (error) {
      console.error('Error rejecting user:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveEmailChange = async (userId: string, newEmail: string) => {
    setActionLoading(userId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({ status: `email_change_approved:${newEmail}` })
        .eq('id', userId);

      if (error) throw error;
      await fetchRequests();
    } catch (error) {
      console.error('Error approving email change:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectEmailChange = async (userId: string) => {
    setActionLoading(userId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'approved' })
        .eq('id', userId);

      if (error) throw error;
      await fetchRequests();
    } catch (error) {
      console.error('Error rejecting email change:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const parseRequestedEmail = (status: string) => {
    return status.replace('email_change_pending:', '');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  if (!isOwner) return null;

  const totalPending = pendingUsers.filter(u => u.status === 'pending').length;
  const totalEmailChanges = emailChangeRequests.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/profile')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Requests</h1>
          <p className="text-gray-600">Manage user registrations and email change requests</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-8">
          <button
            onClick={() => setActiveTab('registrations')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'registrations'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Registrations
            {totalPending > 0 && (
              <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {totalPending}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('email_changes')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'email_changes'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Email Changes
            {totalEmailChanges > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {totalEmailChanges}
              </span>
            )}
          </button>
        </div>

        {/* Registration Requests */}
        {activeTab === 'registrations' && (
          <div className="space-y-4">
            {pendingUsers.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No pending registrations</p>
                <p className="text-gray-400 text-sm mt-1">All registration requests have been processed.</p>
              </div>
            ) : (
              pendingUsers.map(user => (
                <div
                  key={user.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                        alt={user.full_name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{user.full_name}</h3>
                        <p className="text-gray-500">@{user.username}</p>
                        <p className="text-gray-400 text-xs mt-1">Registered {formatDate(user.created_at)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {user.status === 'pending' && (
                        <span className="flex items-center space-x-1 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full mr-2">
                          <Clock className="w-3 h-3" />
                          <span>Pending</span>
                        </span>
                      )}
                      {user.status === 'rejected' && (
                        <span className="flex items-center space-x-1 bg-red-50 text-red-700 text-xs font-semibold px-3 py-1 rounded-full mr-2">
                          <XCircle className="w-3 h-3" />
                          <span>Rejected</span>
                        </span>
                      )}

                      <button
                        onClick={() => handleApproveUser(user.id)}
                        disabled={actionLoading === user.id}
                        className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      {user.status !== 'rejected' && (
                        <button
                          onClick={() => handleRejectUser(user.id)}
                          disabled={actionLoading === user.id}
                          className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          <UserX className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Email Change Requests */}
        {activeTab === 'email_changes' && (
          <div className="space-y-4">
            {emailChangeRequests.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No email change requests</p>
                <p className="text-gray-400 text-sm mt-1">No users have requested an email change.</p>
              </div>
            ) : (
              emailChangeRequests.map(user => {
                const requestedEmail = parseRequestedEmail(user.status);
                return (
                  <div
                    key={user.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                          alt={user.full_name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{user.full_name}</h3>
                          <p className="text-gray-500">@{user.username}</p>
                          <div className="mt-2 flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-gray-600">
                              Wants to change email to: <strong className="text-blue-600">{requestedEmail}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleApproveEmailChange(user.id, requestedEmail)}
                          disabled={actionLoading === user.id}
                          className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleRejectEmailChange(user.id)}
                          disabled={actionLoading === user.id}
                          className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
