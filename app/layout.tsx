import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LayoutShell } from "@/components/layout/LayoutShell";

export const metadata: Metadata = {
  title: "Automovilismo Nacional",
  description: "Seguí a los pilotos argentinos por el mundo.",
};

import { AuthProvider } from "@/components/providers/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full bg-background antialiased" suppressHydrationWarning>
      <body className="h-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <LayoutShell>
              {children}
            </LayoutShell>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
