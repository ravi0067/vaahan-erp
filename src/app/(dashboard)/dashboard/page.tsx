"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IndianRupee,
  TrendingUp,
  ClipboardList,
  Flame,
  Truck,
  Wallet,
} from "lucide-react";

// Placeholder stats for the dashboard
const stats = [
  {
    title: "Total Revenue",
    value: "₹24,56,000",
    change: "+12.5% from last month",
    icon: IndianRupee,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    title: "Today's Sales",
    value: "₹3,45,000",
    change: "4 vehicles sold today",
    icon: TrendingUp,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Active Bookings",
    value: "23",
    change: "5 pending delivery",
    icon: ClipboardList,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    title: "Hot Leads",
    value: "18",
    change: "7 follow-ups today",
    icon: Flame,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    title: "Pending Deliveries",
    value: "8",
    change: "3 ready for delivery",
    icon: Truck,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  {
    title: "Cash in Hand",
    value: "₹5,67,890",
    change: "Daybook balanced",
    icon: Wallet,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s your dealership overview.
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Placeholder sections for future charts */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sales Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
            📊 Sales chart coming soon...
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lead Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
            📈 Lead funnel chart coming soon...
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
