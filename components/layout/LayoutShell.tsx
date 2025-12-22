"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { MobileSidebar } from "./MobileSidebar";

interface LayoutShellProps {
    children: React.ReactNode;
}

import { PushNotificationManager } from "@/components/notifications/PushNotificationManager";

export function LayoutShell({ children }: LayoutShellProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-full">
            <PushNotificationManager />
            {/* Desktop Sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
                <Sidebar />
            </div>

            {/* Mobile Sidebar */}
            <MobileSidebar
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            <div className="lg:pl-64 flex flex-col min-h-screen w-full">
                <Navbar onOpenMenu={() => setIsMobileMenuOpen(true)} />

                <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
