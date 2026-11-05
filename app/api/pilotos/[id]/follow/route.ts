import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Tenés que iniciar sesión para seguir pilotos" }, { status: 401 });
  }

  try {
    const { id: pilotId } = await params;
    const { following } = await request.json();

    const pilot = await prisma.pilot.findUnique({ where: { id: pilotId }, select: { id: true } });
    if (!pilot) return NextResponse.json({ error: "Piloto no encontrado" }, { status: 404 });

    if (following) {
      await prisma.follow.upsert({
        where: { userId_pilotId: { userId: user.id, pilotId } },
        update: {},
        create: { userId: user.id, pilotId },
      });
    } else {
      await prisma.follow.deleteMany({ where: { userId: user.id, pilotId } });
    }

    const followers = await prisma.follow.count({ where: { pilotId } });
    return NextResponse.json({ success: true, following: Boolean(following), followers });
  } catch (error) {
    console.error("Follow error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
