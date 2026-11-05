import Link from "next/link";
import { cn, formatPoints, positionBadgeClass } from "@/lib/utils";

export type ResultRow = {
  id: string;
  position: number;
  pilotName: string | null;
  pilotFlag: string | null;
  timeGap: string | null;
  points: number | null;
  grid: number | null;
  team: string | null;
  pilot?: { fullName: string; slug: string; nationality: string } | null;
};

export function ResultsTable({ results, showGrid = false }: { results: ResultRow[]; showGrid?: boolean }) {
  const hasTeam = results.some((r) => r.team);
  const hasPoints = results.some((r) => r.points !== null);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="w-14 px-4 py-3 font-semibold">Pos</th>
            <th className="px-4 py-3 font-semibold">Piloto</th>
            {hasTeam && <th className="hidden px-4 py-3 font-semibold md:table-cell">Equipo</th>}
            {showGrid && <th className="hidden px-4 py-3 text-center font-semibold sm:table-cell">Largó</th>}
            <th className="px-4 py-3 text-right font-semibold">Tiempo / Dif.</th>
            {hasPoints && <th className="w-16 px-4 py-3 text-right font-semibold">Pts</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {results.map((r) => {
            const tracked = Boolean(r.pilot);
            const name = r.pilot?.fullName || r.pilotName || "—";
            const gained = showGrid && r.grid ? r.grid - r.position : 0;
            return (
              <tr key={r.id} className={cn("transition-colors hover:bg-accent/40", tracked && "bg-primary/[0.06]")}>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold", positionBadgeClass(r.position))}>
                    {r.position}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{r.pilotFlag || "🏁"}</span>
                    {r.pilot ? (
                      <Link href={`/pilotos/${r.pilot.slug}`} className="font-semibold text-primary hover:underline">
                        {name}
                      </Link>
                    ) : (
                      <span className="font-medium">{name}</span>
                    )}
                  </div>
                  {hasTeam && r.team && <p className="mt-0.5 text-xs text-muted-foreground md:hidden">{r.team}</p>}
                </td>
                {hasTeam && <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{r.team || "—"}</td>}
                {showGrid && (
                  <td className="hidden px-4 py-3 text-center text-muted-foreground sm:table-cell">
                    {r.grid ?? "—"}
                    {gained !== 0 && (
                      <span className={cn("ml-1 text-xs font-semibold", gained > 0 ? "text-success" : "text-destructive")}>
                        {gained > 0 ? `▲${gained}` : `▼${-gained}`}
                      </span>
                    )}
                  </td>
                )}
                <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">{r.timeGap || "—"}</td>
                {hasPoints && <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatPoints(r.points)}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
