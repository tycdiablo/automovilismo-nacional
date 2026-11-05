import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorizedAutomation } from "@/lib/security";
import { seed } from "@/prisma/seed.mjs";

export const dynamic = "force-dynamic";

/** Carga categorías y pilotos base. Requiere `Authorization: Bearer <WEBHOOK_SECRET>` */
export async function POST(request: NextRequest) {
  if (!isAuthorizedAutomation(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await seed(prisma);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
