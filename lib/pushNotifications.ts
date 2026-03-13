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
    throw new Error('Push notifications are not supported');
  }

  try {
    // Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    // Request permission
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      )
    });

    // Save subscription to database
    await savePushSubscription(subscription);

    return subscription;
  } catch (error) {
    console.error('Error subscribing to push:', error);
    throw error;
  }
};

// Save push subscription to database
export const savePushSubscription = async (subscription: PushSubscription) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const subscriptionJSON = subscription.toJSON();

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

  if (error) throw error;
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