"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Newspaper, Trophy, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Inicio", href: "/", icon: Home },
    { name: "Pilotos", href: "/pilotos", icon: Users },
    { name: "Noticias", href: "/noticias", icon: Newspaper },
    { name: "Resultados", href: "/resultados", icon: Trophy },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col bg-card border-r border-border">
            <div className="flex h-16 items-center px-6 border-b border-border">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    AN
                </h1>
                <span className="ml-2 text-sm font-semibold text-foreground">
                    Automovilismo Nacional
                </span>
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
                <div className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        U
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-foreground">Usuario</p>
                        <p className="text-xs text-muted-foreground">Ver perfil</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
