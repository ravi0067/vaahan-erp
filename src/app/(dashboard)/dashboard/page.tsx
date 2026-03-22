"use client";

import { useSession } from "next-auth/react";
import { SuperOwnerDashboard } from "./components/SuperOwnerDashboard";
import { DealerDashboard } from "./components/DealerDashboard";

export default function DashboardPage() {
  const { data: session } = useSession();

  const role = (session?.user as Record<string, unknown>)?.role as string | undefined;

  if (role === "SUPER_ADMIN") {
    return <SuperOwnerDashboard />;
  }

  return <DealerDashboard />;
}
