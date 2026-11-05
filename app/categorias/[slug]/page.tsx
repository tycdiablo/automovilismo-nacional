import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, ExternalLink, Medal, Newspaper, Trophy, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { findCategoryBySlug, getFollowedPilotIds, getUpcomingEvents, newsInclude, pilotCardInclude, eventRowInclude } from "@/lib/queries";
import { EmptyState, SectionHeader } from "@/components/ui";
import { EventRow } from "@/components/events/EventRow";
import { PilotCard } from "@/components/pilots/PilotCard";
import { NewsCard } from "@/components/news/NewsCard";
import { StandingsTable } from "@/components/standings/StandingsTable";
import { categorySlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await findCategoryBySlug(slug);
  if (!category) return { title: "Categoría no encontrada" };
  return {
    title: category.name,
    description: category.description || `Calendario, resultados, campeonato, pilotos y noticias de ${category.name}.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await findCategoryBySlug(slug);
  if (!category) notFound();

  const user = await getCurrentUser();
  const [followed, pilots, upcoming, recent, news, latestStanding] = await Promise.all([
    getFollowedPilotIds(user?.id),
    prisma.pilot.findMany({ where: { categoryId: category.id, isActive: true }, include: pilotCardInclude, orderBy: [{ featured: "desc" }, { fullName: "asc" }] }),
    getUpcomingEvents(4, category.id),
    prisma.raceEvent.findMany({
      where: { categoryId: category.id, status: "FINISHED" },
      orderBy: { date: "desc" },
      take: 4,
      include: { ...eventRowInclude, results: { where: { position: 1 }, include: { pilot: { select: { fullName: true } } } } },
    }),
    prisma.news.findMany({ where: { categoryId: category.id }, orderBy: { publishedAt: "desc" }, take: 6, include: newsInclude }),
    prisma.standing.findFirst({ where: { categoryId: category.id }, orderBy: { season: "desc" }, select: { season: true } }),
  ]);

  const standings = latestStanding
    ? await prisma.standing.findMany({
        where: { categoryId: category.id, season: latestStanding.season, kind: "DRIVER" },
        orderBy: { position: "asc" },
        include: { pilot: { select: { slug: true } } },
      })
    : [];
  const color = category.color || "#75AADB";

  return (
    <div className="space-y-10">
      <Link href="/categorias" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Categorías
      </Link>

      <section className="relative overflow-hidden rounded-2xl border border-border p-6 sm:p-8" style={{ background: `linear-gradient(120deg, ${color}38, transparent 60%), var(--card)` }}>
        <p className="font-display text-5xl font-extrabold uppercase leading-none sm:text-7xl" style={{ color }}>
          {category.shortName}
        </p>
        <h1 className="mt-2 text-2xl font-bold">{category.name}</h1>
        {category.description && <p className="mt-2 max-w-2xl text-muted-foreground">{category.description}</p>}
        <div className="mt-5 flex flex-wrap gap-2">
          <a href={`/api/calendar?categoria=${categorySlug(category)}`} className="btn-outline">
            <CalendarDays className="h-4 w-4" /> Calendario iCal
          </a>
          {category.website && (
            <a href={category.website} target="_blank" rel="noopener noreferrer" className="btn-outline">
              <ExternalLink className="h-4 w-4" /> Sitio oficial
            </a>
          )}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <SectionHeader title="Próximas fechas" icon={CalendarDays} href={`/calendario?categoria=${categorySlug(category)}`} />
          {upcoming.length ? (
            <div className="space-y-2">{upcoming.map((ev) => <EventRow key={ev.id} event={ev} />)}</div>
          ) : (
            <p className="card p-5 text-sm text-muted-foreground">No hay fechas programadas cargadas.</p>
          )}
        </section>
        <section>
          <SectionHeader title="Últimas carreras" icon={Trophy} href={`/resultados?categoria=${categorySlug(category)}`} />
          {recent.length ? (
            <div className="space-y-2">{recent.map((ev) => <EventRow key={ev.id} event={ev} />)}</div>
          ) : (
            <p className="card p-5 text-sm text-muted-foreground">Todavía no hay resultados cargados.</p>
          )}
        </section>
      </div>

      {standings.length > 0 && (
        <section>
          <SectionHeader title={`Campeonato ${latestStanding?.season}`} icon={Medal} href={`/campeonatos?categoria=${categorySlug(category)}`} />
          <div className="card overflow-hidden">
            <StandingsTable rows={standings} limit={10} />
          </div>
        </section>
      )}

      <section>
        <SectionHeader title="Pilotos argentinos" icon={Users} />
        {pilots.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pilots.map((p) => <PilotCard key={p.id} pilot={p} isFollowing={followed.has(p.id)} />)}
          </div>
        ) : (
          <EmptyState icon={Users} title="No hay pilotos cargados en esta categoría" />
        )}
      </section>

      <section>
        <SectionHeader title="Noticias" icon={Newspaper} href={`/noticias?categoria=${categorySlug(category)}`} />
        {news.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{news.map((n) => <NewsCard key={n.id} news={n} />)}</div>
        ) : (
          <EmptyState icon={Newspaper} title="Sin noticias recientes" />
        )}
      </section>
    </div>
  );
}
