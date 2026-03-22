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
import { Plus, Search, Printer, Download } from "lucide-react";
import { BookingInvoice } from "./components/BookingInvoice";
import { exportToCSV } from "@/lib/export-csv";

// ── Types ──────────────────────────────────────────────────────────────────
type BookingStatus = "Draft" | "Confirmed" | "RTO Pending" | "Ready" | "Delivered";

interface Booking {
  id: string;
  bookingNo: string;
  customer: string;
  vehicle: string;
  status: BookingStatus;
  amount: number;
  paid: number;
  date: string;
}

// ── Mock data ──────────────────────────────────────────────────────────────
const mockBookings: Booking[] = [
  { id: "1", bookingNo: "BK-2024-001", customer: "Raj Kumar", vehicle: "Honda Activa 6G", status: "Delivered", amount: 78000, paid: 78000, date: "2024-03-15" },
  { id: "2", bookingNo: "BK-2024-002", customer: "Priya Singh", vehicle: "Honda SP 125", status: "Confirmed", amount: 92000, paid: 50000, date: "2024-03-18" },
  { id: "3", bookingNo: "BK-2024-003", customer: "Suresh Yadav", vehicle: "Honda Shine", status: "RTO Pending", amount: 82000, paid: 82000, date: "2024-03-20" },
  { id: "4", bookingNo: "BK-2024-004", customer: "Anita Sharma", vehicle: "Honda Unicorn", status: "Draft", amount: 105000, paid: 10000, date: "2024-03-21" },
  { id: "5", bookingNo: "BK-2024-005", customer: "Vikram Patel", vehicle: "Honda Activa 6G", status: "Ready", amount: 85000, paid: 85000, date: "2024-03-22" },
  { id: "6", bookingNo: "BK-2024-006", customer: "Meena Devi", vehicle: "Honda SP 125", status: "Confirmed", amount: 96000, paid: 30000, date: "2024-03-22" },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
const formatCurrency = (amt: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amt);

const statusColor: Record<BookingStatus, string> = {
  Draft: "bg-gray-100 text-gray-700 border-gray-300",
  Confirmed: "bg-blue-100 text-blue-700 border-blue-300",
  "RTO Pending": "bg-amber-100 text-amber-700 border-amber-300",
  Ready: "bg-purple-100 text-purple-700 border-purple-300",
  Delivered: "bg-green-100 text-green-700 border-green-300",
};

// ── Page ────────────────────────────────────────────────────────────────────
export default function BookingsPage() {
  const [search, setSearch] = React.useState("");
  const [tab, setTab] = React.useState("All");
  const [invoiceBooking, setInvoiceBooking] = React.useState<Booking | null>(null);

  const filtered = mockBookings.filter((b) => {
    const matchesTab = tab === "All" || b.status === tab;
    const matchesSearch =
      !search ||
      b.bookingNo.toLowerCase().includes(search.toLowerCase()) ||
      b.customer.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">Manage all vehicle bookings</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(filtered as unknown as Record<string, unknown>[], "bookings", [
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
              {["All", "Draft", "Confirmed", "RTO Pending", "Ready", "Delivered"].map((t) => (
                <TabsTrigger key={t} value={t} className="text-xs sm:text-sm">
                  {t}
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
                      <TableCell className="font-mono font-semibold">{b.bookingNo}</TableCell>
                      <TableCell>{b.customer}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {b.vehicle}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColor[b.status]}>
                          {b.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(b.amount)}
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell text-green-700">
                        {formatCurrency(b.paid)}
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell text-amber-700">
                        {formatCurrency(b.amount - b.paid)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {b.date}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => setInvoiceBooking(b)}
                          title="Print Invoice"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </Button>
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
    </div>
  );
}
