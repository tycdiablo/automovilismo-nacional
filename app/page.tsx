import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  let followedPilotIds: string[] = [];

  if (session?.user) {
    const follows = await prisma.follow.findMany({
      where: { userId: (session.user as { id: string }).id },
      select: { pilotId: true }
    });
    followedPilotIds = follows.map(f => f.pilotId);
  }

  // 1. Fetch Latest Race Event (Prioritize those where followed pilots participated)
  const latestEvent = await prisma.raceEvent.findFirst({
    where: followedPilotIds.length > 0 ? {
      results: {
        some: { pilotId: { in: followedPilotIds } }
      }
    } : undefined,
    orderBy: { date: 'desc' },
    include: {
      category: true,
      results: {
        orderBy: { position: 'asc' },
        take: 5,
        include: {
          pilot: true,
        }
      }
    },
  }) || await prisma.raceEvent.findFirst({
    orderBy: { date: 'desc' },
    include: {
      category: true,
      results: {
        orderBy: { position: 'asc' },
        take: 5,
        include: {
          pilot: true,
        }
      }
    },
  });

  // 2. Fetch "Talentos para seguir" (Exclude already followed)
  const featuredPilots = await prisma.pilot.findMany({
    where: followedPilotIds.length > 0 ? {
      id: { notIn: followedPilotIds }
    } : undefined,
    take: 3,
    include: { category: true },
  });

  // 3. Fetch Latest News (Prioritize followed pilots)
  const latestNews = await prisma.news.findMany({
    where: followedPilotIds.length > 0 ? {
      OR: [
        { pilotId: { in: followedPilotIds } },
        { pilot: { id: { in: followedPilotIds } } }
      ]
    } : undefined,
    take: 6,
    orderBy: { publishedAt: 'desc' },
    include: { category: true },
  }).then(news => news.length > 0 ? news : prisma.news.findMany({
    take: 6,
    orderBy: { publishedAt: 'desc' },
    include: { category: true },
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Inicio</h1>
          <p className="text-muted-foreground mt-1">
            Resumen de actividad de los pilotos argentinos.
          </p>
        </div>
        <div className="hidden sm:block">
          <span className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary-foreground ring-1 ring-inset ring-secondary/20">
            Temporada 2025
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Live / Featured Widget */}
        {latestEvent ? (
          <div className="col-span-full lg:col-span-2 rounded-xl bg-card p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                Última Competencia: {latestEvent.name}
              </h2>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(latestEvent.date), { addSuffix: true, locale: es })}
              </span>
            </div>

            <div className="space-y-3">
              {latestEvent.results.map((res: { id: string; position: number; pilotFlag: string | null; pilot: { fullName: string; nationality: string } | null; pilotName: string | null; timeGap: string | null }) => (
                <div key={res.id} className="bg-muted/30 rounded-lg p-3 border border-border/50 flex items-center gap-4 transition-colors hover:bg-muted/50">
                  <div className="w-8 font-bold text-lg text-primary">P{res.position}</div>
                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-xl">{res.pilotFlag || (res.pilot?.nationality === 'Argentina' ? '🇦🇷' : '🏁')}</span>
                    <div>
                      <p className="font-semibold text-sm">{res.pilotName || res.pilot?.fullName}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-tight">{latestEvent.category.shortName}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs font-mono text-muted-foreground">
                    {res.timeGap || "-"}
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/resultados"
              className="mt-4 block text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Ver clasificación completa
            </Link>
          </div>
        ) : (
          <div className="col-span-full lg:col-span-2 rounded-xl bg-card p-6 border border-border shadow-sm flex items-center justify-center text-muted-foreground">
            No hay eventos recientes registrados.
          </div>
        )}

        {/* Discovery Widget */}
        <div className="rounded-xl bg-card p-6 border border-border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Talentos para seguir</h2>
          <div className="space-y-4">
            {featuredPilots.map((pilot: { id: string, fullName: string, category: { shortName: string } }) => (
              <div key={pilot.id} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  {pilot.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {pilot.fullName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {pilot.category.shortName}
                  </p>
                </div>
                <Link
                  href={`/pilotos?search=${encodeURIComponent(pilot.fullName)}`}
                  className="text-xs font-medium text-primary hover:text-primary/80"
                >
                  Ver
                </Link>
              </div>
            ))}
          </div>
          <Link
            href="/pilotos"
            className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
          >
            Ver todos <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* News Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Últimas Noticias</h2>
          <Link href="/noticias" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {latestNews.map((news: { id: string, title: string, summary: string | null, publishedAt: Date, imageUrl: string | null, originalUrl: string, category: { shortName: string } | null }) => (
            <article
              key={news.id}
              className="group relative flex flex-col items-start bg-card rounded-xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-video w-full bg-muted relative overflow-hidden group">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20 font-bold text-4xl">
                  {news.category?.shortName?.charAt(0) || "G"}
                </div>
                {news.imageUrl && news.imageUrl !== "/placeholder.svg" && (
                  <Image
                    src={news.imageUrl}
                    alt={news.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    unoptimized
                  />
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-x-2 text-xs text-muted-foreground mb-2">
                  <span className="font-medium text-primary">{news.category?.shortName || "General"}</span>
                  <span>•</span>
                  <time dateTime={news.publishedAt.toISOString()}>
                    {formatDistanceToNow(new Date(news.publishedAt), { addSuffix: true, locale: es })}
                  </time>
                </div>
                <h3 className="text-lg font-semibold leading-6 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  <a href={news.originalUrl} target="_blank" rel="noopener noreferrer">
                    <span className="absolute inset-0" />
                    {news.title}
                  </a>
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {news.summary}
                </p>
              </div>
            </article>
          ))}

          {latestNews.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No hay noticias publicadas recientemente.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
