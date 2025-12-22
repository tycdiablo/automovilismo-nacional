import { ArrowRight, Calendar, Clock, Trophy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function Home() {
  // 1. Fetch Latest Activity (Result)
  const latestResult = await prisma.result.findFirst({
    orderBy: { eventDate: 'desc' },
    include: {
      pilot: true,
      category: true,
    },
  });

  // 2. Fetch "Talentos para seguir" (Random or Featured pilots)
  const featuredPilots = await prisma.pilot.findMany({
    take: 3,
    include: { category: true },
  });

  // 3. Fetch Latest News
  const latestNews = await prisma.news.findMany({
    take: 6,
    orderBy: { publishedAt: 'desc' },
    include: { category: true },
  });

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
        {latestResult ? (
          <div className="col-span-full lg:col-span-2 rounded-xl bg-card p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                </span>
                Actividad Reciente
              </h2>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(latestResult.eventDate), { addSuffix: true, locale: es })}
              </span>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-background border border-border flex items-center justify-center overflow-hidden">
                  <span className="font-bold text-primary">
                    {latestResult.pilot.fullName.split(' ').map((n: string) => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{latestResult.pilot.fullName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {latestResult.category.name} - {latestResult.eventName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold font-mono">P{latestResult.position}</p>
                  <p className="text-xs text-muted-foreground font-medium">{latestResult.timeGap}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{latestResult.sessionType}</span>
                <span className="mx-1">•</span>
                <Calendar className="w-3 h-3" />
                <span>{new Date(latestResult.eventDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="col-span-full lg:col-span-2 rounded-xl bg-card p-6 border border-border shadow-sm flex items-center justify-center text-muted-foreground">
            No hay actividad reciente registrada.
          </div>
        )}

        {/* Discovery Widget */}
        <div className="rounded-xl bg-card p-6 border border-border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Talentos para seguir</h2>
          <div className="space-y-4">
            {featuredPilots.map((pilot: any) => (
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
          {latestNews.map((news: any) => (
            <article
              key={news.id}
              className="group relative flex flex-col items-start bg-card rounded-xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-video w-full bg-muted relative overflow-hidden group">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20 font-bold text-4xl">
                  {news.category?.shortName?.charAt(0) || "G"}
                </div>
                {news.imageUrl && news.imageUrl !== "/placeholder.svg" && (
                  <img
                    src={news.imageUrl}
                    alt={news.title}
                    className="absolute inset-0 object-cover w-full h-full transition-transform group-hover:scale-105"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
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
