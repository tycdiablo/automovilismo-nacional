import { CheckCircle2, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/ui";
import { ActionForm } from "@/components/admin/ActionForm";
import { runSyncAction } from "./actions";
import { formatArg } from "@/lib/utils";

export default async function AdminHome() {
  const [pilots, events, results, news, users, follows, subs, logs] = await Promise.all([
    prisma.pilot.count(),
    prisma.raceEvent.count(),
    prisma.result.count(),
    prisma.news.count(),
    prisma.user.count(),
    prisma.follow.count(),
    prisma.pushSubscription.count(),
    prisma.syncLog.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
  ]);

  const checks = [
    { label: "NEXTAUTH_SECRET", ok: Boolean(process.env.NEXTAUTH_SECRET) },
    { label: "CRON_SECRET (sincronización automática)", ok: Boolean(process.env.CRON_SECRET || process.env.WEBHOOK_SECRET) },
    { label: "Claves VAPID (notificaciones push)", ok: Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) },
    { label: "NEXT_PUBLIC_SITE_URL (SEO / enlaces)", ok: Boolean(process.env.NEXT_PUBLIC_SITE_URL) },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <StatCard label="Pilotos" value={pilots} />
        <StatCard label="Carreras" value={events} />
        <StatCard label="Resultados" value={results} />
        <StatCard label="Noticias" value={news} />
        <StatCard label="Usuarios" value={users} />
        <StatCard label="Follows" value={follows} />
        <StatCard label="Disp. push" value={subs} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card space-y-4 p-5">
          <h2 className="font-semibold">Sincronizar ahora</h2>
          <p className="text-sm text-muted-foreground">
            Se ejecutan solas cada pocas horas (GitHub Actions / Vercel Cron). Desde acá podés forzarlas.
          </p>
          <ActionForm action={runSyncAction} submitLabel="Sincronizar noticias">
            <input type="hidden" name="which" value="news" />
          </ActionForm>
          <ActionForm action={runSyncAction} submitLabel="Sincronizar Fórmula 1">
            <input type="hidden" name="which" value="f1" />
          </ActionForm>
        </section>

        <section className="card p-5">
          <h2 className="mb-3 font-semibold">Configuración</h2>
          <ul className="space-y-2 text-sm">
            {checks.map((c) => (
              <li key={c.label} className="flex items-center gap-2">
                {c.ok ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}
                {c.label}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card overflow-hidden">
        <h2 className="border-b border-border px-5 py-3 font-semibold">Últimas sincronizaciones</h2>
        {logs.length ? (
          <ul className="divide-y divide-border text-sm">
            {logs.map((l) => (
              <li key={l.id} className="flex gap-3 px-5 py-2.5">
                {l.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />}
                <span className="w-28 shrink-0 text-muted-foreground">{formatArg(l.createdAt, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                <span className="w-12 shrink-0 font-semibold uppercase">{l.source}</span>
                <span className="min-w-0 truncate font-mono text-xs text-muted-foreground" title={l.message ?? ""}>{l.message}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-5 text-sm text-muted-foreground">Todavía no hubo sincronizaciones.</p>
        )}
      </section>
    </div>
  );
}
