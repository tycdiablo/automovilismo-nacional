import type { Metadata } from "next";
import { Newspaper, Search } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { findCategoryBySlug, getCategories, newsInclude } from "@/lib/queries";
import { EmptyState, FilterChips, PageHeader, Pagination } from "@/components/ui";
import { NewsCard } from "@/components/news/NewsCard";
import { categorySlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Noticias",
  description: "Las últimas noticias del automovilismo argentino y de los pilotos argentinos en el mundo, de los principales medios.",
};

const PER_PAGE = 18;

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

export default async function NewsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const page = Math.max(1, Number(sp.pagina) || 1);
  const category = await findCategoryBySlug(typeof sp.categoria === "string" ? sp.categoria : undefined);
  const pilotSlug = typeof sp.piloto === "string" ? sp.piloto : undefined;
  const fuente = typeof sp.fuente === "string" ? sp.fuente : undefined;

  const where: Prisma.NewsWhereInput = {
    ...(category ? { categoryId: category.id } : {}),
    ...(pilotSlug ? { pilot: { slug: pilotSlug } } : {}),
    ...(fuente ? { sourceName: fuente } : {}),
    ...(q
      ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { summary: { contains: q, mode: "insensitive" } }] }
      : {}),
  };

  const [news, total, categories, usedCats, sources] = await Promise.all([
    prisma.news.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: newsInclude,
    }),
    prisma.news.count({ where }),
    getCategories(),
    prisma.news.groupBy({ by: ["categoryId"], _count: true }),
    prisma.news.groupBy({ by: ["sourceName"], _count: true, orderBy: { _count: { sourceName: "desc" } } }),
  ]);

  const used = new Set(usedCats.map((c) => c.categoryId));
  const chips = categories.filter((c) => used.has(c.id)).map((c) => ({ value: categorySlug(c), label: c.shortName, color: c.color }));
  const totalPages = Math.ceil(total / PER_PAGE);
  const params = {
    categoria: category ? categorySlug(category) : undefined,
    piloto: pilotSlug,
    fuente,
    q: q || undefined,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Noticias"
        icon={Newspaper}
        description="Lo último del automovilismo argentino, recopilado automáticamente de los principales medios. Cada nota enlaza a su fuente original."
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <FilterChips items={chips} active={params.categoria} basePath="/noticias" extraParams={{ q: params.q, fuente }} />
        <form method="GET" className="relative w-full lg:max-w-xs">
          {params.categoria && <input type="hidden" name="categoria" value={params.categoria} />}
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input name="q" type="search" defaultValue={q} placeholder="Buscar en noticias…" className="input pl-9" />
        </form>
      </div>

      {sources.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold uppercase tracking-wider">Fuentes:</span>
          {sources.map((s) => {
            const active = fuente === s.sourceName;
            const qs = new URLSearchParams();
            if (params.categoria) qs.set("categoria", params.categoria);
            if (!active) qs.set("fuente", s.sourceName);
            return (
              <a
                key={s.sourceName}
                href={`/noticias${qs.toString() ? `?${qs}` : ""}`}
                className={active ? "rounded-full bg-primary px-2.5 py-1 font-medium text-primary-foreground" : "rounded-full border border-border px-2.5 py-1 hover:text-foreground"}
              >
                {s.sourceName} ({s._count})
              </a>
            );
          })}
        </div>
      )}

      {news.length ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((n, i) => (
            <NewsCard key={n.id} news={n} variant={i === 0 && page === 1 && !q ? "featured" : "default"} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Newspaper} title="No hay noticias para mostrar" description="Probá con otros filtros. Las noticias se actualizan automáticamente varias veces por día." />
      )}

      <Pagination page={page} totalPages={totalPages} basePath="/noticias" params={params} />
    </div>
  );
}
