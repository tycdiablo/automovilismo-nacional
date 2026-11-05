import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { findCategoryBySlug, getCategories } from "@/lib/queries";
import { CategoryBadge, FilterChips } from "@/components/ui";
import { categorySlug, EVENT_STATUS_LABEL, formatArg } from "@/lib/utils";

type Props = { searchParams: Promise<{ categoria?: string }> };

export default async function AdminEvents({ searchParams }: Props) {
  const { categoria } = await searchParams;
  const category = await findCategoryBySlug(categoria);
  const [events, categories] = await Promise.all([
    prisma.raceEvent.findMany({
      where: category ? { categoryId: category.id } : {},
      orderBy: { date: "desc" },
      take: 150,
      include: { category: true, _count: { select: { results: true } } },
    }),
    getCategories(),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterChips items={categories.map((c) => ({ value: categorySlug(c), label: c.shortName, color: c.color }))} active={categoria} basePath="/admin/carreras" />
        <Link href="/admin/carreras/nuevo" className="btn-primary shrink-0">
          <Plus className="h-4 w-4" /> Nueva carrera
        </Link>
      </div>
      <p className="text-xs text-muted-foreground">Las carreras de F1 se sincronizan automáticamente: los cambios manuales pueden pisarse en la próxima sincronización.</p>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Carrera</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Resultados</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {events.map((e) => (
              <tr key={e.id} className="hover:bg-accent/40">
                <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">{formatArg(e.date, { day: "2-digit", month: "2-digit", year: "numeric" })}</td>
                <td className="px-4 py-2.5">
                  <Link href={`/admin/carreras/${e.id}`} className="font-medium hover:text-primary">{e.name}</Link>
                </td>
                <td className="px-4 py-2.5"><CategoryBadge category={e.category} /></td>
                <td className="px-4 py-2.5 text-muted-foreground">{EVENT_STATUS_LABEL[e.status] ?? e.status}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{e._count.results}</td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No hay carreras cargadas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
