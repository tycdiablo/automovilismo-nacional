import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/queries";
import { ActionForm, ConfirmButton, Field } from "@/components/admin/ActionForm";
import { deletePilotAction, savePilotAction } from "../../actions";
import { parseSocials } from "@/lib/utils";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ creado?: string }> };

export default async function EditPilot({ params, searchParams }: Props) {
  const { id } = await params;
  const { creado } = await searchParams;
  const isNew = id === "nuevo";
  const [pilot, categories] = await Promise.all([isNew ? null : prisma.pilot.findUnique({ where: { id } }), getCategories()]);
  if (!isNew && !pilot) notFound();
  const socials = parseSocials(pilot?.socialMediaHandles);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Link href="/admin/pilotos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Pilotos
        </Link>
        {pilot && (
          <Link href={`/pilotos/${pilot.slug}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            Ver perfil público <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      <h2 className="text-xl font-bold">{isNew ? "Nuevo piloto" : pilot!.fullName}</h2>
      {creado && <p className="text-sm text-success">Piloto creado correctamente.</p>}

      <ActionForm action={savePilotAction} className="card p-5">
        {pilot && <input type="hidden" name="id" value={pilot.id} />}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Nombre completo *"><input name="fullName" required defaultValue={pilot?.fullName} className="input" /></Field>
          <Field label="Categoría *">
            <select name="categoryId" required defaultValue={pilot?.categoryId} className="input">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Equipo"><input name="team" defaultValue={pilot?.team ?? ""} className="input" /></Field>
          <Field label="Número"><input name="carNumber" type="number" defaultValue={pilot?.carNumber ?? ""} className="input" /></Field>
          <Field label="Nacionalidad"><input name="nationality" defaultValue={pilot?.nationality ?? "Argentina"} className="input" /></Field>
          <Field label="Lugar de nacimiento"><input name="birthPlace" defaultValue={pilot?.birthPlace ?? ""} className="input" /></Field>
          <Field label="Fecha de nacimiento"><input name="dateOfBirth" type="date" defaultValue={pilot?.dateOfBirth?.toISOString().slice(0, 10) ?? ""} className="input" /></Field>
          <Field label="Slug (URL)" hint="Se genera del nombre si lo dejás vacío"><input name="slug" defaultValue={pilot?.slug ?? ""} className="input" /></Field>
          <Field label="URL de foto"><input name="profileImageUrl" type="url" defaultValue={pilot?.profileImageUrl ?? ""} className="input" /></Field>
          <Field label="Instagram"><input name="instagram" defaultValue={socials.instagram ?? ""} placeholder="usuario" className="input" /></Field>
          <Field label="X / Twitter"><input name="x" defaultValue={socials.x ?? ""} placeholder="usuario" className="input" /></Field>
          <Field label="ID externo" hint="driverId de Jolpica para F1 (ej: colapinto)"><input name="externalId" defaultValue={pilot?.externalId ?? ""} className="input" /></Field>
          <Field label="Alias para detectar noticias" hint="Separados por coma. Ej: Pechito López, Pechito" className="sm:col-span-2 lg:col-span-3">
            <input name="aliases" defaultValue={pilot?.aliases ?? ""} className="input" />
          </Field>
          <Field label="Biografía" className="sm:col-span-2 lg:col-span-3">
            <textarea name="bio" rows={4} defaultValue={pilot?.bio ?? ""} className="input" />
          </Field>
        </div>
        <div className="flex flex-wrap gap-6 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={pilot?.featured ?? false} /> Destacado en el inicio</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="isActive" defaultChecked={pilot?.isActive ?? true} /> Activo</label>
        </div>
      </ActionForm>

      {pilot && (
        <form action={deletePilotAction} className="flex justify-end">
          <input type="hidden" name="id" value={pilot.id} />
          <ConfirmButton message={`¿Eliminar a ${pilot.fullName}? Se borran también sus seguidores.`}>
            <Trash2 className="h-4 w-4" /> Eliminar piloto
          </ConfirmButton>
        </form>
      )}
    </div>
  );
}
