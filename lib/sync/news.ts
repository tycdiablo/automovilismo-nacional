import { prisma } from "@/lib/prisma";
import { notifyFollowers } from "@/lib/push";
import { decodeEntities, normalize } from "@/lib/utils";

/**
 * Ingesta de noticias desde feeds RSS de medios de automovilismo.
 * Filtro por fuente:
 * - `all`: el medio es 100% automovilismo argentino, se acepta todo.
 * - `motor`: se aceptan notas que mencionan pilotos, categorías o términos de automovilismo.
 * - `argentina`: medio internacional, sólo notas sobre pilotos seguidos o con mención a Argentina.
 */
type SourceFilter = "all" | "motor" | "argentina";

export const NEWS_SOURCES: { name: string; url: string; filter: SourceFilter }[] = [
  { name: "Infobae", url: "https://www.infobae.com/arc/outboundfeeds/rss/category/deportes/automovilismo/", filter: "motor" },
  { name: "Campeones", url: "https://campeones.com.ar/feed/", filter: "all" },
  { name: "SoloTC", url: "https://solotc.com.ar/feed/", filter: "all" },
  { name: "Carburando", url: "https://carburando.com/feed", filter: "all" },
  { name: "Motorsport.com", url: "https://es.motorsport.com/rss/all/news/", filter: "argentina" },
  { name: "Clarín", url: "https://www.clarin.com/rss/deportes/", filter: "motor" },
];

export type ParsedItem = {
  title: string;
  url: string;
  summary: string;
  imageUrl: string | null;
  publishedAt: Date;
};

function tag(xml: string, name: string) {
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i");
  return re.exec(xml)?.[1] ?? "";
}

function attr(xml: string, tagName: string, attrName: string) {
  const re = new RegExp(`<${tagName}[^>]*\\s${attrName}=["']([^"']+)["']`, "i");
  return re.exec(xml)?.[1] ?? null;
}

export function parseFeed(xml: string): ParsedItem[] {
  const items: ParsedItem[] = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) ?? [];

  for (const block of blocks) {
    const title = decodeEntities(tag(block, "title"));
    let url = decodeEntities(tag(block, "link"));
    if (!url) url = attr(block, "link", "href") ?? "";
    if (!title || !/^https?:\/\//.test(url)) continue;

    const rawDescription = tag(block, "description") || tag(block, "summary");
    const rawContent = tag(block, "content:encoded") || tag(block, "content");
    let summary = decodeEntities(rawDescription || rawContent);
    if (summary.length > 280) summary = summary.slice(0, 277).replace(/\s+\S*$/, "") + "…";

    const imageUrl =
      attr(block, "media:content", "url") ||
      attr(block, "media:thumbnail", "url") ||
      attr(block, "enclosure", "url") ||
      /<img[^>]+src=["']([^"']+)["']/i.exec(decodeCdata(rawContent || rawDescription))?.[1] ||
      null;

    const dateText = tag(block, "pubDate") || tag(block, "published") || tag(block, "updated") || tag(block, "dc:date");
    const date = dateText ? new Date(decodeEntities(dateText)) : new Date();

    items.push({
      title,
      url: url.trim(),
      summary,
      imageUrl: imageUrl ? imageUrl.replace(/&amp;/g, "&") : null,
      publishedAt: isNaN(date.getTime()) ? new Date() : date,
    });
  }
  return items;
}

function decodeCdata(s: string) {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
}

// Orden importante: las más específicas primero.
const CATEGORY_PATTERNS: [string, RegExp][] = [
  ["TC Pick Up", /\btc pick ?up\b/],
  ["TC Pista", /\btc pista\b/],
  ["TC2000", /\btc ?2000\b/],
  ["Top Race", /\btop race\b/],
  ["TN", /\bturismo nacional\b|\btn clase\b/],
  ["TC", /\bturismo carretera\b|\bactc\b|\btc\b/],
  ["F1", /\bformula 1\b|\bf1\b|\bformula uno\b/],
  ["F2", /\bformula 2\b|\bf2\b/],
  ["F3", /\bformula 3\b|\bf3\b/],
  ["Indy", /\bindycar\b|\bindy 500\b|\bindianapolis\b/],
  ["WEC", /\bwec\b|\ble mans\b|\bmundial de resistencia\b/],
  ["IMSA", /\bimsa\b|\bdaytona\b/],
  ["TCR World", /\btcr\b/],
  ["Dakar", /\bdakar\b/],
];

