import type { Metadata } from "next";
import { CalendarDays, CalendarPlus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { findCategoryBySlug, getCategories, eventRowInclude } from "@/lib/queries";
import { EmptyState, FilterChips, PageHeader } from "@/components/ui";
import { EventRow } from "@/components/events/EventRow";
import { categorySlug, formatArg } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Calendario",
  description: "Calendario de carreras del automovilismo argentino y de las categorías internacionales con pilotos argentinos, en horario argentino.",
};

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

export default async function CalendarPage({ searchParams }: Props) {
  const sp = await searchParams;
  const category = await findCategoryBySlug(typeof sp.categoria === "string" ? sp.categoria : undefined);
  const showPast = sp.ver === "pasadas";
  const now = new Date(Date.now() - 3 * 3600 * 1000);

  const [events, categories, used] = await Promise.all([
    prisma.raceEvent.findMany({
      where: {
        ...(category ? { categoryId: category.id } : {}),
        ...(showPast ? { date: { lt: now } } : { date: { gte: now } }),
      },
      orderBy: { date: showPast ? "desc" : "asc" },
      take: showPast ? 60 : 120,
      include: {
        ...eventRowInclude,
        results: { where: { position: 1 }, include: { pilot: { select: { fullName: true } } } },
      },
    }),
    getCategories(),
    prisma.raceEvent.groupBy({ by: ["categoryId"] }),
  ]);

  const usedIds = new Set(used.map((u) => u.categoryId));
  const chips = categories.filter((c) => usedIds.has(c.id)).map((c) => ({ value: categorySlug(c), label: c.shortName, color: c.color }));

  // Agrupar por mes
  const groups = new Map<string, typeof events>();
  for (const ev of events) {
    const key = formatArg(ev.date, { month: "long", year: "numeric" });
    groups.set(key, [...(groups.get(key) ?? []), ev]);
  }

  const icsUrl = `/api/calendar${category ? `?categoria=${categorySlug(category)}` : ""}`;
  const tab = (active: boolean) =>
    `rounded-md px-3 py-1.5 text-sm font-medium ${active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`;
  const catQs = category ? `categoria=${categorySlug(category)}` : "";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendario"
        icon={CalendarDays}
        description="Todas las fechas, con horarios en hora argentina. Suscribite para tenerlas en tu calendario."
        actions={
          <a href={icsUrl} className="btn-outline">
            <CalendarPlus className="h-4 w-4" /> Suscribirme (iCal)
          </a>
        }
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <FilterChips items={chips} active={category ? categorySlug(category) : undefined} basePath="/calendario" extraParams={{ ver: showPast ? "pasadas" : undefined }} />
        <div className="inline-flex rounded-lg bg-muted p-1">
          <a href={`/calendario${catQs ? `?${catQs}` : ""}`} className={tab(!showPast)}>
            Próximas
          </a>
          <a href={`/calendario?ver=pasadas${catQs ? `&${catQs}` : ""}`} className={tab(showPast)}>
            Pasadas
          </a>
        </div>
      </div>

      {events.length ? (
        <div className="space-y-8">
          {[...groups.entries()].map(([month, list]) => (
            <section key={month}>
              <h2 className="font-display mb-3 text-lg font-bold uppercase tracking-wide text-muted-foreground">{month}</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {list.map((ev, i) => (
                  <EventRow key={ev.id} event={ev} highlight={!showPast && i === 0 && month === groups.keys().next().value} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CalendarDays}
          title={showPast ? "No hay carreras pasadas" : "No hay carreras programadas"}
          description="El calendario de F1 se sincroniza automáticamente. Las fechas del resto de las categorías se cargan desde el panel de administración."
        />
      )}
    </div>
  );
}
