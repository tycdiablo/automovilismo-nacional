"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

export function ModeToggle() {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // useEffect only runs on the client, so now we can safely show the UI
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="flex items-center gap-2 border border-border rounded-lg p-1">
                <button className="p-2 rounded-md" disabled>
                    <Sun className="h-4 w-4" />
                </button>
                <button className="p-2 rounded-md" disabled>
                    <Moon className="h-4 w-4" />
                </button>
                <button className="p-2 text-xs font-medium rounded-md" disabled>
                    Auto
                </button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 border border-border rounded-lg p-1">
            <button
                onClick={() => setTheme("light")}
                className={cn(
                    "p-2 rounded-md transition-all hover:bg-accent hover:text-accent-foreground",
                    theme === "light" && "bg-accent text-accent-foreground"
                )}
                title="Claro"
            >
                <Sun className="h-4 w-4" />
                <span className="sr-only">Claro</span>
            </button>
            <button
                onClick={() => setTheme("dark")}
                className={cn(
                    "p-2 rounded-md transition-all hover:bg-accent hover:text-accent-foreground",
                    theme === "dark" && "bg-accent text-accent-foreground"
                )}
                title="Oscuro"
            >
                <Moon className="h-4 w-4" />
                <span className="sr-only">Oscuro</span>
            </button>
            <button
                onClick={() => setTheme("system")}
                className={cn(
                    "p-2 text-xs font-medium rounded-md transition-all hover:bg-accent hover:text-accent-foreground",
                    theme === "system" && "bg-accent text-accent-foreground"
                )}
                title="Sistema"
            >
                Auto
            </button>
        </div>
    )
}
