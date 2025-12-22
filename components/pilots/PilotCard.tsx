import { UserPlus } from "lucide-react";
import { Pilot } from "@/lib/data/pilots";

interface PilotCardProps {
    pilot: Pilot;
}

export function PilotCard({ pilot }: PilotCardProps) {
    return (
        <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-square bg-muted relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-muted-foreground/30">
                    {pilot.name.charAt(0)}
                </div>
                {/* Placeholder for real image */}
                {/* <Image src={pilot.imageUrl} alt={pilot.name} fill className="object-cover" /> */}

                {pilot.isInternational && (
                    <span className="absolute top-2 right-2 inline-flex items-center rounded-full bg-primary/90 px-2 py-1 text-xs font-medium text-primary-foreground shadow-sm backdrop-blur-sm">
                        Internacional
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col p-4">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {pilot.name}
                </h3>
                <p className="text-sm text-muted-foreground">{pilot.category}</p>
                <p className="text-xs text-muted-foreground mt-1">{pilot.team}</p>

                <div className="mt-4 flex items-center justify-between">
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full gap-2">
                        <UserPlus className="h-4 w-4" />
                        Seguir
                    </button>
                </div>
            </div>
        </div>
    );
}
