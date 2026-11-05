"use client";

import { useEffect, useState } from "react";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export function Countdown({ target }: { target: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = now === null ? null : new Date(target).getTime() - now;
  if (diff !== null && diff <= 0) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1 text-sm font-bold text-red-500">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
        </span>
        En curso
      </span>
    );
  }

  const p = parts(diff ?? 0);
  const units = [
    { v: p.d, l: "días" },
    { v: p.h, l: "hs" },
    { v: p.m, l: "min" },
    { v: p.s, l: "seg" },
  ];
  return (
    <div className="flex gap-2" aria-label="Cuenta regresiva" suppressHydrationWarning>
      {units.map((u) => (
        <div key={u.l} className="min-w-[3.5rem] rounded-lg border border-border bg-background/60 px-2 py-1.5 text-center backdrop-blur">
          <div className="font-display text-2xl font-bold tabular-nums leading-none">
            {diff === null ? "--" : String(u.v).padStart(2, "0")}
          </div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{u.l}</div>
        </div>
      ))}
    </div>
  );
}
