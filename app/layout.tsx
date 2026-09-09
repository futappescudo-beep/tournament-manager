import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Escudo Amistad",
  description: "Sistema de Gestión de Torneos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Toaster />
        {children}
      </body>
    </html>
  );
}
