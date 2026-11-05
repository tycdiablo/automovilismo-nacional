"use client";

import { Suspense, useCallback, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { MobileSidebar } from "./MobileSidebar";

export function LayoutShell({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const close = useCallback(() => setIsMobileMenuOpen(false), []);

  return (
    <div className="flex min-h-full">
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </div>

      <MobileSidebar isOpen={isMobileMenuOpen} onClose={close} />

      <div className="flex min-h-screen w-full min-w-0 flex-col lg:pl-64">
        <Suspense fallback={<div className="h-16 border-b border-border" />}>
          <Navbar onOpenMenu={() => setIsMobileMenuOpen(true)} />
        </Suspense>
        <main id="contenido" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
        {footer}
      </div>
    </div>
  );
}
