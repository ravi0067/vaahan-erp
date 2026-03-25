"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Bike,
  Car,
  ClipboardList,
  Flame,
  Package,
  Wrench,
  Banknote,
  Users,
  Calendar,
  CreditCard,
  ArrowRight,
  Home,
  LogIn,
  BarChart3,
  Plus,
  FileText,
  Bell,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

// ─── Bike Demo Data ───────────────────────────────────────────────────────────

const bikeStats = [
  { label: "Total Revenue", value: "₹24,50,000", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
  { label: "Bikes Sold", value: "32", icon: Bike, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Active Bookings", value: "8", icon: ClipboardList, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Hot Leads", value: "12", icon: Flame, color: "text-orange-600", bg: "bg-orange-50" },
  { label: "Pending Deliveries", value: "4", icon: Package, color: "text-yellow-600", bg: "bg-yellow-50" },
  { label: "Available Stock", value: "28", icon: BarChart3, color: "text-teal-600", bg: "bg-teal-50" },
  { label: "Service Jobs", value: "6", icon: Wrench, color: "text-red-600", bg: "bg-red-50" },
  { label: "Cash in Hand", value: "₹3,20,000", icon: Banknote, color: "text-emerald-600", bg: "bg-emerald-50" },
];

const bikeBookings = [
  { id: "BK-001", customer: "Arjun Sharma", model: "KTM Duke 390", color: "Ceramic White", amount: "₹2,89,000", status: "Confirmed", date: "24 Mar 2026" },
  { id: "BK-002", customer: "Priya Nair", model: "Royal Enfield Classic 350", color: "Halcyon Black", amount: "₹1,93,000", status: "Pending", date: "23 Mar 2026" },
  { id: "BK-003", customer: "Rahul Verma", model: "Hero Splendor Plus", color: "Heavy Grey", amount: "₹82,000", status: "Delivered", date: "22 Mar 2026" },
  { id: "BK-004", customer: "Sneha Patel", model: "Bajaj Pulsar NS200", color: "Burnt Red", amount: "₹1,38,000", status: "Confirmed", date: "21 Mar 2026" },
  { id: "BK-005", customer: "Karthik Reddy", model: "TVS Apache RTR 200", color: "Racing Red", amount: "₹1,28,000", status: "Pending", date: "20 Mar 2026" },
];

const bikeLeads = [
  { name: "Amit Joshi", phone: "+91 98765 43210", model: "KTM RC 390", source: "Walk-in", health: "HOT", followUp: "Today" },
  { name: "Divya Krishnan", phone: "+91 87654 32109", model: "RE Himalayan", source: "Website", health: "WARM", followUp: "Tomorrow" },
  { name: "Suresh Kumar", phone: "+91 76543 21098", model: "Yamaha MT-15", source: "Referral", health: "HOT", followUp: "Today" },
  { name: "Meera Iyer", phone: "+91 65432 10987", model: "Honda CB300R", source: "Instagram", health: "WARM", followUp: "26 Mar" },
];

// ─── Car Demo Data ────────────────────────────────────────────────────────────

const carStats = [
  { label: "Total Revenue", value: "₹3,45,00,000", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
  { label: "Cars Sold", value: "28", icon: Car, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Active Bookings", value: "14", icon: ClipboardList, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Test Drives", value: "9", icon: Calendar, color: "text-orange-600", bg: "bg-orange-50" },
  { label: "Pending Deliveries", value: "6", icon: Package, color: "text-yellow-600", bg: "bg-yellow-50" },
  { label: "Available Stock", value: "47", icon: BarChart3, color: "text-teal-600", bg: "bg-teal-50" },
  { label: "Finance Applications", value: "11", icon: CreditCard, color: "text-red-600", bg: "bg-red-50" },
  { label: "Exchange Requests", value: "5", icon: RefreshCw, color: "text-emerald-600", bg: "bg-emerald-50" },
];

const carBookings = [
  { id: "CB-001", customer: "Vikram Malhotra", model: "Hyundai Creta", variant: "SX(O) 1.5 Turbo DCT", color: "Abyss Black", fuel: "Petrol", transmission: "Automatic", amount: "₹20,42,000", status: "Confirmed", date: "24 Mar 2026" },
  { id: "CB-002", customer: "Ananya Desai", model: "Tata Nexon EV", variant: "Max LR Empowered+", color: "Pristine White", fuel: "Electric", transmission: "Automatic", amount: "₹19,79,000", status: "Pending", date: "23 Mar 2026" },
  { id: "CB-003", customer: "Rajesh Khanna", model: "Kia Seltos", variant: "GTX+ 1.5 DCT", color: "Gravity Grey", fuel: "Petrol", transmission: "Automatic", amount: "₹18,65,000", status: "Delivered", date: "22 Mar 2026" },
  { id: "CB-004", customer: "Pooja Mehta", model: "Maruti Swift", variant: "ZXi+ AGS", color: "Speedy Blue", fuel: "Petrol", transmission: "Automatic", amount: "₹9,11,000", status: "Confirmed", date: "21 Mar 2026" },
  { id: "CB-005", customer: "Sunil Gupta", model: "Mahindra XUV700", variant: "AX7 L Turbo AT", color: "Red Rage", fuel: "Petrol", transmission: "Automatic", amount: "₹27,35,000", status: "Pending", date: "20 Mar 2026" },
];

const testDrives = [
  { customer: "Ritu Agarwal", model: "Hyundai Creta", time: "10:00 AM", date: "25 Mar", executive: "Manish S.", status: "Scheduled" },
  { customer: "Deepak Nair", model: "Tata Punch EV", time: "11:30 AM", date: "25 Mar", executive: "Priya K.", status: "Completed" },
  { customer: "Lakshmi Pillai", model: "Kia Carens", time: "2:00 PM", date: "25 Mar", executive: "Rahul M.", status: "Scheduled" },
  { customer: "Harish Sethi", model: "MG Hector Plus", time: "4:30 PM", date: "26 Mar", executive: "Anjali T.", status: "Pending" },
];

const financeTracker = [
  { customer: "Vikram Malhotra", model: "Hyundai Creta", bank: "HDFC Bank", amount: "₹15,00,000", emi: "₹32,500/mo", status: "Approved" },
  { customer: "Pooja Mehta", model: "Maruti Swift", bank: "SBI Bank", amount: "₹7,00,000", emi: "₹15,200/mo", status: "Processing" },
  { customer: "Sunil Gupta", model: "Mahindra XUV700", bank: "ICICI Bank", amount: "₹20,00,000", emi: "₹43,000/mo", status: "Pending Docs" },
  { customer: "Kavya Nair", model: "Toyota Innova HyCross", bank: "Axis Bank", amount: "₹18,00,000", emi: "₹38,900/mo", status: "Approved" },
];

const carLeads = [
  { name: "Sanjay Tiwari", phone: "+91 99887 76655", model: "Hyundai Tucson", source: "Walk-in", health: "HOT", followUp: "Today" },
  { name: "Nisha Bajaj", phone: "+91 88776 65544", model: "Kia EV6", source: "Website", health: "WARM", followUp: "Tomorrow" },
  { name: "Ajit Kulkarni", phone: "+91 77665 54433", model: "MG ZS EV", source: "Referral", health: "HOT", followUp: "Today" },
];

// ─── Helper Components ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    Confirmed: "bg-blue-100 text-blue-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Delivered: "bg-green-100 text-green-700",
    Scheduled: "bg-purple-100 text-purple-700",
    Completed: "bg-green-100 text-green-700",
    Approved: "bg-green-100 text-green-700",
    Processing: "bg-blue-100 text-blue-700",
    "Pending Docs": "bg-orange-100 text-orange-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

function DealHealthBadge({ health }: { health: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${health === "HOT" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
      {health === "HOT" ? "🔥" : "♨️"} {health}
    </span>
  );
}

// ─── Bike Dashboard ───────────────────────────────────────────────────────────

function BikeDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {bikeStats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-purple-600" /> Recent Bookings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-y border-gray-100">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Bike Model</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Amount</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {bikeBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-xs text-gray-500 font-mono">{b.id}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{b.customer}</div>
                          <div className="text-xs text-gray-400">{b.date}</div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="font-medium text-gray-800">{b.model}</div>
                          <div className="text-xs text-gray-400">{b.color}</div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-800 hidden lg:table-cell">{b.amount}</td>
                        <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hot Leads */}
        <div>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-600" /> Hot Leads
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bikeLeads.map((lead) => (
                <div key={lead.name} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-gray-900">{lead.name}</span>
                    <DealHealthBadge health={lead.health} />
                  </div>
                  <p className="text-xs text-gray-500">{lead.model}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-gray-400">{lead.source}</span>
                    <span className="text-xs text-blue-600 font-medium">📅 {lead.followUp}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus className="w-4 h-4" /> New Booking
            </Button>
            <Button size="sm" variant="outline" className="gap-2 border-orange-200 text-orange-700 hover:bg-orange-50">
              <Users className="w-4 h-4" /> Add Lead
            </Button>
            <Button size="sm" variant="outline" className="gap-2 border-green-200 text-green-700 hover:bg-green-50">
              <Banknote className="w-4 h-4" /> Record Payment
            </Button>
            <Button size="sm" variant="outline" className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50">
              <Wrench className="w-4 h-4" /> New Service Job
            </Button>
            <Button size="sm" variant="outline" className="gap-2 border-teal-200 text-teal-700 hover:bg-teal-50">
              <FileText className="w-4 h-4" /> View Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Car Dashboard ────────────────────────────────────────────────────────────

function CarDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {carStats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bookings + Test Drives */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-purple-600" /> Recent Bookings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-y border-gray-100">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Model & Variant</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Amount</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {carBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{b.customer}</div>
                          <div className="text-xs text-gray-400">{b.date}</div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="font-medium text-gray-800">{b.model}</div>
                          <div className="text-xs text-gray-400">{b.fuel} · {b.transmission} · {b.color}</div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-800 hidden lg:table-cell">{b.amount}</td>
                        <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Drive Schedule */}
        <div>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" /> Test Drive Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {testDrives.map((td) => (
                <div key={td.customer} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-gray-900">{td.customer}</span>
                    <StatusBadge status={td.status} />
                  </div>
                  <p className="text-xs font-medium text-gray-700">{td.model}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-gray-400">🕐 {td.time}, {td.date}</span>
                    <span className="text-xs text-blue-600">{td.executive}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Finance Tracker + Hot Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Finance Tracker */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-red-600" /> Finance Tracker
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {financeTracker.map((f) => (
              <div key={f.customer} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-gray-900">{f.customer}</div>
                  <div className="text-xs text-gray-500">{f.model} · {f.bank}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Loan: {f.amount} · EMI: {f.emi}</div>
                </div>
                <StatusBadge status={f.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Hot Leads */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-600" /> Hot Leads
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {carLeads.map((lead) => (
              <div key={lead.name} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-gray-900">{lead.name}</span>
                  <DealHealthBadge health={lead.health} />
                </div>
                <p className="text-xs text-gray-500">{lead.model}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-gray-400">{lead.source} · {lead.phone}</span>
                  <span className="text-xs text-blue-600 font-medium">📅 {lead.followUp}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus className="w-4 h-4" /> New Booking
            </Button>
            <Button size="sm" variant="outline" className="gap-2 border-orange-200 text-orange-700 hover:bg-orange-50">
              <Calendar className="w-4 h-4" /> Schedule Test Drive
            </Button>
            <Button size="sm" variant="outline" className="gap-2 border-green-200 text-green-700 hover:bg-green-50">
              <CreditCard className="w-4 h-4" /> Finance Application
            </Button>
            <Button size="sm" variant="outline" className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50">
              <RefreshCw className="w-4 h-4" /> Exchange Request
            </Button>
            <Button size="sm" variant="outline" className="gap-2 border-teal-200 text-teal-700 hover:bg-teal-50">
              <FileText className="w-4 h-4" /> View Reports
            </Button>
            <Button size="sm" variant="outline" className="gap-2 border-red-200 text-red-700 hover:bg-red-50">
              <Bell className="w-4 h-4" /> Delivery Alert
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm transition-colors">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <span className="text-gray-300">›</span>
              <span className="font-bold text-gray-900 text-sm sm:text-base">VaahanERP Live Demo</span>
            </div>
            <Link href="/auth/login">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-center">
          <p className="text-sm text-amber-800 font-medium">
            🎯 This is a demo with sample data. Login to access your real dashboard.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Live Demo Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Explore a fully functional showroom management experience</p>
        </div>

        <Tabs defaultValue="bike" className="w-full">
          <TabsList className="mb-6 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="bike" className="rounded-lg text-sm font-medium px-4 sm:px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              🏍️ <span className="ml-1.5">Bike Showroom Demo</span>
            </TabsTrigger>
            <TabsTrigger value="car" className="rounded-lg text-sm font-medium px-4 sm:px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              🚗 <span className="ml-1.5">Car Showroom Demo</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bike">
            <BikeDashboard />
          </TabsContent>

          <TabsContent value="car">
            <CarDashboard />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Ready to manage your showroom?</h2>
          <p className="text-blue-100 text-sm mb-4">Get started with VaahanERP — built for Indian dealerships</p>
          <Link href="/auth/login">
            <Button className="bg-white text-blue-700 hover:bg-blue-50 font-semibold gap-2">
              Start Your Free Trial <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
