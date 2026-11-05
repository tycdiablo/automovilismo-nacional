"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function FollowButton({
  pilotId,
  initialFollowing,
  size = "md",
  className,
}: {
  pilotId: string;
  initialFollowing: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    const next = !following;
    setFollowing(next);
    setLoading(true);
    try {
      const res = await fetch(`/api/pilotos/${pilotId}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ following: next }),
      });
      if (!res.ok) throw new Error();
      startTransition(() => router.refresh());
    } catch {
      setFollowing(!next);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-pressed={following}
      className={cn(
        "relative z-10 inline-flex items-center justify-center gap-2 rounded-lg border font-semibold transition-all disabled:opacity-70",
        size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm",
        following
          ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
          : "border-border bg-card text-foreground hover:border-primary/50 hover:text-primary",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={cn("h-4 w-4", following && "fill-current")} />
      )}
      {following ? "Siguiendo" : "Seguir"}
    </button>
  );
}
