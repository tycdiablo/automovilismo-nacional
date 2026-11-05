import webpush from "web-push";
import { prisma } from "@/lib/prisma";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_EMAIL = process.env.VAPID_EMAIL || "mailto:contacto@example.com";

const pushEnabled = Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);

if (pushEnabled) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

type PushPayload = { title: string; body: string; url: string };

export async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
) {
  if (!pushEnabled) return { success: false };
  try {
    await webpush.sendNotification(
      { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
      JSON.stringify(payload)
    );
    return { success: true };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "statusCode" in error) {
      const { statusCode } = error as { statusCode: number };
      if (statusCode === 410 || statusCode === 404) return { success: false, expired: true };
    }
    console.error("Error enviando push:", error);
    return { success: false };
  }
}

/**
 * Envía una notificación a todos los usuarios que siguen a alguno de los pilotos.
 * Cada suscripción recibe como máximo una notificación y las vencidas se eliminan.
 */
export async function notifyFollowers(pilotIds: string[], payload: PushPayload) {
  if (!pushEnabled || pilotIds.length === 0) return 0;

  const subs = await prisma.pushSubscription.findMany({
    where: { user: { follows: { some: { pilotId: { in: pilotIds } } } } },
  });

  const expired: string[] = [];
  let sent = 0;
  await Promise.all(
    subs.map(async (sub) => {
      const res = await sendPushNotification(sub, payload);
      if (res.success) sent++;
      if (res.expired) expired.push(sub.id);
    })
  );

  if (expired.length) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: expired } } });
  }
  return sent;
}
