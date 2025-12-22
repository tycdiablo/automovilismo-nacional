import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Automovilismo Nacional",
  description: "Seguí a los pilotos argentinos por el mundo.",
};

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
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex h-full">
            {/* Desktop Sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
              <Sidebar />
            </div>

            <div className="lg:pl-64 flex flex-col min-h-screen w-full">
              <Navbar />

              <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
