import type { Metadata } from "next";
import "./globals.css";
import { LayoutShell } from "@/components/layout-shell";
import { AppStateProvider } from "@/components/app-state";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "CITT StockFlow - Duoc UC",
  description: "Gestión y Trazabilidad de Inventario CITT",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className="h-full antialiased dark"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AppStateProvider>
            <LayoutShell>{children}</LayoutShell>
          </AppStateProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
