import Link from "next/link";
import { cn, formatPoints, positionBadgeClass } from "@/lib/utils";

export type StandingRow = {
  id: string;
  position: number;
  name: string;
  flag: string | null;
  team: string | null;
  points: number;
  wins: number;
  pilot?: { slug: string } | null;
};

export function StandingsTable({ rows, kind = "DRIVER", limit }: { rows: StandingRow[]; kind?: string; limit?: number }) {
  const list = limit ? rows.slice(0, limit) : rows;
  const leader = rows[0]?.points ?? 0;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="w-14 px-4 py-3 font-semibold">Pos</th>
            <th className="px-4 py-3 font-semibold">{kind === "TEAM" ? "Equipo" : "Piloto"}</th>
            <th className="hidden px-4 py-3 text-center font-semibold sm:table-cell">Victorias</th>
            <th className="hidden px-4 py-3 text-right font-semibold sm:table-cell">Dif.</th>
            <th className="w-20 px-4 py-3 text-right font-semibold">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {list.map((r) => (
            <tr key={r.id} className={cn("transition-colors hover:bg-accent/40", r.pilot && "bg-primary/[0.06]")}>
              <td className="px-4 py-3">
                <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold", positionBadgeClass(r.position))}>
                  {r.position}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{r.flag || "🏁"}</span>
                  {r.pilot ? (
                    <Link href={`/pilotos/${r.pilot.slug}`} className="font-semibold text-primary hover:underline">
                      {r.name}
                    </Link>
                  ) : (
                    <span className="font-medium">{r.name}</span>
                  )}
                </div>
                {r.team && <p className="mt-0.5 pl-7 text-xs text-muted-foreground">{r.team}</p>}
              </td>
              <td className="hidden px-4 py-3 text-center text-muted-foreground sm:table-cell">{r.wins || "—"}</td>
              <td className="hidden px-4 py-3 text-right text-xs text-muted-foreground sm:table-cell">
                {r.position === 1 ? "—" : `-${formatPoints(leader - r.points)}`}
              </td>
              <td className="px-4 py-3 text-right font-display text-lg font-bold tabular-nums">{formatPoints(r.points)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
