import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/providers/toaster";
import { CommandPaletteProvider } from "@/components/providers/command-palette-provider";
import { FeatureFlagsProvider } from "@/lib/feature-flags";
import { getEnabledModules } from "@/lib/feature-flags/server";

export const metadata: Metadata = {
  title: "SaaS Factory Template",
  description: "Production-ready SaaS template with modular architecture, feature flags, and Claude Code integration",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Load enabled modules on server
  const enabledModules = await getEnabledModules();
  const initialFlags = enabledModules.reduce((acc, key) => {
    acc[key] = true;
    return acc;
  }, {} as Record<string, boolean>);

  return (
    <html lang="en">
      <body>
        <FeatureFlagsProvider initialFlags={initialFlags}>
          <CommandPaletteProvider>
            {children}
          </CommandPaletteProvider>
        </FeatureFlagsProvider>
        <Toaster />
      </body>
    </html>
  );
}
