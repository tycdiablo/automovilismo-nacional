import Link from "next/link";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { cn, categorySlug, initials } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  eyebrow,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="mb-2">{eyebrow}</div>}
        <h1 className="font-display flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {Icon && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
          )}
          <span className="min-w-0">{title}</span>
        </h1>
        {description && <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionHeader({
  title,
  href,
  linkLabel = "Ver todo",
  icon: Icon,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="font-display flex items-center gap-2 text-xl font-bold tracking-tight">
        {Icon && <Icon className="h-5 w-5 text-primary" />}
        {title}
      </h2>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          {linkLabel} <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

type CategoryLike = { shortName: string; name?: string; slug?: string | null; color?: string | null };

export function CategoryBadge({
  category,
  link = false,
  className,
}: {
  category: CategoryLike;
  link?: boolean;
  className?: string;
}) {
  const color = category.color || "#75AADB";
  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider",
        className
      )}
      style={{ backgroundColor: `${color}1f`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {category.shortName}
    </span>
  );
  if (!link) return content;
  return (
    <Link href={`/categorias/${categorySlug(category)}`} className="hover:opacity-80">
      {content}
    </Link>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
      {Icon && <Icon className="mb-3 h-10 w-10 text-muted-foreground/40" />}
      <p className="font-semibold text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function PilotAvatar({
  name,
  imageUrl,
  size = 40,
  className,
}: {
  name: string;
  imageUrl?: string | null;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary/25 to-secondary/20 font-bold text-foreground/70",
        className
      )}
      style={{ width: size, height: size, fontSize: Math.max(10, size / 3) }}
    >
      {initials(name)}
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-top"
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}

export function FilterChips({
  items,
  active,
  basePath,
  param = "categoria",
  extraParams = {},
  allLabel = "Todas",
}: {
  items: { value: string; label: string; color?: string | null }[];
  active?: string;
  basePath: string;
  param?: string;
  extraParams?: Record<string, string | undefined>;
  allLabel?: string;
}) {
  const href = (value?: string) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(extraParams)) if (v) params.set(k, v);
    if (value) params.set(param, value);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const chip = (isActive: boolean) =>
    cn(
      "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
      isActive
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
    );

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist">
      <Link href={href()} className={chip(!active)} scroll={false}>
        {allLabel}
      </Link>
      {items.map((item) => (
        <Link key={item.value} href={href(item.value)} className={chip(active === item.value)} scroll={false}>
          {item.color && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />}
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  basePath,
  params = {},
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;
  const href = (p: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
    if (p > 1) qs.set("pagina", String(p));
    const s = qs.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  return (
    <nav className="flex items-center justify-center gap-2 pt-4" aria-label="Paginación">
      {page > 1 ? (
        <Link href={href(page - 1)} className="btn-outline">
          <ChevronLeft className="h-4 w-4" /> Anterior
        </Link>
      ) : (
        <span className="btn-outline pointer-events-none opacity-40">
          <ChevronLeft className="h-4 w-4" /> Anterior
        </span>
      )}
      <span className="px-3 text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={href(page + 1)} className="btn-outline">
          Siguiente <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="btn-outline pointer-events-none opacity-40">
          Siguiente <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-display mt-1 text-2xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
