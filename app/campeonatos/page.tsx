import type { Metadata } from "next";
import { Medal } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getStandingCategories } from "@/lib/queries";
import { EmptyState, FilterChips, PageHeader } from "@/components/ui";
import { StandingsTable } from "@/components/standings/StandingsTable";
import { categorySlug, formatArg } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Campeonatos",
  description: "Tablas de posiciones de los campeonatos con pilotos argentinos: Fórmula 1, Turismo Carretera, TC2000 y más.",
};

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

export default async function StandingsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const categories = await getStandingCategories();
  const slug = typeof sp.categoria === "string" ? sp.categoria : undefined;
  const selected = categories.find((c) => categorySlug(c) === slug) ?? categories[0];

  if (!selected) {
    return (
      <div className="space-y-6">
        <PageHeader title="Campeonatos" icon={Medal} />
        <EmptyState icon={Medal} title="Todavía no hay campeonatos cargados" description="El campeonato de F1 se sincroniza solo; el resto se carga desde el panel de administración." />
      </div>
    );
  }

  const [drivers, teams] = await Promise.all([
    prisma.standing.findMany({
      where: { categoryId: selected.id, season: selected.season, kind: "DRIVER" },
      orderBy: { position: "asc" },
      include: { pilot: { select: { slug: true } } },
    }),
    prisma.standing.findMany({
      where: { categoryId: selected.id, season: selected.season, kind: "TEAM" },
      orderBy: { position: "asc" },
    }),
  ]);
  const updated = [...drivers, ...teams].reduce<Date | null>((acc, s) => (!acc || s.updatedAt > acc ? s.updatedAt : acc), null);
  const argentines = drivers.filter((d) => d.pilot);

  return (
    <div className="space-y-6">
      <PageHeader title="Campeonatos" icon={Medal} description="Las tablas de posiciones, con los argentinos destacados." />
      <FilterChips
        items={categories.map((c) => ({ value: categorySlug(c), label: c.shortName, color: c.color }))}
        active={categorySlug(selected)}
        basePath="/campeonatos"
        allLabel="Principal"
      />

      <div>
        <h2 className="font-display text-2xl font-bold">
          {selected.name} · {selected.season}
        </h2>
        {updated && (
          <p className="text-sm text-muted-foreground">Actualizado el {formatArg(updated, { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })} hs</p>
        )}
      </div>

      {argentines.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {argentines.map((a) => (
            <div key={a.id} className="card flex items-center gap-3 border-primary/40 px-4 py-3">
              <span className="font-display text-3xl font-extrabold text-primary">{a.position}°</span>
              <div>
                <p className="font-semibold">🇦🇷 {a.name}</p>
                <p className="text-xs text-muted-foreground">
                  {a.points} pts{a.team ? ` · ${a.team}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={teams.length ? "grid gap-6 xl:grid-cols-[1.4fr_1fr]" : ""}>
        <section className="card overflow-hidden">
          <p className="border-b border-border px-5 py-3 font-semibold">Pilotos</p>
          <StandingsTable rows={drivers} />
        </section>
        {teams.length > 0 && (
          <section className="card h-fit overflow-hidden">
            <p className="border-b border-border px-5 py-3 font-semibold">Equipos / Constructores</p>
            <StandingsTable rows={teams} kind="TEAM" />
          </section>
        )}
      </div>
    </div>
  );
}
