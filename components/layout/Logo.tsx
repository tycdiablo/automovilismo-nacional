import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8", className)} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#0E1117" />
      <rect x="0" y="0" width="32" height="10.66" rx="0" fill="#75AADB" />
      <rect x="0" y="21.33" width="32" height="10.67" fill="#75AADB" />
      <rect x="0" y="10.66" width="32" height="10.67" fill="#FFFFFF" />
      <circle cx="16" cy="16" r="3.2" fill="#F4B942" />
      <path d="M5 26 L27 6" stroke="#0E1117" strokeWidth="3.2" strokeLinecap="round" />
      <rect width="32" height="32" rx="8" fill="none" stroke="#0E1117" strokeOpacity="0.15" />
    </svg>
  );
}

export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" onClick={onClick} aria-label="Motor Nacional - Inicio">
      <LogoMark className="rounded-lg" />
      <span className="font-display text-xl font-extrabold uppercase leading-none tracking-tight">
        Motor <span className="text-primary">Nacional</span>
      </span>
    </Link>
  );
}
