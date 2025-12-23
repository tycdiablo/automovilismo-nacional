import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const subscription = await req.json();

        if (!subscription.endpoint) {
            return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
        }

        const userId = session?.user ? (session.user as { id: string }).id : null;

        await prisma.pushSubscription.upsert({
            where: { endpoint: subscription.endpoint },
            update: {
                userId: userId, // Update userId if they log in later
            },
            create: {
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
                userId: userId,
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Push Subscribe Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
