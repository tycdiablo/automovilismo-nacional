"use client";

import { Search, Menu } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function Navbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(pathname === "/buscar" ? params.get("q") ?? "" : "");
  }, [pathname, params]);

  // Atajo de teclado: "/" o Ctrl+K enfocan el buscador
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
      if ((e.key === "/" && !typing) || (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <button type="button" className="-m-2 p-2 text-muted-foreground lg:hidden" onClick={onOpenMenu}>
        <span className="sr-only">Abrir menú</span>
        <Menu aria-hidden="true" className="h-6 w-6" />
      </button>

      <form
        role="search"
        className="relative flex flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          const q = query.trim();
          if (q) router.push(`/buscar?q=${encodeURIComponent(q)}`);
        }}
      >
        <div className="relative w-full max-w-xl">
          <label htmlFor="search-field" className="sr-only">
            Buscar pilotos, noticias, carreras
          </label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            id="search-field"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar pilotos, noticias, carreras…"
            className="h-10 w-full rounded-lg border border-transparent bg-muted/70 pl-9 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-border focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:block">
            /
          </kbd>
        </div>
      </form>

      <div className="flex items-center gap-x-2 sm:gap-x-3">
        <NotificationBell />
        <div className="hidden h-6 w-px bg-border sm:block" aria-hidden="true" />
        <ModeToggle />
      </div>
    </header>
  );
}
