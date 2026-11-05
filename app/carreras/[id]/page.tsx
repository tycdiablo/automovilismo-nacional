import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarPlus, CalendarDays, Clock, MapPin, Trophy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CategoryBadge, EmptyState, SectionHeader } from "@/components/ui";
import { ResultsTable } from "@/components/events/ResultsTable";
import { Countdown } from "@/components/events/Countdown";
import { NewsCard } from "@/components/news/NewsCard";
import { categorySlug, countryEs, EVENT_STATUS_LABEL, formatArg, parseSessions } from "@/lib/utils";
import { newsInclude } from "@/lib/queries";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

async function getEvent(id: string) {
  return prisma.raceEvent.findUnique({
    where: { id },
    include: {
      category: true,
      results: {
        orderBy: { position: "asc" },
        include: { pilot: { select: { fullName: true, slug: true, nationality: true } } },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return { title: "Carrera no encontrada" };
  const title = `${event.name} · ${event.category.shortName}${event.season ? ` ${event.season}` : ""}`;
  return {
    title,
    description:
      event.status === "FINISHED"
        ? `Resultados completos de ${event.name} de ${event.category.name}.`
        : `Horarios y toda la información de ${event.name} de ${event.category.name}.`,
  };
}

export default async function EventPage({ params }: Props) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  const sessions = parseSessions(event.sessions);
  const race = sessions.find((s) => s.name === "Carrera");
  const start = race ? new Date(race.date) : event.date;
  const finished = event.status === "FINISHED" && event.results.length > 0;
  const upcoming = !finished && event.status !== "CANCELLED" && start.getTime() > Date.now() - 3 * 3600 * 1000;

  const [prev, next, relatedNews] = await Promise.all([
    prisma.raceEvent.findFirst({ where: { categoryId: event.categoryId, date: { lt: event.date } }, orderBy: { date: "desc" }, select: { id: true, name: true } }),
    prisma.raceEvent.findFirst({ where: { categoryId: event.categoryId, date: { gt: event.date } }, orderBy: { date: "asc" }, select: { id: true, name: true } }),
    prisma.news.findMany({
      where: {
        categoryId: event.categoryId,
        publishedAt: { gte: new Date(event.date.getTime() - 5 * 86400000), lte: new Date(event.date.getTime() + 4 * 86400000) },
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: newsInclude,
    }),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: event.name,
    startDate: start.toISOString(),
    sport: "Motorsport",
    eventStatus: event.status === "CANCELLED" ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
    location: { "@type": "Place", name: event.circuit || event.location || event.name, address: [event.location, event.country].filter(Boolean).join(", ") },
    organizer: { "@type": "Organization", name: event.category.name },
  };

  return (
    <div className="space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href={finished ? "/resultados" : "/calendario"} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {finished ? "Resultados" : "Calendario"}
      </Link>

      <section className="hero-gradient overflow-hidden rounded-2xl border border-border p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={event.category} link />
          {event.season && <span className="text-xs text-muted-foreground">Temporada {event.season}</span>}
          {event.round && <span className="text-xs text-muted-foreground">· Fecha {event.round}</span>}
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {EVENT_STATUS_LABEL[event.status] ?? event.status}
          </span>
        </div>
        <h1 className="font-display mt-3 text-4xl font-extrabold uppercase leading-[0.95] sm:text-5xl">{event.name}</h1>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            {formatArg(start, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </span>
          {(event.circuit || event.location) && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {[event.circuit, event.location, countryEs(event.country)].filter(Boolean).join(" · ")}
            </span>
          )}
        </div>
        {event.description && <p className="mt-4 max-w-3xl text-muted-foreground">{event.description}</p>}
        {upcoming && (
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Countdown target={start.toISOString()} />
            <a href={`/api/calendar?categoria=${categorySlug(event.category)}`} className="btn-outline">
              <CalendarPlus className="h-4 w-4" /> Agregar a mi calendario
            </a>
          </div>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <section>
          <SectionHeader title={finished ? "Clasificación final" : "Resultados"} icon={Trophy} />
          {finished ? (
            <div className="card overflow-hidden">
              <ResultsTable results={event.results} showGrid={event.results.some((r) => r.grid)} />
            </div>
          ) : (
            <EmptyState icon={Trophy} title="Todavía no hay resultados" description="Van a aparecer acá cuando termine la carrera." />
          )}
        </section>

        <aside className="space-y-6">
          {sessions.length > 0 && (
            <div className="card p-5">
              <p className="mb-3 flex items-center gap-2 font-semibold">
                <Clock className="h-4 w-4 text-primary" /> Horarios (hora argentina)
              </p>
              <ul className="space-y-2.5">
                {sessions.map((s) => {
                  const past = new Date(s.date).getTime() < Date.now();
                  return (
                    <li key={s.name} className={`flex items-center justify-between gap-3 text-sm ${past ? "text-muted-foreground" : ""}`}>
                      <span className={s.name === "Carrera" ? "font-semibold" : ""}>{s.name}</span>
                      <span className="text-right tabular-nums">
                        {formatArg(s.date, { weekday: "short", day: "numeric" })} ·{" "}
                        <b>{formatArg(s.date, { hour: "2-digit", minute: "2-digit" })}</b>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <div className="card divide-y divide-border">
            {prev && (
              <Link href={`/carreras/${prev.id}`} className="block p-4 text-sm hover:bg-accent/40">
                <span className="text-xs text-muted-foreground">← Fecha anterior</span>
                <p className="font-medium">{prev.name}</p>
              </Link>
            )}
            {next && (
              <Link href={`/carreras/${next.id}`} className="block p-4 text-sm hover:bg-accent/40">
                <span className="text-xs text-muted-foreground">Fecha siguiente →</span>
                <p className="font-medium">{next.name}</p>
              </Link>
            )}
            <Link href={`/categorias/${categorySlug(event.category)}`} className="block p-4 text-sm text-primary hover:bg-accent/40">
              Todo sobre {event.category.name}
            </Link>
          </div>
        </aside>
      </div>

      {relatedNews.length > 0 && (
        <section>
          <SectionHeader title="Noticias relacionadas" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedNews.map((n) => (
              <NewsCard key={n.id} news={n} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
