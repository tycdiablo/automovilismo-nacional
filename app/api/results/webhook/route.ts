import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorizedAutomation } from "@/lib/security";
import { notifyFollowers } from "@/lib/push";
import { normalize } from "@/lib/utils";

type IncomingResult = {
  position: number;
  pilotName: string;
  pilotFlag?: string;
  timeGap?: string;
  points?: number;
  team?: string;
};

/**
 * Carga de resultados desde integraciones externas.
 * Body: { eventName, date, categoryShortName, location?, circuit?, results: IncomingResult[] }
 */
export async function POST(request: NextRequest) {
  if (!isAuthorizedAutomation(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { eventName, date, categoryShortName } = data;
    const results: IncomingResult[] = Array.isArray(data.results) ? data.results : [];

    if (!eventName || !categoryShortName || !date || results.length === 0) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const category = await prisma.category.findUnique({ where: { shortName: categoryShortName } });
    if (!category) {
      return NextResponse.json({ error: `No existe la categoría ${categoryShortName}` }, { status: 404 });
    }

    const eventDate = new Date(date);
    const existing = await prisma.raceEvent.findFirst({ where: { name: eventName, categoryId: category.id } });
    const eventData = {
      date: eventDate,
      season: eventDate.getFullYear(),
      location: data.location ?? existing?.location ?? null,
      circuit: data.circuit ?? existing?.circuit ?? null,
      status: "FINISHED",
    };
    const raceEvent = existing
      ? await prisma.raceEvent.update({ where: { id: existing.id }, data: eventData })
      : await prisma.raceEvent.create({ data: { ...eventData, name: eventName, categoryId: category.id } });

    const pilots = await prisma.pilot.findMany({ select: { id: true, fullName: true } });
    const findPilot = (name: string) => pilots.find((p) => normalize(p.fullName) === normalize(name));

    await prisma.$transaction([
      prisma.result.deleteMany({ where: { raceEventId: raceEvent.id } }),
      prisma.result.createMany({
        data: results.map((r) => ({
          position: Number(r.position),
          pilotName: r.pilotName,
          pilotFlag: r.pilotFlag || "🇦🇷",
          pilotId: findPilot(r.pilotName)?.id ?? null,
          timeGap: r.timeGap || null,
          points: r.points ?? null,
          team: r.team || null,
          raceEventId: raceEvent.id,
          categoryId: category.id,
        })),
      }),
    ]);

    if (existing?.status !== "FINISHED") {
      for (const r of results) {
        const pilot = findPilot(r.pilotName);
        if (pilot) {
          await notifyFollowers([pilot.id], {
            title: `🏁 ${pilot.fullName} terminó P${r.position}`,
            body: eventName,
            url: `/carreras/${raceEvent.id}`,
          });
        }
      }
    }

    return NextResponse.json({ success: true, eventId: raceEvent.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Results webhook error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
