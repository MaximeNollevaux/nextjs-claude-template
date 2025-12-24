import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/providers/toaster";
import { CommandPaletteProvider } from "@/components/providers/command-palette-provider";

export const metadata: Metadata = {
  title: "Next.js + Claude Code Template",
  description: "A Next.js template with Claude Code superpowers - Auth, UI Components, Database Autonomy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CommandPaletteProvider>
          {children}
        </CommandPaletteProvider>
        <Toaster />
      </body>
    </html>
  );
}
