import { ArrowUpRight } from "lucide-react";

interface NewsCardProps {
    news: {
        id: string;
        title: string;
        summary: string;
        source: string;
        publishedAt: string;
        imageUrl: string;
        category: string;
        relatedPilot?: string;
        originalUrl?: string; // Add this if available in mapping
    };
}

export function NewsCard({ news }: NewsCardProps) {
    const detailUrl = news.originalUrl || `/noticias/${news.id}`;

    return (
        <article className="flex flex-col overflow-hidden rounded-xl bg-card border border-border shadow-sm transition-all hover:shadow-md h-full">
            <div className="aspect-video w-full bg-muted relative overflow-hidden group">
                <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-muted-foreground/30">
                    {news.category.charAt(0)}
                </div>

                {news.imageUrl && news.imageUrl !== "/placeholder.svg" && (
                    <img
                        src={news.imageUrl}
                        alt={news.title}
                        className="absolute inset-0 object-cover w-full h-full transition-transform group-hover:scale-105"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                )}

                <div className="absolute top-2 left-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-md bg-background/90 px-2 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
                        {news.category}
                    </span>
                    {news.relatedPilot && (
                        <span className="inline-flex items-center rounded-md bg-primary/90 px-2 py-1 text-xs font-medium text-primary-foreground shadow-sm backdrop-blur-sm">
                            {news.relatedPilot}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span className="font-medium text-foreground">{news.source}</span>
                    <time>{news.publishedAt}</time>
                </div>

                <h3 className="text-lg font-bold leading-tight text-foreground mb-2 group-hover:text-primary transition-colors">
                    <a href={detailUrl} target="_blank" rel="noopener noreferrer">
                        {news.title}
                    </a>
                </h3>

                <p className="flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {news.summary}
                </p>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-end">
                    <a href={detailUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1">
                        Leer más <ArrowUpRight className="h-4 w-4" />
                    </a>
                </div>
            </div>
        </article>
    );
}
