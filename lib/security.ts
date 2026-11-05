import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/**
 * Valida un header `Authorization: Bearer <token>` contra alguno de los secretos
 * configurados. Si no hay ningún secreto configurado, siempre rechaza.
 */
export function isAuthorizedBearer(request: NextRequest | Request, ...envNames: string[]) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return false;
  return envNames.some((name) => {
    const secret = process.env[name];
    return !!secret && safeEqual(token, secret);
  });
}

/** Secretos aceptados por los endpoints automáticos (cron / webhooks) */
export function isAuthorizedAutomation(request: NextRequest | Request) {
  return isAuthorizedBearer(request, "CRON_SECRET", "WEBHOOK_SECRET");
}
