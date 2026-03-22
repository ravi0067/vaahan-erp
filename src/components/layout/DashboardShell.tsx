"use client";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { QuickStatsBar } from "./QuickStatsBar";
import { MobileBottomNav } from "./MobileBottomNav";

interface DashboardShellProps {
  children: React.ReactNode;
}

// Main layout wrapper: Sidebar + Topbar + content area
export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <QuickStatsBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">{children}</main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
