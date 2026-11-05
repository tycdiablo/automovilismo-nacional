"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Bell, BellOff, BellRing, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type State = "loading" | "unsupported" | "unconfigured" | "denied" | "off" | "on";

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function saveSubscription(sub: PushSubscription) {
  await fetch("/api/notifications/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sub),
  });
}

export function NotificationBell() {
  const { data: session } = useSession();
  const [state, setState] = useState<State>("loading");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      return setState("unsupported");
    }
    if (!VAPID) return setState("unconfigured");
    if (Notification.permission === "denied") return setState("denied");
    const reg = await navigator.serviceWorker.register("/sw.js");
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      // Re-vincula la suscripción con el usuario logueado
      await saveSubscription(sub).catch(() => {});
      setState("on");
    } else {
      setState("off");
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => setState("unsupported"));
  }, [refresh, session?.user?.email]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const enable = async () => {
    if (!VAPID) return;
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return setState(permission === "denied" ? "denied" : "off");
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID),
      });
      await saveSubscription(sub);
      setState("on");
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/notifications/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("off");
    } finally {
      setBusy(false);
    }
  };

  const Icon = state === "on" ? BellRing : state === "denied" || state === "unsupported" ? BellOff : Bell;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "relative rounded-lg p-2 transition-colors hover:bg-accent",
          state === "on" ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Notificaciones"
        aria-expanded={open}
      >
        <Icon className="h-5 w-5" />
        {state === "on" && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-border bg-popover p-4 shadow-xl">
          <p className="font-semibold">Notificaciones</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Recibí un aviso cuando tus pilotos terminan una carrera o aparecen en las noticias.
          </p>

          <div className="mt-4">
            {state === "loading" && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            {state === "unsupported" && (
              <p className="text-sm text-muted-foreground">Tu navegador no soporta notificaciones push.</p>
            )}
            {state === "unconfigured" && (
              <p className="text-sm text-muted-foreground">Las notificaciones todavía no están habilitadas en este sitio.</p>
            )}
            {state === "denied" && (
              <p className="text-sm text-muted-foreground">
                Bloqueaste las notificaciones. Podés habilitarlas desde la configuración del sitio en tu navegador.
              </p>
            )}
            {state === "off" && (
              <button onClick={enable} disabled={busy} className="btn-primary w-full">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />}
                Activar notificaciones
              </button>
            )}
            {state === "on" && (
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm font-medium text-success">
                  <span className="h-2 w-2 rounded-full bg-success" /> Activadas en este dispositivo
                </p>
                <button onClick={disable} disabled={busy} className="btn-outline w-full">
                  Desactivar
                </button>
              </div>
            )}
          </div>

          {!session?.user && state !== "unsupported" && (
            <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
              <Link href="/login" className="font-medium text-primary hover:underline" onClick={() => setOpen(false)}>
                Iniciá sesión
              </Link>{" "}
              y seguí pilotos para elegir de quién recibir avisos.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
