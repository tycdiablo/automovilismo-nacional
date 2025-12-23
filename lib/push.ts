import webpush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:example@yourdomain.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        VAPID_EMAIL,
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );
}

export async function sendPushNotification(
    subscription: { endpoint: string; p256dh: string; auth: string },
    payload: { title: string, body: string, url: string }
) {
    try {
        await webpush.sendNotification(
            {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: subscription.p256dh,
                    auth: subscription.auth
                }
            },
            JSON.stringify(payload)
        );
        return { success: true };
    } catch (error: unknown) {
        if (error && typeof error === 'object' && 'statusCode' in error) {
            const err = error as { statusCode: number };
            if (err.statusCode === 410 || err.statusCode === 404) {
                // Subscription expired or gone
                return { success: false, expired: true };
            }
        }
        console.error('Error sending push notification:', error);
        return { success: false };
    }
}
