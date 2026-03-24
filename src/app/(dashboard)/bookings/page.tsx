"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Printer, Download, CreditCard, Send, RefreshCw } from "lucide-react";
import { BookingInvoice } from "./components/BookingInvoice";
import { OnlinePaymentDialog } from "./components/OnlinePaymentDialog";
import { SendAlertDialog } from "@/components/alerts/SendAlertDialog";
import { exportToCSV } from "@/lib/export-csv";
import { apiGet } from "@/lib/api";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────
type BookingStatus = "DRAFT" | "CONFIRMED" | "RTO_PENDING" | "READY" | "DELIVERED" | "CANCELLED";

interface BookingData {
  id: string;
  bookingNumber: string;
  status: BookingStatus;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  createdAt: string;
  customer: { id: string; name: string; mobile: string; email?: string };
  vehicle?: { id: string; model: string; brand: string };
  salesExec?: { id: string; name: string };
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const formatCurrency = (amt: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amt);

const statusColor: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700 border-gray-300",
  CONFIRMED: "bg-blue-100 text-blue-700 border-blue-300",
  RTO_PENDING: "bg-amber-100 text-amber-700 border-amber-300",
  READY: "bg-purple-100 text-purple-700 border-purple-300",
  DELIVERED: "bg-green-100 text-green-700 border-green-300",
  CANCELLED: "bg-red-100 text-red-700 border-red-300",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  CONFIRMED: "Confirmed",
  RTO_PENDING: "RTO Pending",
  READY: "Ready",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

// ── Page ────────────────────────────────────────────────────────────────────
export default function BookingsPage() {
  const [bookings, setBookings] = React.useState<BookingData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [tab, setTab] = React.useState("All");
  const [invoiceBooking, setInvoiceBooking] = React.useState<any>(null);
  const [paymentBooking, setPaymentBooking] = React.useState<any>(null);
  const [alertBooking, setAlertBooking] = React.useState<BookingData | null>(null);

  const fetchBookings = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<BookingData[]>('/api/bookings');
      setBookings(data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const filtered = bookings.filter((b) => {
    const matchesTab = tab === "All" || b.status === tab;
    const matchesSearch =
      !search ||
      b.bookingNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.customer?.name.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Convert to format expected by BookingInvoice/PaymentDialog
  const toDisplayBooking = (b: BookingData) => ({
    id: b.id,
    bookingNo: b.bookingNumber,
    customer: b.customer?.name || 'N/A',
    vehicle: b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : 'N/A',
    status: statusLabels[b.status] || b.status,
    amount: b.totalAmount,
    paid: b.paidAmount,
    date: new Date(b.createdAt).toLocaleDateString('en-IN'),
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <Card><CardContent className="p-6"><div className="h-64 bg-muted animate-pulse rounded" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">Manage all vehicle bookings ({bookings.length} total)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchBookings} className="gap-1">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(filtered.map(toDisplayBooking) as unknown as Record<string, unknown>[], "bookings", [
              { key: "bookingNo", label: "Booking #" },
              { key: "customer", label: "Customer" },
              { key: "vehicle", label: "Vehicle" },
              { key: "status", label: "Status" },
              { key: "amount", label: "Amount" },
              { key: "paid", label: "Paid" },
              { key: "date", label: "Date" },
            ])}
          >
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
          <Link href="/bookings/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Booking
            </Button>
          </Link>
        </div>
      </div>

      {/* Search + Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by booking # or customer name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex-wrap">
              {["All", "DRAFT", "CONFIRMED", "RTO_PENDING", "READY", "DELIVERED"].map((t) => (
                <TabsTrigger key={t} value={t} className="text-xs sm:text-sm">
                  {t === "All" ? "All" : statusLabels[t] || t}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={tab}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">Paid</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">Pending</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((b) => (
                    <TableRow key={b.id} className="cursor-pointer">
                      <TableCell className="font-mono font-semibold">{b.bookingNumber}</TableCell>
                      <TableCell>{b.customer?.name || 'N/A'}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColor[b.status] || ""}>
                          {statusLabels[b.status] || b.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(b.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell text-green-700">
                        {formatCurrency(b.paidAmount)}
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell text-amber-700">
                        {formatCurrency(b.pendingAmount)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {new Date(b.createdAt).toLocaleDateString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-0.5">
                          {b.pendingAmount > 0 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-green-600"
                              onClick={() => setPaymentBooking(toDisplayBooking(b))}
                              title="Collect Payment"
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-blue-600"
                            onClick={() => setAlertBooking(b)}
                            title="Send Alert"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => setInvoiceBooking(toDisplayBooking(b))}
                            title="Print Invoice"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        No bookings found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {invoiceBooking && (
        <BookingInvoice
          booking={invoiceBooking}
          onClose={() => setInvoiceBooking(null)}
        />
      )}

      {paymentBooking && (
        <OnlinePaymentDialog
          open={!!paymentBooking}
          onClose={() => setPaymentBooking(null)}
          booking={paymentBooking}
        />
      )}

      {alertBooking && (
        <SendAlertDialog
          open={!!alertBooking}
          onClose={() => setAlertBooking(null)}
          recipient={{
            name: alertBooking.customer?.name || 'N/A',
            mobile: alertBooking.customer?.mobile || '',
            email: alertBooking.customer?.email || '',
          }}
          context={{
            bookingId: alertBooking.bookingNumber,
            vehicle: alertBooking.vehicle ? `${alertBooking.vehicle.brand} ${alertBooking.vehicle.model}` : '',
            amount: alertBooking.totalAmount,
            remaining: alertBooking.pendingAmount,
          }}
        />
      )}
    </div>
  );
}
