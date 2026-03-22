"use client";

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
} from "lucide-react";
import {
  SalesTrendChart,
  LeadPipelineChart,
  RevenueByMonthChart,
  VehicleStatusChart,
  TopSellingModelsChart,
} from "@/components/charts/ChartComponents";

const stats = [
  { title: "Today's Revenue", value: "₹3,45,000", change: "4 vehicles sold today", icon: IndianRupee, color: "text-green-600", bg: "bg-green-50" },
  { title: "Monthly Sales", value: "₹24,56,000", change: "+12.5% from last month", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
  { title: "Active Bookings", value: "23", change: "5 pending delivery", icon: ClipboardList, color: "text-purple-600", bg: "bg-purple-50" },
  { title: "Hot Leads", value: "18", change: "7 follow-ups today", icon: Flame, color: "text-orange-600", bg: "bg-orange-50" },
  { title: "Today's Deliveries", value: "3", change: "2 ready, 1 in-transit", icon: Truck, color: "text-yellow-600", bg: "bg-yellow-50" },
  { title: "Pending Payments", value: "₹8,90,000", change: "12 invoices pending", icon: CreditCard, color: "text-red-600", bg: "bg-red-50" },
  { title: "Cash in Hand", value: "₹5,67,890", change: "Daybook balanced", icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-50" },
  { title: "Open Service Jobs", value: "7", change: "2 urgent", icon: Wrench, color: "text-indigo-600", bg: "bg-indigo-50" },
];

const recentBookings = [
  { id: "BK-2024-001", customer: "Rahul Verma", model: "Honda Activa 6G", amount: "₹85,000", status: "Confirmed", date: "Today" },
  { id: "BK-2024-002", customer: "Sneha Patel", model: "Honda SP 125", amount: "₹96,000", status: "Pending Payment", date: "Today" },
  { id: "BK-2024-003", customer: "Ajay Kumar", model: "Honda Shine", amount: "₹82,000", status: "Delivered", date: "Yesterday" },
  { id: "BK-2024-004", customer: "Meera Sharma", model: "Honda CB350", amount: "₹2,10,000", status: "Confirmed", date: "Yesterday" },
  { id: "BK-2024-005", customer: "Karan Singh", model: "Honda Unicorn", amount: "₹1,05,000", status: "Ready for Delivery", date: "2 days ago" },
  { id: "BK-2024-006", customer: "Pooja Gupta", model: "Honda Dio", amount: "₹72,000", status: "Confirmed", date: "2 days ago" },
  { id: "BK-2024-007", customer: "Deepak Yadav", model: "Honda Activa 6G", amount: "₹78,000", status: "Delivered", date: "3 days ago" },
  { id: "BK-2024-008", customer: "Anita Roy", model: "Honda SP 125", amount: "₹92,000", status: "Cancelled", date: "3 days ago" },
  { id: "BK-2024-009", customer: "Vijay Mishra", model: "Honda Hornet 2.0", amount: "₹1,35,000", status: "Pending Payment", date: "4 days ago" },
  { id: "BK-2024-010", customer: "Sunita Devi", model: "Honda Activa 6G", amount: "₹85,000", status: "Confirmed", date: "5 days ago" },
];

const todayFollowups = [
  { name: "Arjun Mehta", phone: "98765-43210", model: "Honda CB350", status: "Hot", note: "Ready to book, needs finance info" },
  { name: "Priya Raj", phone: "87654-32109", model: "Honda Activa 6G", status: "Warm", note: "Comparing with TVS Jupiter" },
  { name: "Sanjay Tiwari", phone: "76543-21098", model: "Honda SP 125", status: "Hot", note: "Wants test ride this week" },
  { name: "Neha Gupta", phone: "65432-10987", model: "Honda Shine", status: "Warm", note: "Budget discussion pending" },
  { name: "Rohit Joshi", phone: "54321-09876", model: "Honda Unicorn", status: "Hot", note: "Coming today for booking" },
];

const bookingStatusColors: Record<string, string> = {
  Confirmed: "bg-green-50 text-green-700 border-green-200",
  "Pending Payment": "bg-amber-50 text-amber-700 border-amber-200",
  Delivered: "bg-blue-50 text-blue-700 border-blue-200",
  "Ready for Delivery": "bg-purple-50 text-purple-700 border-purple-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
};

const leadStatusColors: Record<string, string> = {
  Hot: "bg-red-50 text-red-700 border-red-200",
  Warm: "bg-amber-50 text-amber-700 border-amber-200",
  Cold: "bg-blue-50 text-blue-700 border-blue-200",
};

const quickActions = [
  { label: "New Booking", href: "/bookings/new", icon: Plus, color: "bg-blue-600 hover:bg-blue-700" },
  { label: "Add Stock", href: "/stock/add", icon: Package, color: "bg-green-600 hover:bg-green-700" },
  { label: "Add Lead", href: "/leads", icon: UserPlus, color: "bg-orange-600 hover:bg-orange-700" },
  { label: "New Job Card", href: "/service", icon: FileText, color: "bg-purple-600 hover:bg-purple-700" },
];

export function DealerDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s your dealership overview.</p>
        </div>
        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap">
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
        {/* Recent Bookings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-2.5 rounded-lg border text-sm">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{b.customer}</span>
                      <span className="text-xs text-muted-foreground">{b.id}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{b.model} · {b.date}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold text-sm">{b.amount}</span>
                    <Badge variant="outline" className={bookingStatusColors[b.status] || ""}>
                      {b.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Follow-ups */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="h-5 w-5" /> Today&apos;s Follow-ups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayFollowups.map((lead) => (
                <div key={lead.phone} className="p-3 rounded-lg border space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{lead.name}</span>
                    <Badge variant="outline" className={leadStatusColors[lead.status] || ""}>
                      {lead.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{lead.model}</p>
                  <p className="text-xs text-muted-foreground">{lead.note}</p>
                  <p className="text-xs font-mono text-muted-foreground">{lead.phone}</p>
                </div>
              ))}
            </div>
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
          <CardHeader><CardTitle className="text-lg">Vehicle Status</CardTitle></CardHeader>
          <CardContent><VehicleStatusChart /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Top Selling Models</CardTitle></CardHeader>
          <CardContent><TopSellingModelsChart /></CardContent>
        </Card>
      </div>
    </div>
  );
}
