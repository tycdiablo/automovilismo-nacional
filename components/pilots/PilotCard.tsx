import Link from "next/link";
import { Globe2 } from "lucide-react";
import { CategoryBadge } from "@/components/ui";
import { initials } from "@/lib/utils";
import { FollowButton } from "./FollowButton";

export type PilotCardData = {
  id: string;
  slug: string;
  fullName: string;
  team: string | null;
  carNumber: number | null;
  profileImageUrl: string | null;
  category: { shortName: string; name: string; slug?: string | null; color?: string | null; isInternational: boolean };
  _count?: { followers: number };
};

export function PilotCard({ pilot, isFollowing }: { pilot: PilotCardData; isFollowing: boolean }) {
  const color = pilot.category.color || "#75AADB";
  return (
    <article className="card group relative flex flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div
        className="relative aspect-[4/3] overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color}33, transparent 70%), var(--muted)` }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-6xl font-extrabold text-foreground/15">{initials(pilot.fullName)}</span>
        </div>
        {pilot.profileImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pilot.profileImageUrl}
            alt={pilot.fullName}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {pilot.carNumber !== null && (
          <span className="font-display absolute bottom-2 right-3 text-4xl font-extrabold italic text-white/90 drop-shadow-[0_2px_6px_rgba(0,0,0,.6)]">
            #{pilot.carNumber}
          </span>
        )}
        {pilot.category.isInternational && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/85 px-2 py-1 text-[11px] font-semibold backdrop-blur">
            <Globe2 className="h-3 w-3 text-primary" /> Internacional
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <CategoryBadge category={pilot.category} />
        <h3 className="mt-2 text-lg font-bold leading-tight">
          <Link href={`/pilotos/${pilot.slug}`} className="hover:text-primary">
            <span className="absolute inset-0" />
            {pilot.fullName}
          </Link>
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{pilot.team || pilot.category.name}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {pilot._count ? `${pilot._count.followers} seguidor${pilot._count.followers === 1 ? "" : "es"}` : ""}
          </span>
          <FollowButton pilotId={pilot.id} initialFollowing={isFollowing} size="sm" />
        </div>
      </div>
    </article>
  );
}
