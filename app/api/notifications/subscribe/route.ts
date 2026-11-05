import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

type SubscriptionBody = { endpoint?: string; keys?: { p256dh?: string; auth?: string } };

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sub: SubscriptionBody = await req.json();

    if (!sub.endpoint || !/^https:\/\//.test(sub.endpoint) || !sub.keys?.p256dh || !sub.keys?.auth) {
      return NextResponse.json({ error: "Suscripción inválida" }, { status: 400 });
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint: sub.endpoint },
      update: { userId: user?.id ?? null, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
      create: { endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth, userId: user?.id ?? null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push subscribe error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = (await req.json()) as SubscriptionBody;
    if (endpoint) await prisma.pushSubscription.deleteMany({ where: { endpoint } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
