import { Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/queries";
import { ActionForm, Field } from "@/components/admin/ActionForm";
import { deleteNewsAction, saveNewsAction } from "../actions";
import { formatArg } from "@/lib/utils";

export default async function AdminNews() {
  const [categories, pilots, news] = await Promise.all([
    getCategories(),
    prisma.pilot.findMany({ orderBy: { fullName: "asc" }, select: { id: true, fullName: true } }),
    prisma.news.findMany({ orderBy: { publishedAt: "desc" }, take: 60, include: { category: true, pilot: true } }),
  ]);

  return (
    <div className="space-y-6">
      <section className="card space-y-3 p-5">
        <h2 className="font-semibold">Agregar noticia manualmente</h2>
        <ActionForm action={saveNewsAction} submitLabel="Publicar">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Título *" className="sm:col-span-2"><input name="title" required className="input" /></Field>
            <Field label="URL de la nota *"><input name="originalUrl" type="url" required className="input" /></Field>
            <Field label="Medio" hint="Si lo dejás vacío se usa el dominio"><input name="sourceName" className="input" /></Field>
            <Field label="URL de imagen"><input name="imageUrl" type="url" className="input" /></Field>
            <Field label="Fecha de publicación"><input name="publishedAt" type="datetime-local" className="input" /></Field>
            <Field label="Categoría">
              <select name="categoryId" className="input" defaultValue="">
                <option value="">—</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Piloto">
              <select name="pilotId" className="input" defaultValue="">
                <option value="">—</option>
                {pilots.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
              </select>
            </Field>
            <Field label="Resumen" className="sm:col-span-2"><textarea name="summary" rows={3} className="input" /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="notify" /> Notificar a los seguidores del piloto</label>
        </ActionForm>
      </section>

      <section className="card overflow-hidden">
        <h2 className="border-b border-border px-5 py-3 font-semibold">Últimas noticias</h2>
        <ul className="divide-y divide-border text-sm">
          {news.map((n) => (
            <li key={n.id} className="flex items-center gap-3 px-5 py-2.5">
              <span className="w-24 shrink-0 text-xs text-muted-foreground">{formatArg(n.publishedAt, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
              <a href={n.originalUrl} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate hover:text-primary">
                {n.title}
              </a>
              <span className="hidden w-28 shrink-0 truncate text-xs text-muted-foreground md:block">{n.sourceName}</span>
              <span className="hidden w-20 shrink-0 text-xs text-muted-foreground sm:block">{n.category?.shortName ?? "—"}</span>
              <form action={deleteNewsAction}>
                <input type="hidden" name="id" value={n.id} />
                <button className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="Eliminar" aria-label="Eliminar noticia">
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
