"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { AIChatWidget } from "@/components/chat/AIChatWidget";

// ❌ REMOVED: Auto-welcome voice (WelcomeVoice component)
// Voice ONLY activates when user says "Hey Vaani" or touches voice button

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell>
      {children}
      <AIChatWidget />
    </DashboardShell>
  );
}
