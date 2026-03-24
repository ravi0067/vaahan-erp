"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { TrendingUp, Calendar, IndianRupee, AlertCircle, Download, RefreshCw } from "lucide-react";
import { exportToCSV } from "@/lib/export-csv";
import { DailySalesChart, SalesByPaymentModeChart } from "@/components/charts/ChartComponents";
import { apiGet } from "@/lib/api";
import { toast } from "sonner";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

type FilterRange = "today" | "week" | "month" | "custom";

export default function SalesPage() {
  const [salesData, setSalesData] = React.useState<any>({ bookings: [], totalRevenue: 0, totalSales: 0 });
  const [loading, setLoading] = React.useState(true);
  const [range, setRange] = React.useState<FilterRange>("month");

  const fetchSales = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<any>(`/api/sales?period=${range}`);
      setSalesData(data && typeof data === 'object' && !('error' in data) ? data : { bookings: [], totalRevenue: 0, totalSales: 0 });
    } catch (error) {
      console.error('Failed to fetch sales:', error);
      toast.error('Failed to load sales');
      setSalesData({ bookings: [], totalRevenue: 0, totalSales: 0 });
    } finally {
      setLoading(false);
    }
  }, [range]);

  React.useEffect(() => { fetchSales(); }, [fetchSales]);

  const bookings = salesData.bookings || [];
  const totalRevenue = salesData.totalRevenue || 0;
  const totalSales = salesData.totalSales || 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Card key={i}><CardContent className="p-6"><div className="h-16 bg-muted animate-pulse rounded" /></CardContent></Card>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sales</h1>
          <p className="text-muted-foreground text-sm">Sales overview and collection tracking ({totalSales} deliveries)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchSales} className="gap-1">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(bookings.map((b: any) => ({
              date: new Date(b.updatedAt).toLocaleDateString('en-IN'),
              bookingNo: b.bookingNumber,
              customer: b.customer?.name || '',
              vehicle: b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : '',
              amount: b.totalAmount,
              paid: b.paidAmount,
            })) as unknown as Record<string, unknown>[], "sales", [
              { key: "date", label: "Date" },
              { key: "bookingNo", label: "Booking #" },
              { key: "customer", label: "Customer" },
              { key: "vehicle", label: "Vehicle" },
              { key: "amount", label: "Amount" },
              { key: "paid", label: "Paid" },
            ])}
          >
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalSales}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{fmt(totalRevenue)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Period</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold capitalize">{range}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg per Sale</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalSales > 0 ? fmt(totalRevenue / totalSales) : '₹0'}</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Daily Sales</CardTitle></CardHeader>
          <CardContent><DailySalesChart /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Sales by Payment Mode</CardTitle></CardHeader>
          <CardContent><SalesByPaymentModeChart /></CardContent>
        </Card>
      </div>

      <Tabs value={range} onValueChange={(v) => setRange(v as FilterRange)}>
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
      </Tabs>

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
                <TableHead className="text-right">Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((b: any) => (
                <TableRow key={b.id}>
                  <TableCell>{new Date(b.updatedAt).toLocaleDateString('en-IN')}</TableCell>
                  <TableCell className="font-medium">{b.bookingNumber}</TableCell>
                  <TableCell>{b.customer?.name || '—'}</TableCell>
                  <TableCell className="hidden md:table-cell">{b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : '—'}</TableCell>
                  <TableCell className="text-right font-medium">{fmt(b.totalAmount)}</TableCell>
                  <TableCell className="text-right text-green-600">{fmt(b.paidAmount)}</TableCell>
                </TableRow>
              ))}
              {bookings.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No sales found for this period</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
