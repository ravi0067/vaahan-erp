"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IndianRupee,
  Car,
  CalendarClock,
  Truck,
  Package,
  CreditCard,
  ArrowLeftRight,
  Flame,
  Plus,
  RefreshCw,
  ClipboardList,
  Clock,
  UserPlus,
  FileText,
  Wrench,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Fuel,
  Settings2,
  Palette,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import {
  BodyTypeSalesChart,
  FuelTypeDistributionChart,
  CarRevenueTrendChart,
  TopSellingCarsChart,
  FinanceVsCashChart,
  TestDriveConversionChart,
} from "./CarCharts";

// ── Types ────────────────────────────────────────────────────────────────────

interface CarDashboardStats {
  totalRevenue: number;
  carsSoldThisMonth: number;
  activeBookings: number;
  testDrivesScheduled: number;
  pendingDeliveries: number;
  availableStock: number;
  financeApplications: number;
  exchangeRequests: number;
}

interface CarBooking {
  id: string;
  bookingNumber: string;
  customerName: string;
  model: string;
  variant: string;
  fuelType: string;
  transmission: string;
  color: string;
  amount: number;
  status: string;
  date: string;
}

interface TestDrive {
  id: string;
  customerName: string;
  mobile: string;
  carModel: string;
  scheduledTime: string;
  salesperson: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
}

interface ExchangeRequest {
  id: string;
  customerName: string;
  oldCar: string;
  oldCarYear: number;
  estimatedValue: number;
  status: "PENDING" | "VALUATED" | "APPROVED" | "REJECTED";
  newModel: string;
}

interface FinanceApplication {
  id: string;
  customerName: string;
  bankName: string;
  loanAmount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "DISBURSED";
  appliedOn: string;
  carModel: string;
}

interface HotLead {
  id: string;
  customerName: string;
  mobile: string;
  interestedModel: string;
  budgetMin: number;
  budgetMax: number;
  fuelPreference: string;
  dealHealth: "HOT" | "WARM" | "COLD";
}

// ── Default Empty Data ────────────────────────────────────────────────────────

const EMPTY_STATS: CarDashboardStats = {
  totalRevenue: 0,
  carsSoldThisMonth: 0,
  activeBookings: 0,
  testDrivesScheduled: 0,
  pendingDeliveries: 0,
  availableStock: 0,
  financeApplications: 0,
  exchangeRequests: 0,
};











// ── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (amt: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amt);

