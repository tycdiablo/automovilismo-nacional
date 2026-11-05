import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Cake, Flag, Hash, Instagram, MapPin, Newspaper, Trophy, Users } from "lucide-react";
import { differenceInYears } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getSeasonStats, newsInclude, getUpcomingEvents } from "@/lib/queries";
import { CategoryBadge, EmptyState, SectionHeader, StatCard } from "@/components/ui";
import { FollowButton } from "@/components/pilots/FollowButton";
import { NewsCard } from "@/components/news/NewsCard";
import { EventRow } from "@/components/events/EventRow";
import { cn, flagFor, formatArg, formatPoints, initials, parseSocials, positionBadgeClass } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function getPilot(slug: string) {
  return prisma.pilot.findUnique({
    where: { slug },
    include: {
      category: true,
      _count: { select: { followers: true } },
      standings: { orderBy: [{ season: "desc" }], take: 1 },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pilot = await getPilot(slug);
  if (!pilot) return { title: "Piloto no encontrado" };
  const description =
    pilot.bio?.slice(0, 160) ||
    `Resultados, campeonato y noticias de ${pilot.fullName}, piloto de ${pilot.category.name}${pilot.team ? ` (${pilot.team})` : ""}.`;
  return {
    title: pilot.fullName,
    description,
    openGraph: { title: pilot.fullName, description, images: pilot.profileImageUrl ? [pilot.profileImageUrl] : undefined },
  };
}

export default async function PilotPage({ params }: Props) {
  const { slug } = await params;
  const pilot = await getPilot(slug);
  if (!pilot) notFound();

  const user = await getCurrentUser();
  const [isFollowing, results, news, upcoming] = await Promise.all([
    user ? prisma.follow.findUnique({ where: { userId_pilotId: { userId: user.id, pilotId: pilot.id } } }).then(Boolean) : false,
    prisma.result.findMany({
      where: { pilotId: pilot.id },
      orderBy: { raceEvent: { date: "desc" } },
      take: 30,
      include: { raceEvent: { select: { id: true, name: true, date: true, season: true, round: true } } },
    }),
    prisma.news.findMany({ where: { pilotId: pilot.id }, orderBy: { publishedAt: "desc" }, take: 6, include: newsInclude }),
    getUpcomingEvents(3, pilot.categoryId),
  ]);

  const standing = pilot.standings[0];
  const season = standing?.season ?? results[0]?.raceEvent?.season ?? new Date().getFullYear();
  const stats = await getSeasonStats(pilot.id, season);
  const socials = parseSocials(pilot.socialMediaHandles);
  const age = pilot.dateOfBirth ? differenceInYears(new Date(), pilot.dateOfBirth) : null;
  const color = pilot.category.color || "#75AADB";

  // Evolución de posiciones en la temporada (de la más vieja a la más nueva)
  const seasonResults = results.filter((r) => r.raceEvent?.season === season).reverse();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: pilot.fullName,
    nationality: pilot.nationality,
    jobTitle: `Piloto de ${pilot.category.name}`,
    ...(pilot.birthPlace ? { birthPlace: pilot.birthPlace } : {}),
    ...(pilot.dateOfBirth ? { birthDate: pilot.dateOfBirth.toISOString().slice(0, 10) } : {}),
    ...(pilot.profileImageUrl ? { image: pilot.profileImageUrl } : {}),
  };

  return (
    <div className="space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/pilotos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Pilotos
      </Link>

      {/* Cabecera */}
      <section
        className="relative overflow-hidden rounded-2xl border border-border"
        style={{ background: `linear-gradient(120deg, ${color}40, transparent 55%), var(--card)` }}
      >
        <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[auto_1fr] md:items-end">
          <div className="relative mx-auto h-44 w-44 overflow-hidden rounded-2xl border border-border bg-muted md:mx-0 md:h-52 md:w-52">
            <div className="absolute inset-0 flex items-center justify-center font-display text-6xl font-extrabold text-foreground/15">
              {initials(pilot.fullName)}
            </div>
            {pilot.profileImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pilot.profileImageUrl} alt={pilot.fullName} referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover object-top" />
            )}
          </div>
          <div className="min-w-0 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <CategoryBadge category={pilot.category} link />
              {pilot.team && <span className="text-sm text-muted-foreground">{pilot.team}</span>}
            </div>
            <h1 className="font-display mt-2 text-4xl font-extrabold uppercase leading-none tracking-tight sm:text-6xl">
              {pilot.fullName}
              {pilot.carNumber !== null && <span className="ml-3 italic" style={{ color }}>#{pilot.carNumber}</span>}
            </h1>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground md:justify-start">
              <span className="flex items-center gap-1.5">
                <Flag className="h-4 w-4" /> {flagFor(pilot.nationality)} {pilot.nationality}
              </span>
              {pilot.birthPlace && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {pilot.birthPlace}
                </span>
              )}
              {age !== null && (
                <span className="flex items-center gap-1.5">
                  <Cake className="h-4 w-4" /> {age} años
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" /> {pilot._count.followers} seguidores
              </span>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <FollowButton pilotId={pilot.id} initialFollowing={isFollowing} />
              {socials.instagram && (
                <a href={`https://instagram.com/${socials.instagram}`} target="_blank" rel="noopener noreferrer" className="btn-outline h-10">
                  <Instagram className="h-4 w-4" /> Instagram
                </a>
              )}
              {socials.x && (
                <a href={`https://x.com/${socials.x}`} target="_blank" rel="noopener noreferrer" className="btn-outline h-10">
                  𝕏 @{socials.x}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section>
        <SectionHeader title={`Temporada ${season}`} icon={Trophy} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Campeonato" value={standing ? `${standing.position}°` : "—"} hint={standing ? `${formatPoints(standing.points)} pts` : undefined} />
          <StatCard label="Carreras" value={stats.races} />
          <StatCard label="Victorias" value={stats.wins} />
          <StatCard label="Podios" value={stats.podiums} />
          <StatCard label="Top 10" value={stats.top10} />
          <StatCard label="Mejor resultado" value={stats.best ? `P${stats.best}` : "—"} />
        </div>

        {seasonResults.length > 1 && (
          <div className="card mt-4 p-5">
            <p className="mb-4 text-sm font-semibold">Posición por carrera</p>
            <div className="flex h-40 items-end gap-0.5 sm:gap-1.5" role="img" aria-label="Gráfico de posiciones por carrera">
              {seasonResults.map((r) => {
                const max = 22;
                const h = Math.max(6, ((max - Math.min(r.position, max) + 1) / max) * 100);
                return (
                  <Link
                    key={r.id}
                    href={`/carreras/${r.raceEvent?.id}`}
                    className="group relative flex min-w-0 flex-1 flex-col items-center justify-end"
                    title={`${r.raceEvent?.name}: P${r.position}`}
                    style={{ height: "100%" }}
                  >
                    <span className="mb-1 hidden text-[10px] font-semibold text-muted-foreground opacity-0 group-hover:opacity-100 sm:block">P{r.position}</span>
                    <span
                      className={cn("w-full rounded-t-md transition-opacity group-hover:opacity-80", r.position <= 3 ? "bg-secondary" : r.position <= 10 ? "bg-primary" : "bg-muted-foreground/30")}
                      style={{ height: `${h}%` }}
                    />
                  </Link>
                );
              })}
            </div>
            <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-secondary" /> Podio</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary" /> Top 10</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-muted-foreground/30" /> Resto</span>
            </div>
          </div>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <SectionHeader title="Resultados recientes" icon={Hash} />
          {results.length ? (
            <div className="card overflow-hidden">
              <ul className="divide-y divide-border">
                {results.slice(0, 12).map((r) => (
                  <li key={r.id}>
                    <Link href={`/carreras/${r.raceEvent?.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-accent/40">
                      <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold", positionBadgeClass(r.position))}>
                        P{r.position}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{r.raceEvent?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.raceEvent && formatArg(r.raceEvent.date, { day: "numeric", month: "short", year: "numeric" })}
                          {r.grid ? ` · Largó ${r.grid}°` : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xs text-muted-foreground">{r.timeGap || "—"}</p>
                        {r.points ? <p className="text-xs font-semibold">+{formatPoints(r.points)} pts</p> : null}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <EmptyState icon={Trophy} title="Sin resultados cargados" description="Cuando haya resultados de sus carreras aparecerán acá." />
          )}
        </section>

        <div className="space-y-8">
          {pilot.bio && (
            <section>
              <SectionHeader title="Biografía" />
              <p className="card p-5 text-sm leading-relaxed text-muted-foreground">{pilot.bio}</p>
            </section>
          )}
          <section>
            <SectionHeader title={`Próximas fechas de ${pilot.category.shortName}`} icon={CalendarDays} />
            {upcoming.length ? (
              <div className="space-y-2">
                {upcoming.map((ev) => (
                  <EventRow key={ev.id} event={ev} />
                ))}
              </div>
            ) : (
              <p className="card p-5 text-sm text-muted-foreground">No hay fechas programadas cargadas.</p>
            )}
          </section>
        </div>
      </div>

      <section>
        <SectionHeader title={`Noticias de ${pilot.fullName}`} icon={Newspaper} href={`/noticias?piloto=${pilot.slug}`} />
        {news.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((n) => (
              <NewsCard key={n.id} news={n} />
            ))}
          </div>
        ) : (
          <EmptyState icon={Newspaper} title="Sin noticias recientes" />
        )}
      </section>
    </div>
  );
}
