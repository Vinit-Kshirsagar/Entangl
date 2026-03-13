import { createClient } from '@/lib/supabase/client'

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// Check if push notifications are supported
export const isPushSupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return 'denied';
  }

  return await Notification.requestPermission();
};

// Register service worker and subscribe to push
export const subscribeToPush = async () => {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported in this browser');
  }

  // Check if VAPID key is configured
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    throw new Error('VAPID public key is not configured. Please add NEXT_PUBLIC_VAPID_PUBLIC_KEY to your environment variables.');
  }

  try {
    // Register service worker
    console.log('Registering service worker...');
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service worker registered:', registration);
    
    await navigator.serviceWorker.ready;
    console.log('Service worker ready');

    // Request permission
    const permission = await requestNotificationPermission();
    console.log('Permission status:', permission);
    
    if (permission !== 'granted') {
      throw new Error('Notification permission was denied. Please enable notifications in your browser settings.');
    }

    // Check for existing subscription
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('Existing subscription found, unsubscribing first...');
      await existingSubscription.unsubscribe();
    }

    // Subscribe to push notifications
    console.log('Subscribing to push...');
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      )
    });
    console.log('Push subscription successful:', subscription);

    // Save subscription to database
    console.log('Saving subscription to database...');
    await savePushSubscription(subscription);
    console.log('Subscription saved successfully');

    return subscription;
  } catch (error: any) {
    console.error('Detailed error subscribing to push:', error);
    
    // Provide more specific error messages
    if (error.name === 'NotAllowedError') {
      throw new Error('Notification permission denied. Please enable notifications in your browser settings.');
    } else if (error.name === 'NotSupportedError') {
      throw new Error('Push notifications are not supported in this browser.');
    } else if (error.message?.includes('VAPID')) {
      throw new Error('Push service configuration error. Please contact support.');
    } else {
      throw new Error(`Registration failed: ${error.message || 'Unknown error'}`);
    }
  }
};

// Save push subscription to database
export const savePushSubscription = async (subscription: PushSubscription) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const subscriptionJSON = subscription.toJSON();

  console.log('Saving subscription for user:', user.id);

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({
      user_id: user.id,
      endpoint: subscriptionJSON.endpoint!,
      p256dh: subscriptionJSON.keys!.p256dh!,
      auth: subscriptionJSON.keys!.auth!
    }, {
      onConflict: 'user_id,endpoint'
    });

  if (error) {
    console.error('Error saving subscription:', error);
    throw new Error(`Failed to save subscription: ${error.message}`);
  }
};

// Unsubscribe from push notifications
export const unsubscribeFromPush = async () => {
  if (!isPushSupported()) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      await removePushSubscription(subscription);
    }
  } catch (error) {
    console.error('Error unsubscribing from push:', error);
    throw error;
  }
};

// Remove push subscription from database
const removePushSubscription = async (subscription: PushSubscription) => {
  const supabase = createClient();
  const subscriptionJSON = subscription.toJSON();

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', subscriptionJSON.endpoint!);

  if (error) throw error;
};

// Check if user is subscribed
export const isPushSubscribed = async (): Promise<boolean> => {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch {
    return false;
  }
};