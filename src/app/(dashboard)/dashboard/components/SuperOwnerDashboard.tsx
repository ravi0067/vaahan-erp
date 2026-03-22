"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Users,
  IndianRupee,
  ShieldCheck,
  AlertTriangle,
  Server,
  Activity,
  ArrowRight,
} from "lucide-react";

const stats = [
  { title: "Total Clients", value: "24", change: "+3 this month", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { title: "Total Revenue", value: "₹18,45,000", change: "+8.2% MoM", icon: IndianRupee, color: "text-green-600", bg: "bg-green-50" },
  { title: "Active Plans", value: "21", change: "3 expiring soon", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  { title: "Expired Plans", value: "3", change: "Renewal pending", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
];

const clients = [
  { name: "Vaahan Motors", plan: "Pro", revenue: "₹4,56,000", status: "Active", location: "Lucknow" },
  { name: "Sharma Honda", plan: "Business", revenue: "₹3,28,000", status: "Active", location: "Kanpur" },
  { name: "City Bikes", plan: "Starter", revenue: "₹1,12,000", status: "Active", location: "Agra" },
  { name: "Royal Riders", plan: "Pro", revenue: "₹5,67,000", status: "Active", location: "Delhi" },
  { name: "Moto Hub", plan: "Starter", revenue: "₹89,000", status: "Expired", location: "Noida" },
  { name: "Speed Zone", plan: "Business", revenue: "₹2,34,000", status: "Active", location: "Jaipur" },
];

const systemHealth = [
  { label: "API Response", value: "45ms", status: "healthy" },
  { label: "Database", value: "Connected", status: "healthy" },
  { label: "Storage", value: "62% used", status: "warning" },
  { label: "Uptime", value: "99.9%", status: "healthy" },
];

export function SuperOwnerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Dashboard</h1>
        <p className="text-muted-foreground">Super Admin — Overview of all dealerships</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        {/* Client List */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Client Dealerships</CardTitle>
            <Link href="/admin">
              <Button variant="outline" size="sm" className="gap-1">
                Manage Clients <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clients.map((c) => (
                <div key={c.name} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary text-sm">{c.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.location}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="text-sm font-semibold">{c.revenue}</p>
                      <Badge variant="outline" className="text-[10px]">{c.plan}</Badge>
                    </div>
                    <Badge
                      variant="outline"
                      className={c.status === "Active" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}
                    >
                      {c.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="h-5 w-5" /> System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemHealth.map((h) => (
              <div key={h.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className={`h-4 w-4 ${h.status === "healthy" ? "text-green-500" : "text-amber-500"}`} />
                  <span className="text-sm">{h.label}</span>
                </div>
                <span className={`text-sm font-medium ${h.status === "healthy" ? "text-green-600" : "text-amber-600"}`}>
                  {h.value}
                </span>
              </div>
            ))}

            {/* Revenue chart placeholder */}
            <div className="mt-6 border-t pt-4">
              <p className="text-sm font-medium mb-3">Revenue Trend (All Clients)</p>
              <div className="h-[120px] flex items-center justify-center text-muted-foreground text-sm bg-muted/50 rounded-lg">
                📊 Chart coming soon...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
