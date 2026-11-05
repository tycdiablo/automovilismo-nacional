import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { eventRowInclude, newsInclude } from "@/lib/queries";
import { CategoryBadge, EmptyState, PageHeader, PilotAvatar, SectionHeader } from "@/components/ui";
import { NewsCard } from "@/components/news/NewsCard";
import { EventRow } from "@/components/events/EventRow";
import { categorySlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Buscar", robots: { index: false } };

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q: raw } = await searchParams;
  const q = (raw ?? "").trim().slice(0, 80);

  if (!q) {
    return (
      <div className="space-y-6">
        <PageHeader title="Buscar" icon={Search} description="Buscá pilotos, categorías, carreras y noticias." />
        <form className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input name="q" type="search" autoFocus placeholder="Ej: Colapinto, Turismo Carretera, Interlagos…" className="input h-12 pl-9 text-base" />
        </form>
      </div>
    );
  }

  const contains = { contains: q, mode: "insensitive" as const };
  const [pilots, categories, events, news] = await Promise.all([
    prisma.pilot.findMany({
      where: { OR: [{ fullName: contains }, { aliases: contains }, { team: contains }] },
      include: { category: { select: { shortName: true, slug: true, color: true } } },
      take: 8,
    }),
    prisma.category.findMany({ where: { OR: [{ name: contains }, { shortName: contains }] }, take: 6 }),
    prisma.raceEvent.findMany({
      where: { OR: [{ name: contains }, { circuit: contains }, { location: contains }, { country: contains }] },
      orderBy: { date: "desc" },
      include: eventRowInclude,
      take: 6,
    }),
    prisma.news.findMany({
      where: { OR: [{ title: contains }, { summary: contains }] },
      orderBy: { publishedAt: "desc" },
      include: newsInclude,
      take: 9,
    }),
  ]);
  const total = pilots.length + categories.length + events.length + news.length;

  return (
    <div className="space-y-10">
      <PageHeader title={`Resultados para “${q}”`} icon={Search} description={`${total} coincidencia${total === 1 ? "" : "s"}`} />

      {total === 0 && <EmptyState icon={Search} title="No encontramos nada" description="Probá con otra palabra, el apellido de un piloto o el nombre de una categoría." />}

      {(pilots.length > 0 || categories.length > 0) && (
        <section>
          <SectionHeader title="Pilotos y categorías" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {pilots.map((p) => (
              <Link key={p.id} href={`/pilotos/${p.slug}`} className="card flex items-center gap-3 p-3 hover:border-primary/40">
                <PilotAvatar name={p.fullName} imageUrl={p.profileImageUrl} size={44} />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{p.fullName}</p>
                  <CategoryBadge category={p.category} />
                </div>
              </Link>
            ))}
            {categories.map((c) => (
              <Link key={c.id} href={`/categorias/${categorySlug(c)}`} className="card flex items-center gap-3 p-3 hover:border-primary/40">
                <span className="font-display flex h-11 w-11 items-center justify-center rounded-full text-sm font-extrabold" style={{ backgroundColor: `${c.color}22`, color: c.color ?? undefined }}>
                  {c.shortName.slice(0, 3)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">Categoría</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {events.length > 0 && (
        <section>
          <SectionHeader title="Carreras" />
          <div className="grid gap-3 md:grid-cols-2">{events.map((ev) => <EventRow key={ev.id} event={ev} />)}</div>
        </section>
      )}

      {news.length > 0 && (
        <section>
          <SectionHeader title="Noticias" href={`/noticias?q=${encodeURIComponent(q)}`} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{news.map((n) => <NewsCard key={n.id} news={n} />)}</div>
        </section>
      )}
    </div>
  );
}
