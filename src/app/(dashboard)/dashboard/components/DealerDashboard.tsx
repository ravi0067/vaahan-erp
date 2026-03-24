"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IndianRupee,
  TrendingUp,
  ClipboardList,
  Flame,
  Truck,
  Wallet,
  Wrench,
  CreditCard,
  Plus,
  Package,
  UserPlus,
  FileText,
  Phone,
  RefreshCw,
} from "lucide-react";
import {
  SalesTrendChart,
  LeadPipelineChart,
  RevenueByMonthChart,
  VehicleStatusChart,
  TopSellingModelsChart,
} from "@/components/charts/ChartComponents";
import { useShowroomStore } from "@/store/showroom-store";
import { showroomConfig } from "@/lib/showroom-config";
import { apiGet } from "@/lib/api";

const bookingStatusColors: Record<string, string> = {
  DRAFT: "bg-gray-50 text-gray-700 border-gray-200",
  CONFIRMED: "bg-green-50 text-green-700 border-green-200",
  RTO_PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  READY: "bg-purple-50 text-purple-700 border-purple-200",
  DELIVERED: "bg-blue-50 text-blue-700 border-blue-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

const leadStatusColors: Record<string, string> = {
  HOT: "bg-red-50 text-red-700 border-red-200",
  WARM: "bg-amber-50 text-amber-700 border-amber-200",
  COLD: "bg-blue-50 text-blue-700 border-blue-200",
};

interface DashboardStats {
  totalRevenue: number;
  todaySales: number;
  activeBookings: number;
  hotLeads: number;
  pendingDeliveries: number;
  cashInHand: number;
  totalVehicles: number;
  availableVehicles: number;
  totalCustomers: number;
  totalLeads: number;
}

const formatCurrency = (amt: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amt);

export function DealerDashboard() {
  const { showroomType } = useShowroomStore();
  const config = showroomConfig[showroomType];

  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = React.useState<any[]>([]);
  const [hotLeads, setHotLeads] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, bookingsData, leadsData] = await Promise.all([
        apiGet<DashboardStats>('/api/dashboard/stats'),
        apiGet<any[]>('/api/bookings?status=all'),
        apiGet<any[]>('/api/leads?dealHealth=HOT'),
      ]);
      setStats(statsData && typeof statsData === 'object' && !('error' in statsData) ? statsData : null);
      setRecentBookings(Array.isArray(bookingsData) ? bookingsData.slice(0, 8) : []);
      setHotLeads(Array.isArray(leadsData) ? leadsData.slice(0, 5) : []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setStats(null);
      setRecentBookings([]);
      setHotLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const statCards = stats ? [
    { title: "Total Revenue", value: formatCurrency(stats.totalRevenue), change: `${stats.todaySales} sold today`, icon: IndianRupee, color: "text-green-600", bg: "bg-green-50" },
    { title: "Active Bookings", value: String(stats.activeBookings), change: `${stats.pendingDeliveries} pending delivery`, icon: ClipboardList, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Hot Leads", value: String(stats.hotLeads), change: `${stats.totalLeads} total leads`, icon: Flame, color: "text-orange-600", bg: "bg-orange-50" },
    { title: "Pending Deliveries", value: String(stats.pendingDeliveries), change: "Ready for delivery", icon: Truck, color: "text-yellow-600", bg: "bg-yellow-50" },
    { title: "Cash in Hand", value: formatCurrency(stats.cashInHand), change: "Today's daybook", icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Total Vehicles", value: String(stats.totalVehicles), change: `${stats.availableVehicles} available`, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Total Customers", value: String(stats.totalCustomers), change: "All time", icon: UserPlus, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Today's Sales", value: String(stats.todaySales), change: "Delivered today", icon: TrendingUp, color: "text-red-600", bg: "bg-red-50" },
  ] : [];

  const quickActions = [
    { label: `New Booking`, href: "/bookings/new", icon: Plus, color: "bg-blue-600 hover:bg-blue-700" },
    { label: `Add ${config.vehicleLabel}`, href: "/stock/add", icon: Package, color: "bg-green-600 hover:bg-green-700" },
    { label: "Add Lead", href: "/leads", icon: UserPlus, color: "bg-orange-600 hover:bg-orange-700" },
    { label: "New Job Card", href: "/service", icon: FileText, color: "bg-purple-600 hover:bg-purple-700" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-16 bg-muted animate-pulse rounded" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s your {config.label.toLowerCase()} overview.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={fetchData} className="gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.label} href={a.href}>
                <Button size="sm" className={`gap-1 text-white ${a.color}`}>
                  <Icon className="h-3.5 w-3.5" /> {a.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
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
        {/* Recent Bookings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No bookings yet</p>
            ) : (
              <div className="space-y-2">
                {recentBookings.map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between p-2.5 rounded-lg border text-sm">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{b.customer?.name || 'N/A'}</span>
                        <span className="text-xs text-muted-foreground">{b.bookingNumber}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {b.vehicle?.model || 'No vehicle'} · {new Date(b.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-semibold text-sm">{formatCurrency(b.totalAmount || 0)}</span>
                      <Badge variant="outline" className={bookingStatusColors[b.status] || ""}>
                        {b.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hot Leads */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="h-5 w-5" /> Hot Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hotLeads.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No hot leads</p>
            ) : (
              <div className="space-y-3">
                {hotLeads.map((lead: any) => (
                  <div key={lead.id} className="p-3 rounded-lg border space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{lead.customerName}</span>
                      <Badge variant="outline" className={leadStatusColors[lead.dealHealth] || ""}>
                        {lead.dealHealth}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{lead.interestedModel || 'No model specified'}</p>
                    {lead.notes && <p className="text-xs text-muted-foreground">{lead.notes}</p>}
                    <p className="text-xs font-mono text-muted-foreground">{lead.mobile}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Sales Trend (Last 7 Days)</CardTitle></CardHeader>
          <CardContent><SalesTrendChart /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Lead Pipeline</CardTitle></CardHeader>
          <CardContent><LeadPipelineChart /></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-lg">Revenue by Month</CardTitle></CardHeader>
          <CardContent><RevenueByMonthChart /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">{config.vehicleLabel} Status</CardTitle></CardHeader>
          <CardContent><VehicleStatusChart /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Top Selling {config.vehicleLabelPlural}</CardTitle></CardHeader>
          <CardContent><TopSellingModelsChart /></CardContent>
        </Card>
      </div>
    </div>
  );
}
