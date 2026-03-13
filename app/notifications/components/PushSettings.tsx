'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { subscribeToPush, unsubscribeFromPush, isPushSubscribed, isPushSupported } from '@/lib/pushNotifications';

const PushSettings: React.FC = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      const supported = isPushSupported();
      setIsSupported(supported);
      
      if (supported) {
        const subscribed = await isPushSubscribed();
        setIsSubscribed(subscribed);
      }
    };

    checkSubscription();
  }, []);

  const handleTogglePush = async () => {
    setIsLoading(true);
    try {
      if (isSubscribed) {
        await unsubscribeFromPush();
        setIsSubscribed(false);
        alert('Push notifications disabled');
      } else {
        await subscribeToPush();
        setIsSubscribed(true);
        alert('Push notifications enabled! You\'ll now receive notifications even when the app is closed.');
      }
    } catch (error: any) {
      console.error('Error toggling push:', error);
      alert(error.message || 'Failed to toggle push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          Push notifications are not supported in this browser
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isSubscribed ? (
            <Bell className="w-5 h-5 text-purple-600" />
          ) : (
            <BellOff className="w-5 h-5 text-gray-400" />
          )}
          <div>
            <p className="font-semibold text-gray-900">Push Notifications</p>
            <p className="text-sm text-gray-500">
              {isSubscribed ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>
        <button
          onClick={handleTogglePush}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 ${
            isSubscribed
              ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {isLoading ? 'Loading...' : isSubscribed ? 'Disable' : 'Enable'}
        </button>
      </div>
    </div>
  );
};

export default PushSettings;