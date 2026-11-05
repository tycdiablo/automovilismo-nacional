import type { Metadata } from "next";
import Link from "next/link";
import { Shield } from "lucide-react";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Administración", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const tabs = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/carreras", label: "Carreras y resultados" },
  { href: "/admin/campeonatos", label: "Campeonatos" },
  { href: "/admin/pilotos", label: "Pilotos" },
  { href: "/admin/noticias", label: "Noticias" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
          <Shield className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-bold">Administración</h1>
          <p className="text-sm text-muted-foreground">Cargá calendario, resultados, campeonatos, pilotos y noticias.</p>
        </div>
      </div>
      <nav className="-mx-4 flex gap-1 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:px-0">
        {tabs.map((t) => (
          <Link key={t.href} href={t.href} className="shrink-0 border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:border-border hover:text-foreground">
            {t.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
