import type { Metadata } from "next";
import Link from "next/link";
import { Trophy, MapPin, CalendarDays } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { findCategoryBySlug, getCategories } from "@/lib/queries";
import { CategoryBadge, EmptyState, FilterChips, PageHeader, Pagination } from "@/components/ui";
import { categorySlug, cn, countryEs, formatArg, positionBadgeClass } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resultados",
  description: "Resultados y clasificaciones de las carreras del automovilismo argentino y de los pilotos argentinos en el exterior.",
};

const PER_PAGE = 10;

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

export default async function ResultsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.pagina) || 1);
  const category = await findCategoryBySlug(typeof sp.categoria === "string" ? sp.categoria : undefined);
  const where = { status: "FINISHED", results: { some: {} }, ...(category ? { categoryId: category.id } : {}) };

  const [events, total, categories, used] = await Promise.all([
    prisma.raceEvent.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: {
        category: true,
        results: {
          orderBy: { position: "asc" },
          include: { pilot: { select: { fullName: true, slug: true } } },
        },
      },
    }),
    prisma.raceEvent.count({ where }),
    getCategories(),
    prisma.raceEvent.groupBy({ by: ["categoryId"], where: { status: "FINISHED" } }),
  ]);

  const usedIds = new Set(used.map((u) => u.categoryId));
  const chips = categories.filter((c) => usedIds.has(c.id)).map((c) => ({ value: categorySlug(c), label: c.shortName, color: c.color }));

  return (
    <div className="space-y-6">
      <PageHeader title="Resultados" icon={Trophy} description="Podios y la posición de cada argentino en las últimas carreras." />
      <FilterChips items={chips} active={category ? categorySlug(category) : undefined} basePath="/resultados" />

      {events.length ? (
        <div className="space-y-4">
          {events.map((event) => {
            const podium = event.results.slice(0, 3);
            const argentines = event.results.filter((r) => r.pilot && r.position > 3);
            return (
              <Link
                key={event.id}
                href={`/carreras/${event.id}`}
                className="card group block overflow-hidden transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-5 py-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <CategoryBadge category={event.category} />
                      {event.round && <span className="text-xs text-muted-foreground">Fecha {event.round}</span>}
                    </div>
                    <h2 className="mt-1 text-lg font-bold group-hover:text-primary">{event.name}</h2>
                    <p className="mt-0.5 flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" /> {formatArg(event.date, { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                      {(event.circuit || event.location) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {[event.circuit || event.location, countryEs(event.country)].filter(Boolean).join(", ")}
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-primary">Ver clasificación →</span>
                </div>
                <div className="grid gap-px bg-border sm:grid-cols-3">
                  {podium.map((r) => (
                    <div key={r.id} className={cn("flex items-center gap-3 bg-card px-5 py-3", r.pilot && "bg-primary/[0.06]")}>
                      <span className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold", positionBadgeClass(r.position))}>
                        {r.position}
                      </span>
                      <div className="min-w-0">
                        <p className={cn("truncate text-sm font-semibold", r.pilot && "text-primary")}>
                          {r.pilotFlag} {r.pilot?.fullName || r.pilotName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{r.team || r.timeGap || "—"}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {argentines.length > 0 && (
                  <div className="flex flex-wrap gap-2 border-t border-border px-5 py-3 text-sm">
                    {argentines.map((r) => (
                      <span key={r.id} className="rounded-md bg-primary/10 px-2 py-1 font-medium text-primary">
                        🇦🇷 {r.pilot?.fullName} · P{r.position}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Trophy} title="Todavía no hay resultados" description="Los resultados de F1 se sincronizan solos; el resto se carga desde el panel de administración." />
      )}

      <Pagination page={page} totalPages={Math.ceil(total / PER_PAGE)} basePath="/resultados" params={{ categoria: category ? categorySlug(category) : undefined }} />
    </div>
  );
}
