import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { CategoryBadge } from "@/components/ui";
import { cn } from "@/lib/utils";

export type NewsCardData = {
  id: string;
  title: string;
  summary: string | null;
  sourceName: string;
  publishedAt: Date;
  imageUrl: string | null;
  originalUrl: string;
  category?: { shortName: string; slug?: string | null; color?: string | null } | null;
  pilot?: { fullName: string; slug: string } | null;
};

function NewsImage({ news, className }: { news: NewsCardData; className?: string }) {
  const hasImage = news.imageUrl && news.imageUrl !== "/placeholder.svg";
  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/15 via-transparent to-secondary/10">
        <span className="font-display text-5xl font-extrabold uppercase text-foreground/10">
          {news.category?.shortName ?? "MN"}
        </span>
      </div>
      {hasImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={news.imageUrl!}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}
    </div>
  );
}

export function NewsCard({ news, variant = "default" }: { news: NewsCardData; variant?: "default" | "compact" | "featured" }) {
  const ago = formatDistanceToNow(new Date(news.publishedAt), { addSuffix: true, locale: es });

  if (variant === "compact") {
    return (
      <article className="group relative flex gap-3 rounded-lg p-2 transition-colors hover:bg-accent/60">
        <NewsImage news={news} className="h-16 w-24 shrink-0 rounded-md" />
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">
            <a href={news.originalUrl} target="_blank" rel="noopener noreferrer">
              <span className="absolute inset-0" />
              {news.title}
            </a>
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {news.sourceName} · {ago}
          </p>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "card group relative flex h-full flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg",
        variant === "featured" && "md:col-span-2 md:flex-row"
      )}
    >
      <NewsImage news={news} className={cn("aspect-video w-full", variant === "featured" && "md:aspect-auto md:w-3/5")} />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {news.category && <CategoryBadge category={news.category} />}
          {news.pilot && (
            <Link
              href={`/pilotos/${news.pilot.slug}`}
              className="relative z-10 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary hover:bg-primary/20"
            >
              {news.pilot.fullName}
            </Link>
          )}
        </div>
        <h3
          className={cn(
            "font-semibold leading-snug text-foreground transition-colors group-hover:text-primary",
            variant === "featured" ? "text-xl md:text-2xl" : "text-base"
          )}
        >
          <a href={news.originalUrl} target="_blank" rel="noopener noreferrer">
            <span className="absolute inset-0" />
            {news.title}
          </a>
        </h3>
        {news.summary && (
          <p className={cn("mt-2 flex-1 text-sm leading-relaxed text-muted-foreground", variant === "featured" ? "line-clamp-4" : "line-clamp-3")}>
            {news.summary}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">{news.sourceName}</span> · <time dateTime={new Date(news.publishedAt).toISOString()}>{ago}</time>
          </span>
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>
      </div>
    </article>
  );
}
