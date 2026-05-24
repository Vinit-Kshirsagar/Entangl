'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Lock, Mail, CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react';
import { getCurrentUser, getCurrentUserProfile, changePassword, requestEmailChange, cancelEmailChange } from '@/lib/auth';
import { updateUserProfile, uploadAvatar } from '@/lib/users';

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    avatar_url: ''
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Email change state
  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profileStatus, setProfileStatus] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }

        setCurrentEmail(user.email || '');

        const profile = await getCurrentUserProfile();
        if (profile) {
          setFormData({
            full_name: profile.full_name || '',
            username: profile.username || '',
            bio: profile.bio || '',
            avatar_url: profile.avatar_url || ''
          });
          setAvatarPreview(profile.avatar_url);
          setProfileStatus(profile.status || 'approved');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let avatarUrl = formData.avatar_url;

      // Upload avatar if changed
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      }

      // Update profile
      await updateUserProfile({
        full_name: formData.full_name,
        username: formData.username,
        bio: formData.bio,
        avatar_url: avatarUrl
      });

      alert('Profile updated successfully!');
      router.push('/profile');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMessage(null);

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(newPassword);
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      setPasswordMessage({ type: 'error', text: error.message || 'Failed to change password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRequestEmailChange = async () => {
    setEmailMessage(null);

    if (!newEmail || !newEmail.includes('@')) {
      setEmailMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    if (newEmail === currentEmail) {
      setEmailMessage({ type: 'error', text: 'New email must be different from your current email' });
      return;
    }

    setEmailLoading(true);
    try {
      await requestEmailChange(newEmail);
      setProfileStatus(`email_change_pending:${newEmail}`);
      setEmailMessage({ type: 'success', text: 'Email change request submitted! Awaiting admin approval.' });
      setNewEmail('');
    } catch (error: any) {
      setEmailMessage({ type: 'error', text: error.message || 'Failed to request email change' });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleCancelEmailChange = async () => {
    setEmailLoading(true);
    setEmailMessage(null);
    try {
      await cancelEmailChange();
      setProfileStatus('approved');
      setEmailMessage({ type: 'success', text: 'Email change request cancelled.' });
    } catch (error: any) {
      setEmailMessage({ type: 'error', text: error.message || 'Failed to cancel request' });
    } finally {
      setEmailLoading(false);
    }
  };

  // Derive email change UI state
  const isEmailChangeLocked = profileStatus === 'approved_email_changed';
  const isEmailChangePending = profileStatus.startsWith('email_change_pending:');
  const pendingEmail = isEmailChangePending ? profileStatus.replace('email_change_pending:', '') : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <button
          onClick={() => router.push('/profile')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
        <p className="text-gray-600 mb-8">Customize your profile information</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={avatarPreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username}`}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-purple-200"
              />
              <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition-colors">
                <Camera className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-2">Click the camera icon to upload a new photo</p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              placeholder="John Doe"
              required
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              placeholder="johndoe"
              minLength={3}
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none"
              placeholder="Tell us about yourself..."
              rows={4}
              maxLength={160}
            />
            <p className="text-sm text-gray-500 mt-1">{formData.bio.length}/160 characters</p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={() => router.push('/profile')}
              className="flex-1 w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Change Password Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <Lock className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">Update your account password. Must be at least 6 characters.</p>

          {passwordMessage && (
            <div className={`p-3 rounded-lg text-sm font-medium ${
              passwordMessage.type === 'success' 
                ? 'bg-green-100 border border-green-400 text-green-700' 
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              {passwordMessage.text}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button
            type="button"
            onClick={handleChangePassword}
            disabled={passwordLoading || !newPassword || !confirmNewPassword}
            className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {passwordLoading ? 'Changing...' : 'Change Password'}
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Change Email Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <Mail className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Change Email</h2>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-600">
              Current email: <strong>{currentEmail}</strong>
            </p>
          </div>

          {emailMessage && (
            <div className={`p-3 rounded-lg text-sm font-medium ${
              emailMessage.type === 'success' 
                ? 'bg-green-100 border border-green-400 text-green-700' 
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              {emailMessage.text}
            </div>
          )}

          {isEmailChangeLocked ? (
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Email Already Changed</p>
                <p className="text-sm text-gray-600 mt-1">
                  You have already used your one-time email change. No further email changes are allowed.
                </p>
              </div>
            </div>
          ) : isEmailChangePending ? (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
                <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Email Change Pending</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Your request to change email to <strong className="text-amber-700">{pendingEmail}</strong> is awaiting admin approval.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelEmailChange}
                disabled={emailLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-all disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>{emailLoading ? 'Cancelling...' : 'Cancel Request'}</span>
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500">
                You can change your email once. This requires approval from the platform owner.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="newemail@example.com"
                />
              </div>
              <button
                type="button"
                onClick={handleRequestEmailChange}
                disabled={emailLoading || !newEmail}
                className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {emailLoading ? 'Submitting...' : 'Request Email Change'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}