import type { Metadata } from "next";
import Link from "next/link";
import { Globe2, LayoutGrid, MapPinned } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { categorySlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Categorías",
  description: "Las categorías del automovilismo nacional e internacional donde compiten pilotos argentinos.",
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { pilots: true, raceEvents: true, news: true } } },
  });
  const national = categories.filter((c) => !c.isInternational);
  const international = categories.filter((c) => c.isInternational);

  const Grid = ({ list }: { list: typeof categories }) => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((c) => {
        const color = c.color || "#75AADB";
        return (
          <Link
            key={c.id}
            href={`/categorias/${categorySlug(c)}`}
            className="card group relative overflow-hidden p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: color }} />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-3xl font-extrabold uppercase" style={{ color }}>
                  {c.shortName}
                </p>
                <p className="font-semibold group-hover:text-primary">{c.name}</p>
              </div>
            </div>
            {c.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>}
            <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
              <span><b className="text-foreground">{c._count.pilots}</b> pilotos</span>
              <span><b className="text-foreground">{c._count.raceEvents}</b> carreras</span>
              <span><b className="text-foreground">{c._count.news}</b> noticias</span>
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-10">
      <PageHeader title="Categorías" icon={LayoutGrid} description="Dónde corren los argentinos, en casa y en el mundo." />
      <section>
        <h2 className="font-display mb-4 flex items-center gap-2 text-xl font-bold">
          <MapPinned className="h-5 w-5 text-primary" /> Nacionales
        </h2>
        <Grid list={national} />
      </section>
      <section>
        <h2 className="font-display mb-4 flex items-center gap-2 text-xl font-bold">
          <Globe2 className="h-5 w-5 text-primary" /> Internacionales
        </h2>
        <Grid list={international} />
      </section>
    </div>
  );
}
