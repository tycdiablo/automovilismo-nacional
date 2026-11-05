import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { categorySlug, parseSessions, siteUrl, SITE_NAME } from "@/lib/utils";

export const dynamic = "force-dynamic";

function icsDate(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escape(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/**
 * Calendario en formato iCalendar para suscribirse desde Google Calendar,
 * Apple Calendar u Outlook. Filtro opcional: ?categoria=f1,tc
 */
export async function GET(request: NextRequest) {
  const filter = (request.nextUrl.searchParams.get("categoria") || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const since = new Date();
  since.setMonth(since.getMonth() - 2);

  const events = await prisma.raceEvent.findMany({
    where: { date: { gte: since }, status: { not: "CANCELLED" } },
    include: { category: true },
    orderBy: { date: "asc" },
  });

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${SITE_NAME}//Calendario//ES`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${SITE_NAME} - Calendario`,
    "X-WR-TIMEZONE:America/Argentina/Buenos_Aires",
  ];

  const stamp = icsDate(new Date());
  for (const ev of events) {
    if (filter.length && !filter.includes(categorySlug(ev.category))) continue;
    const sessions = parseSessions(ev.sessions);
    const race = sessions.find((s) => s.name === "Carrera");
    const start = race ? new Date(race.date) : ev.date;
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const where = [ev.circuit, ev.location, ev.country].filter(Boolean).join(", ");
    const desc = sessions.length
      ? sessions.map((s) => `${s.name}: ${new Date(s.date).toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })}`).join("\n")
      : ev.description || "";

    lines.push(
      "BEGIN:VEVENT",
      `UID:${ev.id}@motor-nacional`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${icsDate(start)}`,
      `DTEND:${icsDate(end)}`,
      `SUMMARY:${escape(`[${ev.category.shortName}] ${ev.name}`)}`,
      ...(where ? [`LOCATION:${escape(where)}`] : []),
      `DESCRIPTION:${escape(desc)}`,
      `URL:${siteUrl(`/carreras/${ev.id}`)}`,
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="motor-nacional.ics"',
      "Cache-Control": "public, max-age=1800",
    },
  });
}
