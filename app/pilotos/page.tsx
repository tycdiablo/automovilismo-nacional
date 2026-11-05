import type { Metadata } from "next";
import { Search, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { findCategoryBySlug, getCategories, getFollowedPilotIds, pilotCardInclude } from "@/lib/queries";
import { EmptyState, FilterChips, PageHeader } from "@/components/ui";
import { PilotCard } from "@/components/pilots/PilotCard";
import { categorySlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pilotos argentinos",
  description: "Todos los pilotos argentinos que compiten en el país y en el mundo. Seguí a tus favoritos y recibí alertas.",
};

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

export default async function PilotsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const query = typeof sp.search === "string" ? sp.search.trim() : "";
  const categoryParam = typeof sp.categoria === "string" ? sp.categoria : undefined;
  const scope = sp.ambito === "nacional" || sp.ambito === "internacional" ? sp.ambito : undefined;

  const [categories, user, category] = await Promise.all([
    getCategories(),
    getCurrentUser(),
    findCategoryBySlug(categoryParam),
  ]);
  const followed = await getFollowedPilotIds(user?.id);

  const pilots = await prisma.pilot.findMany({
    where: {
      isActive: true,
      ...(category ? { categoryId: category.id } : {}),
      ...(scope ? { category: { isInternational: scope === "internacional" } } : {}),
      ...(query
        ? {
            OR: [
              { fullName: { contains: query, mode: "insensitive" } },
              { aliases: { contains: query, mode: "insensitive" } },
              { team: { contains: query, mode: "insensitive" } },
              { category: { name: { contains: query, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: pilotCardInclude,
    orderBy: [{ featured: "desc" }, { category: { sortOrder: "asc" } }, { fullName: "asc" }],
  });

  const usedCategoryIds = new Set(
    (await prisma.pilot.groupBy({ by: ["categoryId"], where: { isActive: true } })).map((g) => g.categoryId)
  );
  const chips = categories
    .filter((c) => usedCategoryIds.has(c.id))
    .map((c) => ({ value: categorySlug(c), label: c.shortName, color: c.color }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pilotos"
        icon={Users}
        description="Los argentinos que compiten en el país y en el mundo. Seguí a tus favoritos para armar tu inicio personalizado y recibir alertas."
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <FilterChips items={chips} active={category ? categorySlug(category) : undefined} basePath="/pilotos" extraParams={{ search: query || undefined }} />
        <form method="GET" className="relative w-full lg:max-w-xs">
          {category && <input type="hidden" name="categoria" value={categorySlug(category)} />}
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input name="search" type="search" defaultValue={query} placeholder="Buscar piloto, equipo o categoría…" className="input pl-9" />
        </form>
      </div>

      <p className="text-sm text-muted-foreground">
        {pilots.length} piloto{pilots.length === 1 ? "" : "s"}
        {category ? ` en ${category.name}` : ""}
        {query ? ` para “${query}”` : ""}
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pilots.map((pilot) => (
          <PilotCard key={pilot.id} pilot={pilot} isFollowing={followed.has(pilot.id)} />
        ))}
        {pilots.length === 0 && (
          <EmptyState icon={Search} title="No encontramos pilotos" description="Probá con otro nombre o quitá los filtros." />
        )}
      </div>
    </div>
  );
}
