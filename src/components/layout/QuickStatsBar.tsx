"use client";

import { IndianRupee, Truck, Wrench, Bell } from "lucide-react";

const stats = [
  { label: "Today's Collection", value: "₹1,85,000", icon: IndianRupee, color: "text-green-600" },
  { label: "Pending Deliveries", value: "3", icon: Truck, color: "text-amber-600" },
  { label: "Open Service Jobs", value: "5", icon: Wrench, color: "text-blue-600" },
  { label: "Unread Notifications", value: "6", icon: Bell, color: "text-red-600" },
];

export function QuickStatsBar() {
  return (
    <div className="hidden md:flex items-center justify-between bg-muted/50 border-b px-6 py-1.5 text-xs">
      {stats.map((s) => {
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