const MOTOR_KEYWORDS =
  /\bautomovilismo\b|\bpilotos?\b|\bautodromo\b|\bcircuito\b|\brally\b|\bdakar\b|\bnascar\b|\bkarting\b|\bpole\b|\bescuderia\b|\bmonoplaza\b|\bgran premio\b|\bcarrera final\b|\bclasificacion\b/;

type PilotMatcher = { id: string; fullName: string; categoryId: string; patterns: string[] };

function tokens(text: string) {
  return normalize(text).replace(/[^a-z0-9]+/g, " ").trim();
}

export function detect(
  text: string,
  pilots: PilotMatcher[],
  categories: { id: string; shortName: string }[]
) {
  const haystack = ` ${tokens(text)} `;
  const pilot = pilots.find((p) => p.patterns.some((pat) => haystack.includes(` ${pat} `)));
  let categoryId: string | null = null;
  for (const [shortName, re] of CATEGORY_PATTERNS) {
    if (re.test(haystack)) {
      categoryId = categories.find((c) => c.shortName === shortName)?.id ?? null;
      if (categoryId) break;
    }
  }
  if (!categoryId && pilot) categoryId = pilot.categoryId;
  return { pilot, categoryId, motor: MOTOR_KEYWORDS.test(haystack), argentina: /\bargentin/.test(haystack) };
}

async function fetchText(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 MotorNacional/1.0",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

export async function syncNews() {
  const [pilotRows, categories] = await Promise.all([
    prisma.pilot.findMany({ select: { id: true, fullName: true, aliases: true, categoryId: true } }),
    prisma.category.findMany({ select: { id: true, shortName: true } }),
  ]);
  const pilots: PilotMatcher[] = pilotRows.map((p) => ({
    id: p.id,
    fullName: p.fullName,
    categoryId: p.categoryId,
    patterns: [p.fullName, ...(p.aliases ?? "").split(",")]
      .map((s) => tokens(s))
      .filter((s) => s.length >= 4),
  }));

  const perSource: Record<string, number | string> = {};
  const candidates: (ParsedItem & { source: string; pilotId: string | null; pilotName?: string; categoryId: string | null })[] = [];

  await Promise.all(
    NEWS_SOURCES.map(async (source) => {
      try {
        const items = parseFeed(await fetchText(source.url));
        let accepted = 0;
        for (const item of items) {
          const { pilot, categoryId, motor, argentina } = detect(`${item.title} ${item.summary}`, pilots, categories);
          if (source.filter === "motor" && !pilot && !categoryId && !motor) continue;
          if (source.filter === "argentina" && !pilot && !(argentina && (categoryId || motor))) continue;
          candidates.push({ ...item, source: source.name, pilotId: pilot?.id ?? null, pilotName: pilot?.fullName, categoryId });
          accepted++;
        }
        perSource[source.name] = accepted;
      } catch (error) {
        perSource[source.name] = `error: ${error instanceof Error ? error.message : String(error)}`;
      }
    })
  );

  // Evitar duplicados (misma URL o mismo título)
  const existing = await prisma.news.findMany({
    where: { originalUrl: { in: candidates.map((c) => c.url) } },
    select: { originalUrl: true },
  });
  const seen = new Set(existing.map((e) => e.originalUrl));
  const seenTitles = new Set<string>();
  const fresh = candidates.filter((c) => {
    const key = normalize(c.title);
    if (seen.has(c.url) || seenTitles.has(key)) return false;
    seen.add(c.url);
    seenTitles.add(key);
    return true;
  });

  if (fresh.length) {
    await prisma.news.createMany({
      data: fresh.map((c) => ({
        title: c.title,
        summary: c.summary || null,
        originalUrl: c.url,
        sourceName: c.source,
        imageUrl: c.imageUrl,
        publishedAt: c.publishedAt > new Date() ? new Date() : c.publishedAt,
        pilotId: c.pilotId,
        categoryId: c.categoryId,
      })),
      skipDuplicates: true,
    });

    // Notificaciones push: una por piloto con la nota más reciente
    const latestByPilot = new Map<string, (typeof fresh)[number]>();
    for (const c of fresh) {
      if (!c.pilotId) continue;
      const prev = latestByPilot.get(c.pilotId);
      if (!prev || prev.publishedAt < c.publishedAt) latestByPilot.set(c.pilotId, c);
    }
    for (const [pilotId, c] of latestByPilot) {
      await notifyFollowers([pilotId], { title: `📰 Novedades de ${c.pilotName}`, body: c.title, url: c.url });
    }
  }

  return { inserted: fresh.length, candidates: candidates.length, sources: perSource };
}
