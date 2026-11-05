"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, Loader2, Lock, Mail, User } from "lucide-react";
import { LogoMark } from "@/components/layout/Logo";

function safeCallback(url: string | null) {
  return url && url.startsWith("/") && !url.startsWith("//") ? url : "/";
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = safeCallback(params.get("callbackUrl"));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!isLogin) {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "No pudimos crear tu cuenta.");
          return;
        }
      }
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        setError("Email o contraseña incorrectos.");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Ocurrió un error inesperado. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const otherHref = `${isLogin ? "/registro" : "/login"}${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`;

  return (
    <div className="flex min-h-[75vh] items-center justify-center py-6">
      <div className="card w-full max-w-md overflow-hidden shadow-xl">
        <div className="checkered h-2 w-full text-foreground/10" aria-hidden="true" />
        <div className="p-8">
          <LogoMark className="mx-auto mb-5 h-12 w-12 rounded-xl" />
          <div className="mb-7 text-center">
            <h1 className="font-display text-3xl font-bold">{isLogin ? "Bienvenido de nuevo" : "Creá tu cuenta"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isLogin ? "Ingresá para seguir a tus pilotos." : "Seguí a tus pilotos favoritos y recibí alertas. Es gratis."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
            {error && (
              <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-center text-sm text-destructive">
                {error}
              </div>
            )}

            {!isLogin && (
              <div>
                <label htmlFor="name" className="label">Nombre</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input id="name" autoComplete="name" className="input pl-9" placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input id="email" type="email" required autoComplete="email" className="input pl-9" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  required
                  minLength={isLogin ? undefined : 8}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className="input pl-9"
                  placeholder={isLogin ? "••••••••" : "Mínimo 8 caracteres"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary h-11 w-full">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>{isLogin ? "Ingresar" : "Crear cuenta"} <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-muted-foreground">
            {isLogin ? "¿No tenés cuenta? " : "¿Ya tenés cuenta? "}
            <Link href={otherHref} className="font-semibold text-primary hover:underline">
              {isLogin ? "Registrate gratis" : "Ingresá"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
