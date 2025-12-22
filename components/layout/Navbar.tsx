"use client";

import { Bell, Search, Menu } from "lucide-react";

import { ModeToggle } from "@/components/mode-toggle";

interface NavbarProps {
    onOpenMenu: () => void;
}

export function Navbar({ onOpenMenu }: NavbarProps) {
    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-card/80 px-6 shadow-sm backdrop-blur-md">
            <button
                type="button"
                className="-m-2.5 p-2.5 text-muted-foreground lg:hidden"
                onClick={onOpenMenu}
            >
                <span className="sr-only">Abrir menú</span>
                <Menu aria-hidden="true" className="h-6 w-6" />
            </button>

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                <form className="relative flex flex-1" action="#" method="GET">
                    <label htmlFor="search-field" className="sr-only">
                        Buscar pilotos o noticias
                    </label>
                    <Search
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-muted-foreground"
                    />
                    <input
                        id="search-field"
                        name="search"
                        type="search"
                        placeholder="Buscar..."
                        className="block h-full w-full border-0 py-0 pl-8 pr-0 bg-transparent text-foreground placeholder:text-muted-foreground focus:ring-0 sm:text-sm"
                    />
                </form>
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                    <button type="button" className="-m-2.5 p-2.5 text-muted-foreground hover:text-foreground">
                        <span className="sr-only">Notificaciones</span>
                        <Bell aria-hidden="true" className="h-6 w-6" />
                    </button>

                    <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" aria-hidden="true" />

                    <ModeToggle />
                </div>
            </div>
        </header>
    );
}
