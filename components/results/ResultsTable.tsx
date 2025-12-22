import { Trophy, Clock, Calendar } from "lucide-react";

type Result = {
    id: string;
    eventName: string;
    sessionType: string;
    position: number;
    timeGap: string | null;
    eventDate: Date;
    pilotName: string;
    categoryName: string;
};

interface ResultsTableProps {
    results: Result[];
    title?: string;
}

export function ResultsTable({ results, title }: ResultsTableProps) {
    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            {title && (
                <div className="bg-muted/50 px-4 py-3 border-b border-border">
                    <h3 className="font-semibold text-foreground">{title}</h3>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                        <tr>
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3">Evento</th>
                            <th className="px-4 py-3">Piloto</th>
                            <th className="px-4 py-3 text-center">Pos</th>
                            <th className="px-4 py-3 text-right">Diferencia</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {results.map((res) => (
                            <tr key={res.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground w-1">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {new Date(res.eventDate).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-foreground">{res.eventName}</div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/60"></span>
                                        {res.categoryName} • {res.sessionType}
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-medium">{res.pilotName}</td>
                                <td className="px-4 py-3 text-center">
                                    <div className={`inline-flex items-center justify-center h-7 w-7 rounded-full font-bold text-xs ${res.position === 1 ? 'bg-yellow-400/20 text-yellow-600 border border-yellow-400/50' :
                                            res.position === 2 ? 'bg-slate-300/20 text-slate-600 border border-slate-300/50' :
                                                res.position === 3 ? 'bg-amber-700/20 text-amber-700 border border-amber-700/50' :
                                                    'bg-muted text-muted-foreground'
                                        }`}>
                                        {res.position}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                                    {res.timeGap || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
