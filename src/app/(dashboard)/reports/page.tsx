"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  TrendingUp, ClipboardList, IndianRupee, Receipt, UserCheck,
  Package, Wallet, Wrench, FileDown, BarChart3,
} from "lucide-react";
import {
  ReportRevenueAreaChart,
  ReportSalesBarChart,
  ReportLeadFunnelChart,
  ReportInventoryChart,
} from "@/components/charts/ChartComponents";

interface ReportCard {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const reportCards: ReportCard[] = [
  { title: "Sales Report", description: "Daily, weekly & monthly sales analysis", icon: TrendingUp, color: "text-green-500" },
  { title: "Booking Report", description: "All bookings with status breakdown", icon: ClipboardList, color: "text-blue-500" },
  { title: "Revenue Report", description: "Revenue trends and comparisons", icon: IndianRupee, color: "text-purple-500" },
  { title: "Expense Report", description: "Category-wise expense analysis", icon: Receipt, color: "text-red-500" },
  { title: "Lead Conversion Report", description: "Lead funnel and conversion rates", icon: UserCheck, color: "text-teal-500" },
  { title: "Inventory Report", description: "Stock aging and movement analysis", icon: Package, color: "text-orange-500" },
  { title: "CashFlow Report", description: "Inflow vs outflow summary", icon: Wallet, color: "text-indigo-500" },
  { title: "Service Report", description: "Job cards and service revenue", icon: Wrench, color: "text-yellow-500" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

// Sample report data
const sampleSalesData = [
  { date: "2025-03-20", booking: "BK-010", customer: "Raj Kumar", vehicle: "Honda Activa 6G", amount: 85000, status: "Completed" },
  { date: "2025-03-19", booking: "BK-009", customer: "Priya Singh", vehicle: "TVS Jupiter 125", amount: 78000, status: "Completed" },
  { date: "2025-03-18", booking: "BK-008", customer: "Amit Sharma", vehicle: "Hero Splendor Plus", amount: 72000, status: "Pending" },
  { date: "2025-03-17", booking: "BK-007", customer: "Neha Gupta", vehicle: "Suzuki Access 125", amount: 92000, status: "Completed" },
  { date: "2025-03-16", booking: "BK-006", customer: "Suresh Yadav", vehicle: "Bajaj Pulsar 150", amount: 145000, status: "Completed" },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = React.useState<string | null>(null);
  const [fromDate, setFromDate] = React.useState("2025-03-01");
  const [toDate, setToDate] = React.useState("2025-03-31");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground text-sm">Generate and analyze dealership reports</p>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportCards.map((r) => {
          const Icon = r.icon;
          const isActive = selectedReport === r.title;
          return (
            <Card key={r.title} className={`cursor-pointer transition-all hover:shadow-md ${isActive ? "ring-2 ring-primary" : ""}`} onClick={() => setSelectedReport(r.title)}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Icon className={`h-5 w-5 ${r.color}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-8 text-xs" />
                    <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-8 text-xs" />
                  </div>
                </div>
                <Button size="sm" className="w-full gap-1" variant={isActive ? "default" : "outline"} onClick={(e) => { e.stopPropagation(); setSelectedReport(r.title); }}>
                  <BarChart3 className="h-3 w-3" /> Generate
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report View */}
      {selectedReport && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{selectedReport}</CardTitle>
            <Button variant="outline" size="sm" className="gap-1">
              <FileDown className="h-4 w-4" /> Export
            </Button>
          </CardHeader>
          <CardContent>
            {/* Report Chart */}
            <div className="mb-6 border rounded-lg p-4">
              {selectedReport === "Revenue Report" && <ReportRevenueAreaChart />}
              {selectedReport === "Sales Report" && <ReportSalesBarChart />}
              {selectedReport === "Lead Conversion Report" && <ReportLeadFunnelChart />}
              {selectedReport === "Inventory Report" && <ReportInventoryChart />}
              {selectedReport === "Booking Report" && <ReportSalesBarChart />}
              {selectedReport === "Expense Report" && <ReportRevenueAreaChart />}
              {selectedReport === "CashFlow Report" && <ReportSalesBarChart />}
              {selectedReport === "Service Report" && <ReportRevenueAreaChart />}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Total Records</p>
                <p className="text-xl font-bold">{sampleSalesData.length}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="text-xl font-bold text-green-600">{fmt(sampleSalesData.reduce((s, r) => s + r.amount, 0))}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-xl font-bold text-blue-600">{sampleSalesData.filter((r) => r.status === "Completed").length}</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-950 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold text-yellow-600">{sampleSalesData.filter((r) => r.status === "Pending").length}</p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Booking #</TableHead>
                  <TableHead className="hidden md:table-cell">Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Vehicle</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleSalesData.map((r) => (
                  <TableRow key={r.booking}>
                    <TableCell>{r.date}</TableCell>
                    <TableCell className="font-medium">{r.booking}</TableCell>
                    <TableCell className="hidden md:table-cell">{r.customer}</TableCell>
                    <TableCell className="hidden md:table-cell">{r.vehicle}</TableCell>
                    <TableCell className="text-right">{fmt(r.amount)}</TableCell>
                    <TableCell>
                      <Badge className={r.status === "Completed" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"}>
                        {r.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
