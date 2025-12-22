import { Newspaper } from "lucide-react";
import { NewsCard } from "@/components/news/NewsCard";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function NewsPage() {
    const news = await prisma.news.findMany({
        orderBy: { publishedAt: 'desc' },
        include: {
            category: true,
            pilot: true
        }
    });

    const formattedNews = news.map(n => ({
        id: n.id,
        title: n.title,
        summary: n.summary || "",
        source: n.sourceName,
        publishedAt: new Date(n.publishedAt).toLocaleDateString(),
        imageUrl: n.imageUrl || "/placeholder.svg",
        category: n.category?.shortName || "General",
        relatedPilot: n.pilot?.fullName
    }));

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Newspaper className="h-8 w-8 text-primary" />
                        Noticias
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Mantenete informado con las últimas novedades del automovilismo argentino.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {formattedNews.map((newsItem) => (
                    <NewsCard key={newsItem.id} news={newsItem} />
                ))}

                {formattedNews.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                        <p>No hay noticias cargadas en este momento.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
