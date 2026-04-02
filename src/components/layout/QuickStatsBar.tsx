"use client";

import { useEffect, useState } from "react";
import { IndianRupee, Truck, Wrench, Bell } from "lucide-react";

interface Stats {
  collection: number;
  pendingDeliveries: number;
  openServiceJobs: number;
  notifications: number;
}

export function QuickStatsBar() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/quick-stats")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStats(d); })
      .catch(() => {});
  }, []);

  const items = [
    { label: "Today's Collection", value: stats ? `₹${(stats.collection).toLocaleString("en-IN")}` : "₹0", icon: IndianRupee, color: "text-green-600" },
    { label: "Pending Deliveries", value: stats?.pendingDeliveries?.toString() || "0", icon: Truck, color: "text-amber-600" },
    { label: "Open Service Jobs", value: stats?.openServiceJobs?.toString() || "0", icon: Wrench, color: "text-blue-600" },
    { label: "Notifications", value: stats?.notifications?.toString() || "0", icon: Bell, color: "text-red-600" },
  ];

  return (
    <div className="hidden md:flex items-center justify-between bg-muted/50 border-b px-6 py-1.5 text-xs">
      {items.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="flex items-center gap-1.5">
            <Icon className={`h-3 w-3 ${s.color}`} />
            <span className="text-muted-foreground">{s.label}:</span>
            <span className={`font-semibold ${s.color}`}>{s.value}</span>
          </div>
        );
      })}
    </div>
  );
}
