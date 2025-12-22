import { UserPlus, UserCheck } from "lucide-react";
import { useState } from "react";

interface PilotCardProps {
    pilot: {
        id: string;
        name: string;
        category: string;
        team: string;
        nationality: string;
        imageUrl: string;
        isInternational: boolean;
    };
}

export function PilotCard({ pilot }: PilotCardProps) {
    const [isFollowing, setIsFollowing] = useState(false);

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-square bg-muted relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-muted-foreground/30">
                    {pilot.name.charAt(0)}
                </div>

                {pilot.imageUrl && pilot.imageUrl !== "/placeholder.svg" && (
                    <img
                        src={pilot.imageUrl}
                        alt={pilot.name}
                        className="absolute inset-0 object-cover w-full h-full transition-transform group-hover:scale-105"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                )}

                {pilot.isInternational && (
                    <span className="absolute top-2 right-2 inline-flex items-center rounded-full bg-primary/90 px-2 py-1 text-xs font-medium text-primary-foreground shadow-sm backdrop-blur-sm z-10">
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
                    <button
                        onClick={() => setIsFollowing(!isFollowing)}
                        className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border h-9 px-4 py-2 w-full gap-2 ${isFollowing
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90 border-transparent'
                                : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                            }`}>
                        {isFollowing ? (
                            <>
                                <UserCheck className="h-4 w-4" />
                                Siguiendo
                            </>
                        ) : (
                            <>
                                <UserPlus className="h-4 w-4" />
                                Seguir
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
