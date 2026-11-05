import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { categorySlug, siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages = ["", "/calendario", "/resultados", "/campeonatos", "/pilotos", "/categorias", "/noticias", "/acerca"].map((p) => ({
    url: siteUrl(p),
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: p === "" ? 1 : 0.8,
  }));

  try {
    const [pilots, categories, events] = await Promise.all([
      prisma.pilot.findMany({ where: { isActive: true }, select: { slug: true } }),
      prisma.category.findMany({ select: { slug: true, shortName: true } }),
      prisma.raceEvent.findMany({ select: { id: true, date: true }, orderBy: { date: "desc" }, take: 500 }),
    ]);
    return [
      ...staticPages,
      ...pilots.map((p) => ({ url: siteUrl(`/pilotos/${p.slug}`), changeFrequency: "weekly" as const, priority: 0.7 })),
      ...categories.map((c) => ({ url: siteUrl(`/categorias/${categorySlug(c)}`), changeFrequency: "weekly" as const, priority: 0.6 })),
      ...events.map((e) => ({ url: siteUrl(`/carreras/${e.id}`), lastModified: e.date, changeFrequency: "weekly" as const, priority: 0.5 })),
    ];
  } catch {
    return staticPages;
  }
}
