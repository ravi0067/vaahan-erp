"use client";

import { useState, useEffect } from "react";
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
  Loader2,
  Building2,
} from "lucide-react";

interface TenantData {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  address?: string;
  phone?: string;
  createdAt: string;
  _count?: { users: number; vehicles: number; bookings: number };
}

const planColor = (p: string) => {
  const c: Record<string, string> = {
    FREE: "bg-gray-50 text-gray-700 border-gray-200",
    STARTER: "bg-blue-50 text-blue-700 border-blue-200",
    PROFESSIONAL: "bg-purple-50 text-purple-700 border-purple-200",
    ENTERPRISE: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return c[p] || "bg-gray-50 text-gray-700 border-gray-200";
};

const statusColor = (s: string) =>
  s === "ACTIVE"
    ? "bg-green-50 text-green-700 border-green-200"
    : s === "SUSPENDED"
    ? "bg-red-50 text-red-700 border-red-200"
    : "bg-yellow-50 text-yellow-700 border-yellow-200";

export function SuperOwnerDashboard() {
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/tenants");
        if (res.ok) {
          const data = await res.json();
          setTenants(Array.isArray(data) ? data : []);
        }
      } catch {
        // API error — empty state
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Compute real stats from tenants (exclude platform tenant)
  const clientTenants = tenants.filter((t) => t.slug !== "vaahan-platform");
  const totalClients = clientTenants.length;
  const activeClients = clientTenants.filter((t) => t.status === "ACTIVE").length;
  const expiredClients = clientTenants.filter((t) => t.status !== "ACTIVE").length;
  const totalUsers = clientTenants.reduce((sum, t) => sum + (t._count?.users || 0), 0);
  const totalBookings = clientTenants.reduce((sum, t) => sum + (t._count?.bookings || 0), 0);

  const stats = [
    { title: "Total Clients", value: totalClients.toString(), change: `${totalUsers} total users`, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Total Bookings", value: totalBookings.toString(), change: "Across all clients", icon: IndianRupee, color: "text-green-600", bg: "bg-green-50" },
    { title: "Active Clients", value: activeClients.toString(), change: "Currently active", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Inactive/Expired", value: expiredClients.toString(), change: expiredClients > 0 ? "Renewal pending" : "All good!", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading dashboard...</span>
      </div>
    );
  }

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
            {clientTenants.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Clients Onboarded Yet</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Start by adding your first dealership client from the Admin panel.
                </p>
                <Link href="/admin">
                  <Button>
                    <Users className="h-4 w-4 mr-2" /> Add First Client
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {clientTenants.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="font-bold text-primary text-sm">{c.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c._count?.users || 0} users • {c._count?.bookings || 0} bookings • {c._count?.vehicles || 0} vehicles
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <Badge variant="outline" className={planColor(c.plan)}>{c.plan}</Badge>
                      <Badge variant="outline" className={statusColor(c.status)}>{c.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            {[
              { label: "Database", value: "Connected", status: "healthy" },
              { label: "Platform", value: "Vercel", status: "healthy" },
              { label: "Region", value: "AP South 1 (Mumbai)", status: "healthy" },
              { label: "Total Tenants", value: tenants.length.toString(), status: "healthy" },
            ].map((h) => (
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
