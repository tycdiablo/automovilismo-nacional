import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { categorySlug } from "@/lib/utils";

export const newsInclude = {
  category: { select: { shortName: true, slug: true, color: true } },
  pilot: { select: { fullName: true, slug: true } },
} as const;

export const pilotCardInclude = {
  category: { select: { shortName: true, name: true, slug: true, color: true, isInternational: true } },
  _count: { select: { followers: true } },
} as const;

export const eventRowInclude = {
  category: { select: { shortName: true, slug: true, color: true } },
} as const;

export const getCategories = cache(async () =>
  prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] })
);

export async function findCategoryBySlug(slug?: string | null) {
  if (!slug) return null;
  const categories = await getCategories();
  return categories.find((c) => categorySlug(c) === slug.toLowerCase()) ?? null;
}

export async function getFollowedPilotIds(userId?: string | null) {
  if (!userId) return new Set<string>();
  const follows = await prisma.follow.findMany({ where: { userId }, select: { pilotId: true } });
  return new Set(follows.map((f) => f.pilotId));
}

/** Margen para considerar "en curso" una carrera que ya largó */
const LIVE_WINDOW_MS = 3 * 60 * 60 * 1000;

export async function getUpcomingEvents(take = 5, categoryId?: string) {
  return prisma.raceEvent.findMany({
    where: {
      date: { gte: new Date(Date.now() - LIVE_WINDOW_MS) },
      status: "SCHEDULED",
      ...(categoryId ? { categoryId } : {}),
    },
    orderBy: { date: "asc" },
    take,
    include: eventRowInclude,
  });
}

export async function getCurrentSeason(categoryId: string) {
  const latest = await prisma.standing.findFirst({
    where: { categoryId },
    orderBy: { season: "desc" },
    select: { season: true },
  });
  return latest?.season ?? new Date().getFullYear();
}

/** Categorías con campeonato cargado, con su temporada más reciente */
export async function getStandingCategories() {
  const groups = await prisma.standing.groupBy({ by: ["categoryId", "season"], _count: true });
  const latest = new Map<string, number>();
  for (const g of groups) latest.set(g.categoryId, Math.max(latest.get(g.categoryId) ?? 0, g.season));
  const categories = await getCategories();
  return categories
    .filter((c) => latest.has(c.id))
    .map((c) => ({ ...c, season: latest.get(c.id)! }));
}

export async function getSeasonStats(pilotId: string, season: number) {
  const results = await prisma.result.findMany({
    where: { pilotId, raceEvent: { season } },
    select: { position: true, points: true },
  });
  return {
    races: results.length,
    wins: results.filter((r) => r.position === 1).length,
    podiums: results.filter((r) => r.position <= 3).length,
    top10: results.filter((r) => r.position <= 10).length,
    best: results.length ? Math.min(...results.map((r) => r.position)) : null,
    points: results.reduce((acc, r) => acc + (r.points ?? 0), 0),
  };
}
