import Link from "next/link";
import { MapPin, ChevronRight } from "lucide-react";
import { CategoryBadge } from "@/components/ui";
import { cn, countryEs, formatArg } from "@/lib/utils";

export type EventRowData = {
  id: string;
  name: string;
  date: Date;
  location: string | null;
  country: string | null;
  circuit: string | null;
  round: number | null;
  status: string;
  category: { shortName: string; slug?: string | null; color?: string | null };
  results?: { position: number; pilotName: string | null; pilot?: { fullName: string } | null }[];
};

export function EventRow({ event, highlight }: { event: EventRowData; highlight?: boolean }) {
  const place = [event.location, countryEs(event.country)].filter(Boolean).join(", ");
  const winner = event.results?.find((r) => r.position === 1);
  return (
    <Link
      href={`/carreras/${event.id}`}
      className={cn(
        "group flex items-center gap-4 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/40 hover:shadow-md sm:p-4",
        highlight && "border-primary/50 ring-1 ring-primary/30"
      )}
    >
      <div className="flex w-14 shrink-0 flex-col items-center rounded-lg bg-muted py-2 text-center">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {formatArg(event.date, { month: "short" }).replace(".", "")}
        </span>
        <span className="font-display text-2xl font-bold leading-none">{formatArg(event.date, { day: "numeric" })}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={event.category} />
          {event.round && <span className="text-xs text-muted-foreground">Fecha {event.round}</span>}
          {event.status === "CANCELLED" && (
            <span className="rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-destructive">Cancelada</span>
          )}
        </div>
        <p className="mt-1 truncate font-semibold group-hover:text-primary">{event.name}</p>
        <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
          {place && (
            <>
              <MapPin className="h-3 w-3 shrink-0" /> {place}
            </>
          )}
          {winner && (
            <span className="ml-2 truncate">🏆 {winner.pilotName || winner.pilot?.fullName}</span>
          )}
        </p>
      </div>
      <div className="hidden text-right text-xs text-muted-foreground sm:block">
        {formatArg(event.date, { weekday: "short" })}
        <br />
        {formatArg(event.date, { hour: "2-digit", minute: "2-digit" })} hs
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
    </Link>
  );
}
