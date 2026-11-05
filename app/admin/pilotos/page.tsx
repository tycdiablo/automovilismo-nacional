import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CategoryBadge, PilotAvatar } from "@/components/ui";

export default async function AdminPilots() {
  const pilots = await prisma.pilot.findMany({
    include: { category: true, _count: { select: { followers: true, results: true, news: true } } },
    orderBy: [{ category: { sortOrder: "asc" } }, { fullName: "asc" }],
  });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{pilots.length} pilotos</p>
        <Link href="/admin/pilotos/nuevo" className="btn-primary">
          <Plus className="h-4 w-4" /> Nuevo piloto
        </Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Piloto</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="hidden px-4 py-3 md:table-cell">Equipo</th>
              <th className="px-4 py-3 text-right">Seguidores</th>
              <th className="hidden px-4 py-3 text-right sm:table-cell">Resultados</th>
              <th className="hidden px-4 py-3 text-right sm:table-cell">Noticias</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pilots.map((p) => (
              <tr key={p.id} className="hover:bg-accent/40">
                <td className="px-4 py-2.5">
                  <Link href={`/admin/pilotos/${p.id}`} className="flex items-center gap-3 font-medium hover:text-primary">
                    <PilotAvatar name={p.fullName} imageUrl={p.profileImageUrl} size={32} />
                    {p.fullName}
                    {p.featured && <span className="text-secondary">★</span>}
                    {!p.isActive && <span className="text-xs text-muted-foreground">(inactivo)</span>}
                  </Link>
                </td>
                <td className="px-4 py-2.5"><CategoryBadge category={p.category} /></td>
                <td className="hidden px-4 py-2.5 text-muted-foreground md:table-cell">{p.team || "—"}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{p._count.followers}</td>
                <td className="hidden px-4 py-2.5 text-right tabular-nums sm:table-cell">{p._count.results}</td>
                <td className="hidden px-4 py-2.5 text-right tabular-nums sm:table-cell">{p._count.news}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
