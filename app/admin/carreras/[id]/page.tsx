import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/queries";
import { ActionForm, ConfirmButton, Field } from "@/components/admin/ActionForm";
import { deleteEventAction, saveEventAction, saveResultsAction } from "../../actions";
import { parseSessions } from "@/lib/utils";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ creado?: string }> };

/** Date -> "YYYY-MM-DDTHH:mm" en hora argentina (para inputs datetime-local) */
function toArgInput(d: Date) {
  const local = new Date(d.getTime() - 3 * 3600 * 1000);
  return local.toISOString().slice(0, 16);
}

export default async function EditEvent({ params, searchParams }: Props) {
  const { id } = await params;
  const { creado } = await searchParams;
  const isNew = id === "nuevo";
  const [event, categories] = await Promise.all([
    isNew ? null : prisma.raceEvent.findUnique({ where: { id }, include: { results: { orderBy: { position: "asc" } } } }),
    getCategories(),
  ]);
  if (!isNew && !event) notFound();

  const sessionsText = parseSessions(event?.sessions)
    .map((s) => `${s.name} | ${toArgInput(new Date(s.date)).replace("T", " ")}`)
    .join("\n");
  const resultsText = (event?.results ?? [])
    .map((r) => [r.position, r.pilotName ?? "", r.team ?? "", r.timeGap ?? "", r.points ?? ""].join(" ; "))
    .join("\n");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/carreras" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Carreras
        </Link>
        {event && (
          <Link href={`/carreras/${event.id}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            Ver página pública <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      <h2 className="text-xl font-bold">{isNew ? "Nueva carrera" : event!.name}</h2>
      {creado && <p className="text-sm text-success">Carrera creada. Ahora podés cargar los resultados.</p>}

      <ActionForm action={saveEventAction} className="card p-5">
        {event && <input type="hidden" name="id" value={event.id} />}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Nombre *"><input name="name" required defaultValue={event?.name} placeholder="Ej: Gran Premio Coronación" className="input" /></Field>
          <Field label="Categoría *">
            <select name="categoryId" required defaultValue={event?.categoryId} className="input">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Fecha y hora de la carrera * (hora ARG)">
            <input name="date" type="datetime-local" required defaultValue={event ? toArgInput(event.date) : ""} className="input" />
          </Field>
          <Field label="Autódromo / circuito"><input name="circuit" defaultValue={event?.circuit ?? ""} className="input" /></Field>
          <Field label="Ciudad"><input name="location" defaultValue={event?.location ?? ""} className="input" /></Field>
          <Field label="País"><input name="country" defaultValue={event?.country ?? "Argentina"} className="input" /></Field>
          <Field label="Temporada"><input name="season" type="number" defaultValue={event?.season ?? new Date().getFullYear()} className="input" /></Field>
          <Field label="Fecha N°"><input name="round" type="number" defaultValue={event?.round ?? ""} className="input" /></Field>
          <Field label="Estado">
            <select name="status" defaultValue={event?.status ?? "SCHEDULED"} className="input">
              <option value="SCHEDULED">Programada</option>
              <option value="FINISHED">Finalizada</option>
              <option value="CANCELLED">Cancelada</option>
            </select>
          </Field>
          <Field label="Horarios de sesiones" hint="Una por línea: Nombre | AAAA-MM-DD HH:MM (hora ARG)" className="sm:col-span-2 lg:col-span-3">
            <textarea name="sessions" rows={4} defaultValue={sessionsText} placeholder={"Clasificación | 2026-11-14 15:30\nCarrera | 2026-11-15 13:00"} className="input font-mono text-xs" />
          </Field>
          <Field label="Descripción" className="sm:col-span-2 lg:col-span-3">
            <textarea name="description" rows={2} defaultValue={event?.description ?? ""} className="input" />
          </Field>
        </div>
      </ActionForm>

      {event && (
        <section className="card space-y-3 p-5">
          <h3 className="font-semibold">Resultados</h3>
          <p className="text-sm text-muted-foreground">
            Pegá la clasificación (se puede copiar directo de una planilla). Una fila por piloto, columnas separadas por{" "}
            <code>;</code>, <code>|</code> o tabulación: <b>posición ; piloto ; equipo/marca ; tiempo o diferencia ; puntos</b>.
            Los pilotos que coinciden con los cargados en el sitio se vinculan automáticamente. Guardar reemplaza los resultados anteriores.
          </p>
          <ActionForm action={saveResultsAction} submitLabel="Guardar resultados">
            <input type="hidden" name="eventId" value={event.id} />
            <textarea
              name="results"
              rows={14}
              defaultValue={resultsText}
              placeholder={"1 ; Julián Santero ; Ford ; 45:12.345 ; 43\n2 ; Mariano Werner ; Ford ; +1.234 ; 38"}
              className="input font-mono text-xs"
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="notify" defaultChecked={event.status !== "FINISHED"} /> Enviar notificaciones push a los seguidores
            </label>
          </ActionForm>
        </section>
      )}

      {event && (
        <form action={deleteEventAction} className="flex justify-end">
          <input type="hidden" name="id" value={event.id} />
          <ConfirmButton message={`¿Eliminar "${event.name}" y sus resultados?`}>
            <Trash2 className="h-4 w-4" /> Eliminar carrera
          </ConfirmButton>
        </form>
      )}
    </div>
  );
}
