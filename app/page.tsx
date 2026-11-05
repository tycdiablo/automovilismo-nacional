import Link from "next/link";
import { CalendarDays, MapPin, Medal, Newspaper, Star, Trophy, Users, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getFollowedPilotIds, getUpcomingEvents, newsInclude, eventRowInclude, getStandingCategories } from "@/lib/queries";
import { CategoryBadge, EmptyState, PilotAvatar, SectionHeader } from "@/components/ui";
import { Countdown } from "@/components/events/Countdown";
import { EventRow } from "@/components/events/EventRow";
import { NewsCard } from "@/components/news/NewsCard";
import { StandingsTable } from "@/components/standings/StandingsTable";
import { FollowButton } from "@/components/pilots/FollowButton";
import { cn, countryEs, formatArg, parseSessions, positionBadgeClass } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  const followed = await getFollowedPilotIds(user?.id);
  const followedIds = [...followed];

  const [upcoming, lastEvent, standingCategories, featuredPilots] = await Promise.all([
    getUpcomingEvents(6),
    prisma.raceEvent.findFirst({
      where: {
        status: "FINISHED",
        ...(followedIds.length ? { results: { some: { pilotId: { in: followedIds } } } } : {}),
      },
      orderBy: { date: "desc" },
      include: {
        ...eventRowInclude,
        results: {
          orderBy: { position: "asc" },
          include: { pilot: { select: { fullName: true, slug: true, nationality: true } } },
        },
      },
    }),
    getStandingCategories(),
    prisma.pilot.findMany({
      where: followedIds.length ? { id: { in: followedIds } } : { featured: true },
      take: 6,
      orderBy: { fullName: "asc" },
      include: {
        category: { select: { shortName: true, slug: true, color: true } },
        results: {
          where: { raceEvent: { status: "FINISHED" } },
          orderBy: { raceEvent: { date: "desc" } },
          take: 1,
          include: { raceEvent: { select: { id: true, name: true, date: true } } },
        },
        standings: { orderBy: { season: "desc" }, take: 1 },
      },
    }),
  ]);

  const personalNews = followedIds.length
    ? await prisma.news.findMany({
        where: { pilotId: { in: followedIds } },
        orderBy: { publishedAt: "desc" },
        take: 7,
        include: newsInclude,
      })
    : [];
  const news = personalNews.length
    ? personalNews
    : await prisma.news.findMany({ orderBy: { publishedAt: "desc" }, take: 7, include: newsInclude });

  const nextEvent = upcoming[0];
  const nextFull = nextEvent
    ? await prisma.raceEvent.findUnique({ where: { id: nextEvent.id }, select: { sessions: true } })
    : null;
  const sessions = parseSessions(nextFull?.sessions);
  const raceSession = sessions.find((s) => s.name === "Carrera");
  const countdownTarget = (raceSession ? new Date(raceSession.date) : nextEvent?.date)?.toISOString();

  const mainStanding = standingCategories[0];
  const standings = mainStanding
    ? await prisma.standing.findMany({
        where: { categoryId: mainStanding.id, season: mainStanding.season, kind: "DRIVER" },
        orderBy: { position: "asc" },
        include: { pilot: { select: { slug: true } } },
      })
    : [];
  const topStandings = standings.slice(0, 5);
  const trackedOutsideTop = standings.filter((s) => s.pilot && s.position > 5);

  const lastTop = lastEvent?.results.slice(0, 5) ?? [];
  const lastTracked = lastEvent?.results.filter((r) => r.pilot && r.position > 5) ?? [];

  return (
    <div className="space-y-10">
      {/* HERO: próxima carrera */}
      <section className="hero-gradient relative overflow-hidden rounded-2xl border border-border">
        <div className="checkered absolute inset-y-0 right-0 hidden w-24 text-foreground/[0.04] md:block" aria-hidden="true" />
        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr]">
          {nextEvent ? (
            <div className="flex flex-col justify-between gap-6">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Próxima carrera</span>
                  <CategoryBadge category={nextEvent.category} link />
                  {nextEvent.round && <span className="text-xs text-muted-foreground">Fecha {nextEvent.round}</span>}
                </div>
                <h1 className="font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-5xl">
                  {nextEvent.name}
                </h1>
                <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" />
                    {formatArg(countdownTarget!, { weekday: "long", day: "numeric", month: "long" })} ·{" "}
                    {formatArg(countdownTarget!, { hour: "2-digit", minute: "2-digit" })} hs (ARG)
                  </span>
                  {(nextEvent.circuit || nextEvent.location) && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {[nextEvent.circuit, countryEs(nextEvent.country)].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap items-end gap-4">
                {countdownTarget && <Countdown target={countdownTarget} />}
                <Link href={`/carreras/${nextEvent.id}`} className="btn-primary">
                  Ver horarios
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Motor Nacional</span>
              <h1 className="font-display mt-2 text-4xl font-extrabold uppercase leading-[0.95] sm:text-5xl">
                El automovilismo argentino en un solo lugar
              </h1>
              <p className="mt-3 max-w-lg text-muted-foreground">
                Seguí a los pilotos argentinos en el país y en el mundo: resultados, calendario, campeonatos y noticias.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-border bg-background/50 p-4 backdrop-blur">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 text-primary" /> Agenda
            </p>
            {upcoming.length > 1 ? (
              <ul className="space-y-1">
                {upcoming.slice(1, 6).map((ev) => (
                  <li key={ev.id}>
                    <Link href={`/carreras/${ev.id}`} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent">
                      <span className="w-12 text-center">
                        <span className="block text-[10px] font-bold uppercase text-muted-foreground">
                          {formatArg(ev.date, { month: "short" }).replace(".", "")}
                        </span>
                        <span className="font-display text-xl font-bold leading-none">{formatArg(ev.date, { day: "numeric" })}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{ev.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {ev.category.shortName}
                          {ev.location ? ` · ${ev.location}` : ""}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No hay más carreras programadas por ahora.</p>
            )}
            <Link href="/calendario" className="mt-2 block text-center text-sm font-medium text-primary hover:underline">
              Calendario completo
            </Link>
          </div>
        </div>
      </section>

      {/* Pilotos seguidos / destacados */}
      <section>
        <SectionHeader
          title={followedIds.length ? "Tus pilotos" : "Argentinos para seguir"}
          icon={followedIds.length ? Star : Users}
          href={followedIds.length ? "/mis-pilotos" : "/pilotos"}
          linkLabel={followedIds.length ? "Ver mis pilotos" : "Todos los pilotos"}
        />
        {featuredPilots.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPilots.map((p) => {
              const last = p.results[0];
              const standing = p.standings[0];
              return (
                <div key={p.id} className="card group relative flex min-w-0 items-center gap-4 p-4 transition-shadow hover:shadow-md">
                  <PilotAvatar name={p.fullName} imageUrl={p.profileImageUrl} size={56} />
                  <div className="min-w-0 flex-1">
                    <CategoryBadge category={p.category} />
                    <Link href={`/pilotos/${p.slug}`} className="mt-1 block truncate font-semibold hover:text-primary">
                      <span className="absolute inset-0" />
                      {p.fullName}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {last ? (
                        <>
                          Último: <b className="text-foreground">P{last.position}</b> en {last.raceEvent?.name}
                        </>
                      ) : (
                        p.team || "Sin resultados cargados"
                      )}
                    </p>
                  </div>
                  {standing ? (
                    <div className="text-center">
                      <p className="font-display text-2xl font-bold leading-none">{standing.position}°</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Campeonato</p>
                    </div>
                  ) : (
                    !followed.has(p.id) && <FollowButton pilotId={p.id} initialFollowing={false} size="sm" />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={Users} title="Todavía no hay pilotos cargados" />
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Último resultado */}
        <section className="card overflow-hidden">
          <div className="flex items-start justify-between gap-4 border-b border-border p-5">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                <Trophy className="h-4 w-4 text-secondary" /> Último resultado
              </p>
              {lastEvent && (
                <>
                  <h2 className="mt-1 truncate text-lg font-bold">{lastEvent.name}</h2>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <CategoryBadge category={lastEvent.category} />
                    {formatDistanceToNow(lastEvent.date, { addSuffix: true, locale: es })}
                  </div>
                </>
              )}
            </div>
          </div>
          {lastEvent ? (
            <>
              <ul className="divide-y divide-border">
                {[...lastTop, ...lastTracked].map((r) => (
                  <li key={r.id} className={cn("flex items-center gap-3 px-5 py-2.5", r.pilot && "bg-primary/[0.06]")}>
                    <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold", positionBadgeClass(r.position))}>
                      {r.position}
                    </span>
                    <span>{r.pilotFlag || "🏁"}</span>
                    <span className="min-w-0 flex-1 truncate">
                      {r.pilot ? (
                        <Link href={`/pilotos/${r.pilot.slug}`} className="font-semibold text-primary hover:underline">
                          {r.pilot.fullName}
                        </Link>
                      ) : (
                        <span className="font-medium">{r.pilotName}</span>
                      )}
                      {r.team && <span className="ml-2 hidden text-xs text-muted-foreground sm:inline">{r.team}</span>}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">{r.timeGap || "—"}</span>
                  </li>
                ))}
              </ul>
              <Link href={`/carreras/${lastEvent.id}`} className="block border-t border-border py-3 text-center text-sm font-medium text-primary hover:bg-accent/50">
                Clasificación completa
              </Link>
            </>
          ) : (
            <p className="p-5 text-sm text-muted-foreground">Todavía no hay resultados cargados.</p>
          )}
        </section>

        {/* Campeonato */}
        <section className="card overflow-hidden">
          <div className="border-b border-border p-5">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
              <Medal className="h-4 w-4 text-secondary" /> Campeonato
            </p>
            {mainStanding && (
              <h2 className="mt-1 text-lg font-bold">
                {mainStanding.name} {mainStanding.season}
              </h2>
            )}
          </div>
          {standings.length ? (
            <>
              <StandingsTable rows={[...topStandings, ...trackedOutsideTop]} />
              <Link href="/campeonatos" className="block border-t border-border py-3 text-center text-sm font-medium text-primary hover:bg-accent/50">
                Ver todos los campeonatos
              </Link>
            </>
          ) : (
            <p className="p-5 text-sm text-muted-foreground">Todavía no hay campeonatos cargados.</p>
          )}
        </section>
      </div>

      {/* Noticias */}
      <section>
        <SectionHeader
          title={personalNews.length ? "Noticias de tus pilotos" : "Últimas noticias"}
          icon={Newspaper}
          href="/noticias"
          linkLabel="Todas las noticias"
        />
        {news.length ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="grid gap-6 md:grid-cols-2 lg:col-span-2">
              {news.slice(0, 1).map((n) => (
                <NewsCard key={n.id} news={n} variant="featured" />
              ))}
              {news.slice(1, 3).map((n) => (
                <NewsCard key={n.id} news={n} />
              ))}
            </div>
            <div className="card p-3">
              <p className="px-2 pb-2 pt-1 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">Más noticias</p>
              <div className="space-y-1">
                {news.slice(3).map((n) => (
                  <NewsCard key={n.id} news={n} variant="compact" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState icon={Newspaper} title="No hay noticias todavía" description="Se actualizan automáticamente varias veces por día." />
        )}
      </section>

      {upcoming.length > 0 && (
        <section>
          <SectionHeader title="Próximas carreras" icon={CalendarDays} href="/calendario" linkLabel="Calendario" />
          <div className="grid gap-3 md:grid-cols-2">
            {upcoming.slice(0, 4).map((ev) => (
              <EventRow key={ev.id} event={ev} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
