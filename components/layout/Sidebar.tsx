"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Newspaper, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export const navigation = [
    { name: "Inicio", href: "/", icon: Home },
    { name: "Pilotos", href: "/pilotos", icon: Users },
    { name: "Noticias", href: "/noticias", icon: Newspaper },
    { name: "Resultados", href: "/resultados", icon: Trophy },
];

import { useSession, signOut } from "next-auth/react";
import { LogOut, User as UserIcon, LogIn } from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <div className="flex h-full w-64 flex-col bg-card border-r border-border">
            <div className="flex h-16 items-center px-6 border-b border-border">
                <Link href="/" className="flex items-center">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        AN
                    </h1>
                    <span className="ml-2 text-sm font-semibold text-foreground">
                        Motor Nacional
                    </span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                    )}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t border-border p-4">
                {session ? (
                    <div className="space-y-3">
                        <div className="flex items-center">
                            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                {session.user?.name?.[0].toUpperCase() || "U"}
                            </div>
                            <div className="ml-3 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{session.user?.name}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{session.user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => signOut()}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
                        >
                            <LogOut className="h-4 w-4" />
                            Cerrar sesión
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Link
                            href="/login"
                            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-primary/10"
                        >
                            <LogIn className="h-4 w-4" />
                            Ingresar
                        </Link>
                        <Link
                            href="/registro"
                            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
                        >
                            Crear cuenta
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
