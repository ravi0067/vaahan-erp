import { DashboardShell } from "@/components/layout/DashboardShell";
import { AIChatWidget } from "@/components/chat/AIChatWidget";

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
