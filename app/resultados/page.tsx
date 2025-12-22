import { prisma } from "@/lib/prisma";
import { Trophy, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = 'force-dynamic';

export default async function ResultsPage() {
    const raceEvents = await prisma.raceEvent.findMany({
        orderBy: {
            date: 'desc'
        },
        include: {
            category: true,
            results: {
                orderBy: {
                    position: 'asc'
                },
                include: {
                    pilot: true
                }
            }
        }
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Trophy className="h-8 w-8 text-yellow-500" />
                        Resultados Completos
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Clasificaciones finales de los Grandes Premios y competencias nacionales.
                    </p>
                </div>
            </div>

            <div className="space-y-12">
                {raceEvents.length > 0 ? (
                    raceEvents.map((event) => (
                        <section key={event.id} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                            {/* Event Header */}
                            <div className="bg-muted/30 p-6 border-b border-border">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                                                {event.category.shortName}
                                            </span>
                                            <h2 className="text-xl font-bold text-foreground">
                                                {event.name}
                                            </h2>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {format(new Date(event.date), "PPP", { locale: es })}
                                            </span>
                                            {event.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    {event.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Results Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                                        <tr>
                                            <th className="px-6 py-3 w-16">Pos</th>
                                            <th className="px-6 py-3">Piloto</th>
                                            <th className="px-6 py-3">Tiempo/Dif</th>
                                            <th className="px-6 py-3 text-right">Puntos</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {event.results.map((result) => (
                                            <tr key={result.id} className="hover:bg-accent/5 transition-colors">
                                                <td className="px-6 py-4 font-bold text-foreground">
                                                    {result.position}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg" title="Nacionalidad">
                                                            {result.pilotFlag || (result.pilot?.nationality === 'Argentina' ? '🇦🇷' : '🏁')}
                                                        </span>
                                                        <span className={result.pilotId ? "font-semibold text-primary" : "text-foreground"}>
                                                            {result.pilotName || result.pilot?.fullName}
                                                        </span>
                                                        {result.pilotId && (
                                                            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/20 text-[10px] text-primary font-bold uppercase">
                                                                Seguido
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {result.timeGap || "-"}
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-foreground">
                                                    {result.points || "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    ))
                ) : (
                    <div className="text-center py-20 text-muted-foreground bg-muted/10 rounded-2xl border border-dashed border-border">
                        <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">No hay Gran Premios registrados todavía.</p>
                        <p className="text-sm">Usa la API de seed para cargar datos de ejemplo.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
