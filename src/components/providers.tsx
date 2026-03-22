"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { KeyboardShortcuts } from "@/components/providers/KeyboardShortcuts";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          {children}
          <KeyboardShortcuts />
        </TooltipProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
