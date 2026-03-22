"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { TrendingUp, Calendar, IndianRupee, AlertCircle, Download } from "lucide-react";
import { exportToCSV } from "@/lib/export-csv";
import { DailySalesChart, SalesByPaymentModeChart } from "@/components/charts/ChartComponents";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

interface Sale {
  id: string;
  date: string;
  bookingNo: string;
  customer: string;
  vehicle: string;
  amount: number;
  status: "Completed" | "Pending" | "Partial";
}

const mockSales: Sale[] = [
  { id: "1", date: "2025-03-22", bookingNo: "BK-010", customer: "Raj Kumar", vehicle: "Honda Activa 6G", amount: 85000, status: "Completed" },
  { id: "2", date: "2025-03-21", bookingNo: "BK-009", customer: "Priya Singh", vehicle: "TVS Jupiter 125", amount: 78000, status: "Completed" },
  { id: "3", date: "2025-03-20", bookingNo: "BK-008", customer: "Amit Sharma", vehicle: "Hero Splendor Plus", amount: 72000, status: "Pending" },
  { id: "4", date: "2025-03-19", bookingNo: "BK-007", customer: "Neha Gupta", vehicle: "Suzuki Access 125", amount: 92000, status: "Completed" },
  { id: "5", date: "2025-03-18", bookingNo: "BK-006", customer: "Suresh Yadav", vehicle: "Bajaj Pulsar 150", amount: 145000, status: "Partial" },
  { id: "6", date: "2025-03-17", bookingNo: "BK-005", customer: "Vikash Tiwari", vehicle: "Hero HF Deluxe", amount: 65000, status: "Completed" },
  { id: "7", date: "2025-03-16", bookingNo: "BK-004", customer: "Mohit Verma", vehicle: "Honda Shine 125", amount: 82000, status: "Completed" },
  { id: "8", date: "2025-03-15", bookingNo: "BK-003", customer: "Aarti Devi", vehicle: "TVS Scooty Pep+", amount: 58000, status: "Pending" },
];

const statusColor = (s: string) => {
  switch (s) {
    case "Completed": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    case "Pending": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
    case "Partial": return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    default: return "";
  }
};

type FilterRange = "Today" | "This Week" | "This Month" | "Custom";

export default function SalesPage() {
  const [range, setRange] = React.useState<FilterRange>("This Month");

  const today = "2025-03-22";
  const filtered = mockSales.filter((s) => {
    if (range === "Today") return s.date === today;
    if (range === "This Week") return s.date >= "2025-03-17";
    return true; // This Month / Custom shows all
  });

  const todaySales = mockSales.filter((s) => s.date === today).reduce((a, s) => a + s.amount, 0);
  const weekSales = mockSales.filter((s) => s.date >= "2025-03-17").reduce((a, s) => a + s.amount, 0);
  const monthSales = mockSales.reduce((a, s) => a + s.amount, 0);
  const pendingCollections = mockSales.filter((s) => s.status !== "Completed").reduce((a, s) => a + s.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sales</h1>
          <p className="text-muted-foreground text-sm">Sales overview and collection tracking</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportToCSV(filtered as unknown as Record<string, unknown>[], "sales", [
            { key: "date", label: "Date" },
            { key: "bookingNo", label: "Booking #" },
            { key: "customer", label: "Customer" },
            { key: "vehicle", label: "Vehicle" },
            { key: "amount", label: "Amount" },
            { key: "status", label: "Status" },
          ])}
        >
          <Download className="h-4 w-4 mr-1" /> Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{fmt(todaySales)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{fmt(weekSales)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <IndianRupee className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{fmt(monthSales)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Collections</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{fmt(pendingCollections)}</div></CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Daily Sales (March 2025)</CardTitle></CardHeader>
          <CardContent><DailySalesChart /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Sales by Payment Mode</CardTitle></CardHeader>
          <CardContent><SalesByPaymentModeChart /></CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={range} onValueChange={(v) => setRange(v as FilterRange)}>
        <TabsList>
          {(["Today", "This Week", "This Month", "Custom"] as const).map((t) => (
            <TabsTrigger key={t} value={t}>{t}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Booking #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Vehicle</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.date}</TableCell>
                  <TableCell className="font-medium">{s.bookingNo}</TableCell>
                  <TableCell>{s.customer}</TableCell>
                  <TableCell className="hidden md:table-cell">{s.vehicle}</TableCell>
                  <TableCell className="text-right font-medium">{fmt(s.amount)}</TableCell>
                  <TableCell><Badge className={statusColor(s.status)}>{s.status}</Badge></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No sales found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