const bookingStatusColors: Record<string, string> = {
  DRAFT: "bg-gray-50 text-gray-700 border-gray-200",
  CONFIRMED: "bg-green-50 text-green-700 border-green-200",
  RTO_PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  READY: "bg-purple-50 text-purple-700 border-purple-200",
  DELIVERED: "bg-blue-50 text-blue-700 border-blue-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

const testDriveStatusColors: Record<TestDrive["status"], string> = {
  SCHEDULED: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

const exchangeStatusColors: Record<ExchangeRequest["status"], string> = {
  PENDING: "bg-gray-50 text-gray-700 border-gray-200",
  VALUATED: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

const financeStatusColors: Record<FinanceApplication["status"], string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  DISBURSED: "bg-blue-50 text-blue-700 border-blue-200",
};

const financeStatusIcon: Record<FinanceApplication["status"], React.ReactNode> = {
  PENDING: <AlertCircle className="h-4 w-4 text-amber-600" />,
  APPROVED: <CheckCircle2 className="h-4 w-4 text-green-600" />,
  REJECTED: <XCircle className="h-4 w-4 text-red-600" />,
  DISBURSED: <CheckCircle2 className="h-4 w-4 text-blue-600" />,
};

const fuelTypeIcon: Record<string, React.ReactNode> = {
  Petrol: <Fuel className="h-3 w-3 text-amber-600" />,
  Diesel: <Fuel className="h-3 w-3 text-blue-700" />,
  Electric: <TrendingUp className="h-3 w-3 text-purple-600" />,
  CNG: <Fuel className="h-3 w-3 text-green-600" />,
  Hybrid: <Fuel className="h-3 w-3 text-cyan-600" />,
};

// ── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 bg-muted animate-pulse rounded" />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-16 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-40 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function CarDashboard() {
  const [stats, setStats] = React.useState<CarDashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = React.useState<CarBooking[]>([]);
  const [testDrives, setTestDrives] = React.useState<TestDrive[]>([]);
  const [exchanges, setExchanges] = React.useState<ExchangeRequest[]>([]);
  const [financeApps, setFinanceApps] = React.useState<FinanceApplication[]>([]);
  const [hotLeads, setHotLeads] = React.useState<HotLead[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const statsData = await apiGet<CarDashboardStats>("/api/dashboard/car-stats");
      setStats(statsData);
    } catch {
      setStats(EMPTY_STATS);
    }

    try {
      const [bookingsData, leadsData] = await Promise.all([
        apiGet<Array<{
          id: string;
          bookingNumber: string;
          status: string;
          totalAmount: number;
          createdAt: string;
          customer?: { name: string };
          vehicle?: { model: string; variant: string; fuelType: string; transmission: string; color: string };
        }>>("/api/bookings?status=all"),
        apiGet<Array<{
          id: string;
          customerName: string;
          mobile: string;
          interestedModel: string | null;
          dealHealth: string;
          notes: string | null;
        }>>("/api/leads?dealHealth=HOT"),
      ]);

      if (bookingsData && bookingsData.length > 0) {
        const mapped: CarBooking[] = bookingsData.slice(0, 6).map((b) => ({
          id: b.id,
          bookingNumber: b.bookingNumber,
          customerName: b.customer?.name ?? "N/A",
          model: b.vehicle?.model ?? "No vehicle",
          variant: b.vehicle?.variant ?? "",
          fuelType: b.vehicle?.fuelType ?? "",
          transmission: b.vehicle?.transmission ?? "",
          color: b.vehicle?.color ?? "",
          amount: b.totalAmount ?? 0,
          status: b.status,
          date: new Date(b.createdAt).toLocaleDateString("en-IN"),
        }));
        setRecentBookings(mapped);
      }

      if (leadsData && leadsData.length > 0) {
        const mappedLeads: HotLead[] = leadsData.slice(0, 5).map((l) => ({
          id: l.id,
          customerName: l.customerName,
          mobile: l.mobile,
          interestedModel: l.interestedModel ?? "Not specified",
          budgetMin: 0,
          budgetMax: 0,
          fuelPreference: "",
          dealHealth: l.dealHealth as HotLead["dealHealth"],
        }));
        setHotLeads(mappedLeads);
      }
    } catch {
      // APIs not available yet — empty state shown
    }

    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <DashboardSkeleton />;

  const currentStats = stats ?? EMPTY_STATS;

  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(currentStats.totalRevenue),
      change: "All time sales",
      icon: IndianRupee,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Cars Sold This Month",
      value: String(currentStats.carsSoldThisMonth),
      change: "Delivered this month",
      icon: Car,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Active Bookings",
      value: String(currentStats.activeBookings),
      change: "In progress",
      icon: ClipboardList,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Test Drives Today",
      value: String(currentStats.testDrivesScheduled),
      change: "Scheduled",
      icon: CalendarClock,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      title: "Pending Deliveries",
      value: String(currentStats.pendingDeliveries),
      change: "Ready to hand over",
      icon: Truck,
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      title: "Available Stock",
      value: String(currentStats.availableStock),
      change: "Cars in showroom",
      icon: Package,
      color: "text-cyan-600",
      bg: "bg-cyan-50 dark:bg-cyan-900/20",
    },
    {
      title: "Finance Applications",
      value: String(currentStats.financeApplications),
      change: "Active applications",
      icon: CreditCard,
      color: "text-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      title: "Exchange Requests",
      value: String(currentStats.exchangeRequests),
      change: "Trade-in pipeline",
      icon: ArrowLeftRight,
      color: "text-rose-600",
      bg: "bg-rose-50 dark:bg-rose-900/20",
    },
  ];

  const quickActions = [
    { label: "New Car Booking", href: "/bookings/new", icon: Plus, color: "bg-blue-600 hover:bg-blue-700" },
    { label: "Add Car to Stock", href: "/stock/add", icon: Car, color: "bg-cyan-600 hover:bg-cyan-700" },
    { label: "Schedule Test Drive", href: "/leads", icon: CalendarClock, color: "bg-amber-600 hover:bg-amber-700" },
    { label: "New Lead", href: "/leads", icon: UserPlus, color: "bg-green-600 hover:bg-green-700" },
    { label: "Create Job Card", href: "/service", icon: Wrench, color: "bg-purple-600 hover:bg-purple-700" },
    { label: "Exchange Valuation", href: "/bookings/new", icon: ArrowLeftRight, color: "bg-rose-600 hover:bg-rose-700" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">🚗 Car Showroom Dashboard</h1>
          <p className="text-muted-foreground">
            Your dealership at a glance — bookings, test drives, finance &amp; more.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={fetchData} className="gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          {quickActions.slice(0, 3).map((a) => {
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

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
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
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions Row */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((a) => {
              const Icon = a.icon;
              return (
                <Link key={a.label} href={a.href}>
                  <Button size="sm" className={`gap-1.5 text-white ${a.color}`}>
                    <Icon className="h-4 w-4" />
                    {a.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
          <TabsTrigger value="testdrives">Test Drives</TabsTrigger>
          <TabsTrigger value="exchange">Exchange / Trade-in</TabsTrigger>
          <TabsTrigger value="finance">Finance Tracker</TabsTrigger>
          <TabsTrigger value="leads">Hot Leads</TabsTrigger>
        </TabsList>

        {/* ── Recent Bookings ── */}
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-blue-600" /> Recent Car Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Car className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm">No bookings yet. Start by creating a new booking.</p>
                  <Link href="/bookings/new" className="mt-3">
                    <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="h-3.5 w-3.5" /> New Booking
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentBookings.map((b) => (
                    <div
                      key={b.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border gap-2 text-sm hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{b.customerName}</span>
                          <span className="text-xs text-muted-foreground font-mono">{b.bookingNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                            {b.model} {b.variant}
                          </span>
                          {b.fuelType && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              {fuelTypeIcon[b.fuelType]}
                              {b.fuelType}
                            </span>
                          )}
                          {b.transmission && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Settings2 className="h-3 w-3" />
                              {b.transmission}
                            </span>
                          )}
                          {b.color && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Palette className="h-3 w-3" />
                              {b.color}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-sm">{formatCurrency(b.amount)}</span>
                        <Badge
                          variant="outline"
                          className={bookingStatusColors[b.status] ?? ""}
                        >
                          {b.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Test Drives ── */}
        <TabsContent value="testdrives">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-amber-600" /> Today&apos;s Test Drive Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testDrives.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CalendarClock className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm">No test drives scheduled today.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {testDrives.map((td) => (
                    <div
                      key={td.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border gap-2 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-amber-50 dark:bg-amber-900/20">
                          <Car className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{td.customerName}</div>
                          <div className="text-xs text-muted-foreground">{td.mobile}</div>
                          <div className="text-xs font-medium text-blue-700 dark:text-blue-400 mt-0.5">
                            {td.carModel}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {td.scheduledTime}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {td.salesperson}
                        </div>
                        <Badge
                          variant="outline"
                          className={testDriveStatusColors[td.status]}
                        >
                          {td.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Exchange / Trade-in ── */}
        <TabsContent value="exchange">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5 text-rose-600" /> Exchange / Trade-in Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {exchanges.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ArrowLeftRight className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm">No exchange requests in pipeline.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {exchanges.map((ex) => (
                    <div
                      key={ex.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border gap-2 hover:bg-muted/40 transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-sm">{ex.customerName}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Old: <span className="font-medium">{ex.oldCar}</span>
                        </div>
                        <div className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                          Upgrading to: {ex.newModel}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-bold text-sm text-green-600">
                            {formatCurrency(ex.estimatedValue)}
                          </div>
                          <div className="text-xs text-muted-foreground">Estimated value</div>
                        </div>
                        <Badge
                          variant="outline"
                          className={exchangeStatusColors[ex.status]}
                        >
                          {ex.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Finance Tracker ── */}
        <TabsContent value="finance">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-indigo-600" /> Finance Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {financeApps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm">No finance applications found.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {financeApps.map((fa) => (
                    <div
                      key={fa.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border gap-2 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20">
                          {financeStatusIcon[fa.status]}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{fa.customerName}</div>
                          <div className="text-xs text-muted-foreground">
                            {fa.bankName} · {fa.carModel}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Applied: {new Date(fa.appliedOn).toLocaleDateString("en-IN")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="font-bold text-sm">{formatCurrency(fa.loanAmount)}</div>
                        <Badge
                          variant="outline"
                          className={financeStatusColors[fa.status]}
                        >
                          {fa.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Hot Leads ── */}
        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Flame className="h-5 w-5 text-red-600" /> Hot Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hotLeads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Flame className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm">No hot leads at the moment.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {hotLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-3 rounded-lg border space-y-2 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <span className="font-semibold text-sm">{lead.customerName}</span>
                          <span className="text-xs text-muted-foreground ml-2 font-mono">
                            {lead.mobile}
                          </span>
                        </div>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          🔥 {lead.dealHealth}
                        </Badge>
                      </div>
                      <div className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                        Interested: {lead.interestedModel}
                      </div>
                      {(lead.budgetMin > 0 || lead.budgetMax > 0) && (
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            Budget: {formatCurrency(lead.budgetMin)} –{" "}
                            {formatCurrency(lead.budgetMax)}
                          </span>
                          {lead.fuelPreference && (
                            <span className="flex items-center gap-1">
                              {fuelTypeIcon[lead.fuelPreference] ?? <Fuel className="h-3 w-3" />}
                              {lead.fuelPreference}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Charts Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">📊 Analytics</h2>
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <CarRevenueTrendChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Finance vs Cash Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <FinanceVsCashChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sales by Body Type</CardTitle>
            </CardHeader>
            <CardContent>
              <BodyTypeSalesChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fuel Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <FuelTypeDistributionChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Selling Models</CardTitle>
            </CardHeader>
            <CardContent>
              <TopSellingCarsChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Test Drive → Booking Conversion</CardTitle>
            </CardHeader>
            <CardContent>
              <TestDriveConversionChart />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Summary Footer */}
      <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {currentStats.carsSoldThisMonth}
              </div>
              <div className="text-xs text-muted-foreground">Cars Sold</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {currentStats.testDrivesScheduled}
              </div>
              <div className="text-xs text-muted-foreground">Test Drives Today</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {currentStats.financeApplications}
              </div>
              <div className="text-xs text-muted-foreground">Finance Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {formatCurrency(currentStats.totalRevenue)}
              </div>
              <div className="text-xs text-muted-foreground">Total Revenue</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
