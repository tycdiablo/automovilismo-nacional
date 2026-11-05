"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { runLogged } from "@/lib/sync/log";
import { syncF1 } from "@/lib/sync/f1";
import { syncNews } from "@/lib/sync/news";
import { notifyFollowers } from "@/lib/push";
import { normalize, slugify } from "@/lib/utils";

export type ActionState = { ok?: boolean; message?: string } | undefined;

function str(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" && v.trim() ? v.trim() : null;
}
function num(fd: FormData, key: string) {
  const v = str(fd, key);
  if (v === null) return null;
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/** Interpreta una fecha local de Argentina (input datetime-local) como UTC-3 */
function argDate(value: string | null) {
  if (!value) return null;
  const withTz = /[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value.length === 10 ? `${value}T12:00` : value}:00-03:00`;
  const d = new Date(withTz);
  return isNaN(d.getTime()) ? null : d;
}

function done(paths: string[]) {
  revalidatePath("/", "layout");
  for (const p of paths) revalidatePath(p);
}

// ---------------------------------------------------------------- Sincronización
export async function runSyncAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const which = str(fd, "which");
  const res = which === "f1" ? await runLogged("f1", () => syncF1()) : await runLogged("news", () => syncNews());
  done(["/admin"]);
  return res.ok
    ? { ok: true, message: `Sincronización OK: ${JSON.stringify(res.result)}` }
    : { ok: false, message: `Error: ${res.error}` };
}

// ---------------------------------------------------------------- Pilotos
export async function savePilotAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(fd, "id");
  const fullName = str(fd, "fullName");
  const categoryId = str(fd, "categoryId");
  if (!fullName || !categoryId) return { ok: false, message: "Nombre y categoría son obligatorios." };

  const slug = slugify(str(fd, "slug") || fullName);
  const clash = await prisma.pilot.findFirst({ where: { slug, ...(id ? { NOT: { id } } : {}) } });
  if (clash) return { ok: false, message: `Ya existe un piloto con el slug "${slug}".` };

  const socials: Record<string, string> = {};
  const ig = str(fd, "instagram");
  const x = str(fd, "x");
  if (ig) socials.instagram = ig.replace(/^@/, "");
  if (x) socials.x = x.replace(/^@/, "");

  const data = {
    fullName,
    slug,
    categoryId,
    team: str(fd, "team"),
    carNumber: num(fd, "carNumber"),
    nationality: str(fd, "nationality") || "Argentina",
    birthPlace: str(fd, "birthPlace"),
    dateOfBirth: argDate(str(fd, "dateOfBirth")),
    bio: str(fd, "bio"),
    profileImageUrl: str(fd, "profileImageUrl"),
    aliases: str(fd, "aliases"),
    externalId: str(fd, "externalId"),
    featured: fd.get("featured") === "on",
    isActive: fd.get("isActive") === "on",
    socialMediaHandles: Object.keys(socials).length ? JSON.stringify(socials) : null,
  };

  const pilot = id ? await prisma.pilot.update({ where: { id }, data }) : await prisma.pilot.create({ data });
  done(["/pilotos", `/pilotos/${pilot.slug}`]);
  if (!id) redirect(`/admin/pilotos/${pilot.id}?creado=1`);
  return { ok: true, message: "Piloto guardado." };
}

export async function deletePilotAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  if (id) await prisma.pilot.delete({ where: { id } });
  done(["/pilotos"]);
  redirect("/admin/pilotos");
}

// ---------------------------------------------------------------- Carreras
export async function saveEventAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(fd, "id");
  const name = str(fd, "name");
  const categoryId = str(fd, "categoryId");
  const date = argDate(str(fd, "date"));
  if (!name || !categoryId || !date) return { ok: false, message: "Nombre, categoría y fecha son obligatorios." };

  // Horarios: una línea por sesión -> "Clasificación | 2026-11-07 14:00"
  const sessions = (str(fd, "sessions") || "")
    .split("\n")
    .map((l) => l.split("|").map((s) => s.trim()))
    .filter((p) => p.length === 2 && p[0] && p[1])
    .map(([sessionName, when]) => ({ name: sessionName, date: argDate(when.replace(" ", "T"))?.toISOString() }))
    .filter((s): s is { name: string; date: string } => Boolean(s.date));

  const data = {
    name,
    categoryId,
    date,
    season: num(fd, "season") ?? date.getFullYear(),
    round: num(fd, "round"),
    circuit: str(fd, "circuit"),
    location: str(fd, "location"),
    country: str(fd, "country") || "Argentina",
    description: str(fd, "description"),
    status: str(fd, "status") || "SCHEDULED",
    sessions,
  };

  const ev = id ? await prisma.raceEvent.update({ where: { id }, data }) : await prisma.raceEvent.create({ data });
  done(["/calendario", "/resultados", `/carreras/${ev.id}`]);
  if (!id) redirect(`/admin/carreras/${ev.id}?creado=1`);
  return { ok: true, message: "Carrera guardada." };
}

export async function deleteEventAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  if (id) await prisma.raceEvent.delete({ where: { id } });
  done(["/calendario", "/resultados"]);
  redirect("/admin/carreras");
}

type ParsedRow = { position: number; name: string; team: string | null; time: string | null; points: number | null };

/**
 * Formato: una fila por línea, columnas separadas por ";" "|" o tabulación:
 *   posición ; piloto ; equipo/marca ; tiempo/diferencia ; puntos
 * Sólo posición y piloto son obligatorios. Se puede pegar directo desde una planilla.
 */
function parseTable(text: string): ParsedRow[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line, i) => {
      const cols = line.split(/\t|;|\|/).map((c) => c.trim());
      const first = Number(cols[0]);
      const hasPos = Number.isFinite(first) && cols[0] !== "";
      const [pos, name, team, time, points] = hasPos ? cols : [String(i + 1), ...cols];
      return {
        position: Number(pos),
        name: name || "",
        team: team || null,
        time: time || null,
        points: points ? Number(points.replace(",", ".")) || 0 : null,
      };
    })
    .filter((r) => r.name);
}

async function pilotMatcher() {
  const pilots = await prisma.pilot.findMany({ select: { id: true, fullName: true, aliases: true } });
  return (name: string) => {
    const n = normalize(name);
    return pilots.find(
      (p) => normalize(p.fullName) === n || (p.aliases ?? "").split(",").some((a) => a.trim() && normalize(a) === n)
    );
  };
}

export async function saveResultsAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const eventId = str(fd, "eventId");
  const rows = parseTable(str(fd, "results") || "");
  if (!eventId) return { ok: false, message: "Falta la carrera." };
  if (!rows.length) return { ok: false, message: "No se encontraron filas válidas." };

  const event = await prisma.raceEvent.findUnique({ where: { id: eventId } });
  if (!event) return { ok: false, message: "Carrera inexistente." };
  const find = await pilotMatcher();
  const notify = fd.get("notify") === "on" && event.status !== "FINISHED";

  await prisma.$transaction([
    prisma.result.deleteMany({ where: { raceEventId: eventId } }),
    prisma.result.createMany({
      data: rows.map((r) => ({
        position: r.position,
        pilotName: r.name,
        pilotFlag: "🇦🇷",
        pilotId: find(r.name)?.id ?? null,
        team: r.team,
        timeGap: r.time,
        points: r.points,
        raceEventId: eventId,
        categoryId: event.categoryId,
      })),
    }),
    prisma.raceEvent.update({ where: { id: eventId }, data: { status: "FINISHED" } }),
  ]);

  let notified = 0;
  if (notify) {
    for (const r of rows) {
      const p = find(r.name);
      if (p) notified += await notifyFollowers([p.id], { title: `🏁 ${p.fullName} terminó P${r.position}`, body: event.name, url: `/carreras/${eventId}` });
    }
  }

  const linked = rows.filter((r) => find(r.name)).length;
  done(["/resultados", `/carreras/${eventId}`]);
  return { ok: true, message: `${rows.length} resultados guardados (${linked} vinculados a pilotos seguidos${notified ? `, ${notified} notificaciones` : ""}).` };
}

export async function saveStandingsAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const categoryId = str(fd, "categoryId");
  const season = num(fd, "season");
  const kind = str(fd, "kind") === "TEAM" ? "TEAM" : "DRIVER";
  const rows = parseTable(str(fd, "standings") || "");
  if (!categoryId || !season) return { ok: false, message: "Categoría y temporada son obligatorias." };
  if (!rows.length) return { ok: false, message: "No se encontraron filas válidas." };

  // Para campeonatos: posición ; nombre ; equipo ; puntos ; victorias
  const find = await pilotMatcher();
  await prisma.$transaction([
    prisma.standing.deleteMany({ where: { categoryId, season, kind } }),
    prisma.standing.createMany({
      data: rows.map((r) => ({
        categoryId,
        season,
        kind,
        position: r.position,
        name: r.name,
        team: r.team,
        points: Number((r.time ?? "0").replace(",", ".")) || 0,
        wins: r.points ?? 0,
        flag: kind === "DRIVER" ? "🇦🇷" : null,
        pilotId: kind === "DRIVER" ? find(r.name)?.id ?? null : null,
      })),
    }),
  ]);
  done(["/campeonatos"]);
  return { ok: true, message: `Campeonato guardado (${rows.length} filas).` };
}

// ---------------------------------------------------------------- Noticias
export async function saveNewsAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const title = str(fd, "title");
  const url = str(fd, "originalUrl");
  if (!title || !url || !/^https?:\/\//.test(url)) return { ok: false, message: "Título y URL válida son obligatorios." };
  if (await prisma.news.findUnique({ where: { originalUrl: url } })) return { ok: false, message: "Ya existe una noticia con esa URL." };

  const pilotId = str(fd, "pilotId");
  const news = await prisma.news.create({
    data: {
      title,
      originalUrl: url,
      summary: str(fd, "summary"),
      sourceName: str(fd, "sourceName") || new URL(url).hostname.replace(/^www\./, ""),
      imageUrl: str(fd, "imageUrl"),
      publishedAt: argDate(str(fd, "publishedAt")) ?? new Date(),
      pilotId,
      categoryId: str(fd, "categoryId"),
    },
    include: { pilot: true },
  });
  if (news.pilot && fd.get("notify") === "on") {
    await notifyFollowers([news.pilot.id], { title: `📰 Novedades de ${news.pilot.fullName}`, body: title, url });
  }
  done(["/noticias"]);
  return { ok: true, message: "Noticia publicada." };
}

export async function deleteNewsAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  if (id) await prisma.news.delete({ where: { id } });
  done(["/noticias", "/admin/noticias"]);
}
