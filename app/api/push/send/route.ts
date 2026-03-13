import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Configure web-push
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId, notification } = await request.json();

    if (!userId || !notification) {
      return NextResponse.json(
        { error: 'Missing userId or notification data' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Get user's push subscriptions
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: 'No subscriptions found' }, { status: 200 });
    }

    // Send push notification to all user's devices
    const pushPromises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };

      try {
        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify(notification)
        );
      } catch (error: any) {
        console.error('Error sending push:', error);
        
        // Remove invalid subscriptions
        if (error.statusCode === 410) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('id', sub.id);
        }
      }
    });

    await Promise.all(pushPromises);

    return NextResponse.json({ message: 'Push notifications sent' }, { status: 200 });
  } catch (error) {
    console.error('Push notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}