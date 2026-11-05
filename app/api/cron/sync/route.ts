import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthorizedAutomation } from "@/lib/security";
import { runLogged } from "@/lib/sync/log";
import { syncF1 } from "@/lib/sync/f1";
import { syncNews } from "@/lib/sync/news";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Sincronización automática.
 *   GET/POST /api/cron/sync            -> todo
 *   GET/POST /api/cron/sync?only=f1    -> sólo Fórmula 1
 *   GET/POST /api/cron/sync?only=news  -> sólo noticias
 * Requiere `Authorization: Bearer <CRON_SECRET | WEBHOOK_SECRET>`.
 * Vercel Cron envía automáticamente el header con CRON_SECRET.
 */
async function handler(request: NextRequest) {
  if (!isAuthorizedAutomation(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const only = request.nextUrl.searchParams.get("only");
  const out: Record<string, unknown> = {};

  if (!only || only === "news") out.news = await runLogged("news", () => syncNews());
  if (!only || only === "f1") out.f1 = await runLogged("f1", () => syncF1());

  revalidatePath("/", "layout");
  const ok = Object.values(out).every((r) => (r as { ok: boolean }).ok);
  return NextResponse.json({ ok, ...out }, { status: ok ? 200 : 207 });
}

export { handler as GET, handler as POST };
