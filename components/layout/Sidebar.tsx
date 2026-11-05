"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogOut, LogIn, UserPlus } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { navigation, userNavigation, adminNavigation, isActivePath } from "./nav";
import { Logo } from "./Logo";

type NavItem = (typeof navigation)[number];

function NavLink({ item, pathname, onNavigate }: { item: NavItem; pathname: string; onNavigate?: () => void }) {
  const active = isActivePath(pathname, item.href);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary" />}
      <item.icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-primary" : "group-hover:text-foreground")} />
      {item.name}
    </Link>
  );
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user as { name?: string | null; email?: string | null; isAdmin?: boolean } | undefined;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Logo onClick={onNavigate} />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4" aria-label="Principal">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
          ))}
        </div>

        {user && (
          <div className="space-y-1">
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Tu cuenta</p>
            {userNavigation.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
            ))}
            {user.isAdmin &&
              adminNavigation.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
              ))}
          </div>
        )}
      </nav>

      <div className="border-t border-border p-4">
        {status === "loading" ? (
          <div className="h-[76px] animate-pulse rounded-lg bg-muted" />
        ) : user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                {initials(user.name || user.email || "U")}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.name || "Usuario"}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="btn-ghost w-full justify-start px-3 py-2 text-xs hover:text-destructive"
            >
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Creá tu cuenta para seguir pilotos y recibir alertas.</p>
            <Link href="/login" onClick={onNavigate} className="btn-primary w-full">
              <LogIn className="h-4 w-4" /> Ingresar
            </Link>
            <Link href="/registro" onClick={onNavigate} className="btn-ghost w-full">
              <UserPlus className="h-4 w-4" /> Crear cuenta
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-card">
      <SidebarContent />
    </aside>
  );
}
