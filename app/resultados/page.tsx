import { prisma } from "@/lib/prisma";
import { ResultsTable } from "@/components/results/ResultsTable";
import { Trophy } from "lucide-react";

export const dynamic = 'force-dynamic'; // Ensure we get fresh data if DB updates

export default async function ResultsPage() {
    // Fetch latest 50 results
    const results = await prisma.result.findMany({
        orderBy: {
            eventDate: 'desc'
        },
        take: 50,
        include: {
            pilot: true,
            category: true
        }
    });

    // Map to component format
    const formattedResults = results.map(r => ({
        id: r.id,
        eventName: r.eventName,
        sessionType: r.sessionType,
        position: r.position,
        timeGap: r.timeGap,
        eventDate: r.eventDate,
        pilotName: r.pilot.fullName,
        categoryName: r.category.shortName
    }));

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Trophy className="h-8 w-8 text-yellow-500" />
                        Resultados
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Últimas actuaciones de los pilotos argentinos en el mundo.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {results.length > 0 ? (
                    <ResultsTable results={formattedResults} title="Actividad Reciente" />
                ) : (
                    <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                        <p>No hay resultados cargados todavía.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
