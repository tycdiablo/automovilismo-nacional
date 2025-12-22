import { Search } from "lucide-react";
import { PilotCard } from "@/components/pilots/PilotCard";
import { prisma } from "@/lib/prisma";

export default async function PilotsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { search } = await searchParams;
    const query = typeof search === 'string' ? search : '';

    const pilots = await prisma.pilot.findMany({
        where: {
            OR: [
                { fullName: { contains: query } },  // SQLite case-insensitive by default roughly, but let's see
                { category: { name: { contains: query } } }
            ]
        },
        include: {
            category: true
        }
    });

    // Map Prisma result to the component's expected shape if slightly different
    const mappedPilots = pilots.map(p => ({
        id: p.id,
        name: p.fullName,
        category: p.category.shortName,
        team: p.category.name, // Use category name as "team" for now or just the category
        nationality: p.nationality,
        imageUrl: p.profileImageUrl || "/placeholder.svg",
        isInternational: p.category.isInternational
    }));

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Pilotos</h1>
                    <p className="text-muted-foreground mt-1">
                        Seguí a tus pilotos favoritos y recibí notificaciones de sus carreras.
                    </p>
                </div>
            </div>

            {/* Search Bar (Client Side Navigation needed or plain Form) */}
            <div className="relative max-w-md">
                <form method="GET">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        name="search"
                        type="text"
                        defaultValue={query}
                        placeholder="Buscar piloto o categoría..."
                        className="w-full rounded-lg border border-border bg-background px-9 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </form>
            </div>

            {/* Grid */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {mappedPilots.map((pilot) => (
                    <PilotCard key={pilot.id} pilot={pilot} />
                ))}

                {mappedPilots.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        No se encontraron pilotos que coincidan con tu búsqueda.
                    </div>
                )}
            </div>
        </div>
    );
}
