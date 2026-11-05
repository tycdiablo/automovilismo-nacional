import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, Newspaper, Trophy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { newsInclude, pilotCardInclude } from "@/lib/queries";
import { EmptyState, PageHeader, SectionHeader } from "@/components/ui";
import { PilotCard } from "@/components/pilots/PilotCard";
import { NewsCard } from "@/components/news/NewsCard";
import { cn, formatArg, positionBadgeClass } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mis pilotos", robots: { index: false } };

export default async function MyPilotsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/mis-pilotos");

  const follows = await prisma.follow.findMany({
    where: { userId: user.id },
    include: { pilot: { include: pilotCardInclude } },
    orderBy: { createdAt: "asc" },
  });
  const ids = follows.map((f) => f.pilotId);

  const [results, news] = ids.length
    ? await Promise.all([
        prisma.result.findMany({
          where: { pilotId: { in: ids } },
          orderBy: { raceEvent: { date: "desc" } },
          take: 15,
          include: {
            pilot: { select: { fullName: true, slug: true } },
            raceEvent: { select: { id: true, name: true, date: true } },
            category: { select: { shortName: true } },
          },
        }),
        prisma.news.findMany({ where: { pilotId: { in: ids } }, orderBy: { publishedAt: "desc" }, take: 9, include: newsInclude }),
      ])
    : [[], []];

  return (
    <div className="space-y-10">
      <PageHeader title="Mis pilotos" icon={Heart} description="Tu feed personalizado: resultados y noticias de los pilotos que seguís." />

      {follows.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Todavía no seguís a ningún piloto"
          description="Seguí a tus favoritos para ver acá sus resultados y noticias, y recibir notificaciones."
          action={<Link href="/pilotos" className="btn-primary">Explorar pilotos</Link>}
        />
      ) : (
        <>
          <section>
            <SectionHeader title={`Siguiendo (${follows.length})`} />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {follows.map((f) => <PilotCard key={f.id} pilot={f.pilot} isFollowing />)}
            </div>
          </section>

          <section>
            <SectionHeader title="Últimos resultados" icon={Trophy} />
            {results.length ? (
              <div className="card divide-y divide-border overflow-hidden">
                {results.map((r) => (
                  <Link key={r.id} href={`/carreras/${r.raceEvent?.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-accent/40">
                    <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold", positionBadgeClass(r.position))}>
                      P{r.position}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{r.pilot?.fullName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {r.category.shortName} · {r.raceEvent?.name}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {r.raceEvent && formatArg(r.raceEvent.date, { day: "numeric", month: "short" })}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="card p-5 text-sm text-muted-foreground">Sin resultados cargados todavía.</p>
            )}
          </section>

          <section>
            <SectionHeader title="Noticias" icon={Newspaper} />
            {news.length ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{news.map((n) => <NewsCard key={n.id} news={n} />)}</div>
            ) : (
              <p className="card p-5 text-sm text-muted-foreground">Sin noticias recientes de tus pilotos.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
