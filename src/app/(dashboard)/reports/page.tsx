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
  Package, Wallet, Wrench, FileDown, BarChart3, Loader2,
} from "lucide-react";
import {
  ReportRevenueAreaChart, ReportSalesBarChart, ReportLeadFunnelChart, ReportInventoryChart,
} from "@/components/charts/ChartComponents";
import { apiGet } from "@/lib/api";
import { toast } from "sonner";

interface ReportCard {
  title: string;
  type: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const reportCards: ReportCard[] = [
  { title: "Sales Report", type: "sales", description: "Daily, weekly & monthly sales analysis", icon: TrendingUp, color: "text-green-500" },
  { title: "Revenue Report", type: "revenue", description: "Revenue trends and comparisons", icon: IndianRupee, color: "text-purple-500" },
  { title: "Lead Report", type: "leads", description: "Lead funnel and conversion rates", icon: UserCheck, color: "text-teal-500" },
  { title: "Inventory Report", type: "inventory", description: "Stock aging and movement analysis", icon: Package, color: "text-orange-500" },
  { title: "Expense Report", type: "expenses", description: "Category-wise expense analysis", icon: Receipt, color: "text-red-500" },
  { title: "CashFlow Report", type: "cashflow", description: "Inflow vs outflow summary", icon: Wallet, color: "text-indigo-500" },
  { title: "Service Report", type: "service", description: "Job cards and service revenue", icon: Wrench, color: "text-yellow-500" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = React.useState<string | null>(null);
  const [selectedType, setSelectedType] = React.useState<string | null>(null);
  const [fromDate, setFromDate] = React.useState("2025-03-01");
  const [toDate, setToDate] = React.useState("2025-03-31");
  const [reportData, setReportData] = React.useState<any>(null);
  const [generating, setGenerating] = React.useState(false);

  const generateReport = async (type: string, title: string) => {
    setGenerating(true);
    setSelectedReport(title);
    setSelectedType(type);
    try {
      const data = await apiGet<any>(`/api/reports?type=${type}&from=${fromDate}&to=${toDate}`);
      setReportData(data);
      toast.success(`${title} generated!`);
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report');
      setReportData(null);
    } finally {
      setGenerating(false);
    }
  };

  const records = reportData?.data || [];
  const totalAmount = reportData?.total || records.reduce((s: number, r: any) => s + (r.totalAmount || r.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground text-sm">Generate and analyze dealership reports</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportCards.map((r) => {
          const Icon = r.icon;
          const isActive = selectedReport === r.title;
          return (
            <Card key={r.title} className={`cursor-pointer transition-all hover:shadow-md ${isActive ? "ring-2 ring-primary" : ""}`} onClick={() => { setSelectedReport(r.title); setSelectedType(r.type); }}>
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
                <div className="grid grid-cols-2 gap-2">
                  <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-8 text-xs" />
                  <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-8 text-xs" />
                </div>
                <Button size="sm" className="w-full gap-1" variant={isActive ? "default" : "outline"} onClick={(e) => { e.stopPropagation(); generateReport(r.type, r.title); }} disabled={generating}>
                  {generating && selectedReport === r.title ? <Loader2 className="h-3 w-3 animate-spin" /> : <BarChart3 className="h-3 w-3" />} Generate
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedReport && reportData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{selectedReport}</CardTitle>
            <Button variant="outline" size="sm" className="gap-1">
              <FileDown className="h-4 w-4" /> Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-6 border rounded-lg p-4">
              {selectedType === "revenue" && <ReportRevenueAreaChart />}
              {selectedType === "sales" && <ReportSalesBarChart />}
              {selectedType === "leads" && <ReportLeadFunnelChart />}
              {selectedType === "inventory" && <ReportInventoryChart />}
              {selectedType === "expenses" && <ReportRevenueAreaChart />}
              {selectedType === "cashflow" && <ReportSalesBarChart />}
              {selectedType === "service" && <ReportRevenueAreaChart />}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Total Records</p>
                <p className="text-xl font-bold">{records.length}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="text-xl font-bold text-green-600">{fmt(totalAmount)}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Date Range</p>
                <p className="text-sm font-medium">{fromDate} to {toDate}</p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.slice(0, 20).map((r: any, idx: number) => (
                  <TableRow key={r.id || idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium">
                      {r.bookingNumber || r.customerName || r.model || r.category || r.description || r.vehicleRegNo || `Record ${idx + 1}`}
                    </TableCell>
                    <TableCell className="text-right">{fmt(r.totalAmount || r.amount || r.totalBilled || 0)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {r.status || r.dealHealth || r.type || '—'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {records.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No data for this period</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
