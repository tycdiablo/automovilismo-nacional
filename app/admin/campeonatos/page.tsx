import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/queries";
import { ActionForm, Field } from "@/components/admin/ActionForm";
import { saveStandingsAction } from "../actions";

export default async function AdminStandings() {
  const categories = await getCategories();
  const loaded = await prisma.standing.groupBy({ by: ["categoryId", "season", "kind"], _count: true, _max: { updatedAt: true } });

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <section className="card space-y-3 p-5">
        <h2 className="font-semibold">Cargar / reemplazar campeonato</h2>
        <p className="text-sm text-muted-foreground">
          Una fila por piloto, columnas separadas por <code>;</code>, <code>|</code> o tabulación:{" "}
          <b>posición ; nombre ; equipo/marca ; puntos ; victorias</b>. Guardar reemplaza la tabla de esa categoría/temporada.
        </p>
        <ActionForm action={saveStandingsAction} submitLabel="Guardar campeonato">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Categoría">
              <select name="categoryId" required className="input">
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Temporada"><input name="season" type="number" required defaultValue={new Date().getFullYear()} className="input" /></Field>
            <Field label="Tipo">
              <select name="kind" className="input">
                <option value="DRIVER">Pilotos</option>
                <option value="TEAM">Equipos / marcas</option>
              </select>
            </Field>
          </div>
          <textarea name="standings" rows={16} required placeholder={"1 ; Julián Santero ; Ford ; 450 ; 3\n2 ; Mariano Werner ; Ford ; 432,5 ; 2"} className="input font-mono text-xs" />
        </ActionForm>
      </section>

      <section className="card h-fit overflow-hidden">
        <h2 className="border-b border-border px-5 py-3 font-semibold">Campeonatos cargados</h2>
        <ul className="divide-y divide-border text-sm">
          {loaded.map((l) => (
            <li key={`${l.categoryId}-${l.season}-${l.kind}`} className="flex justify-between px-5 py-2.5">
              <span>
                {categories.find((c) => c.id === l.categoryId)?.shortName} {l.season} · {l.kind === "TEAM" ? "Equipos" : "Pilotos"}
              </span>
              <span className="text-muted-foreground">{l._count} filas</span>
            </li>
          ))}
          {loaded.length === 0 && <li className="px-5 py-4 text-muted-foreground">Ninguno todavía.</li>}
        </ul>
      </section>
    </div>
  );
}
