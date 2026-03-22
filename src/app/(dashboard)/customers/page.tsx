"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, ChevronDown, ChevronRight, Download, Send } from "lucide-react";
import { SendAlertDialog } from "@/components/alerts/SendAlertDialog";
import { Button } from "@/components/ui/button";
import { CustomerDetail, type Customer } from "./components/CustomerDetail";
import { exportToCSV } from "@/lib/export-csv";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const mockCustomers: Customer[] = [
  { id: "1", name: "Raj Kumar", mobile: "9876543210", email: "raj@email.com", address: "123 MG Road, Lucknow", totalBookings: 2, totalPaid: 165000, pending: 10000, bookings: [
    { bookingNo: "BK-001", vehicle: "Honda Activa 6G", date: "2025-01-10", amount: 85000, status: "Delivered" },
    { bookingNo: "BK-008", vehicle: "TVS Ntorq 125", date: "2025-03-15", amount: 90000, status: "Booked" },
  ], payments: [
    { date: "2025-01-10", amount: 25000, mode: "Cash", booking: "BK-001" },
    { date: "2025-01-20", amount: 60000, mode: "Bank Transfer", booking: "BK-001" },
    { date: "2025-03-15", amount: 40000, mode: "UPI", booking: "BK-008" },
    { date: "2025-03-20", amount: 40000, mode: "Cash", booking: "BK-008" },
  ]},
  { id: "2", name: "Priya Singh", mobile: "9876543211", email: "priya@email.com", address: "45 Gomti Nagar, Lucknow", totalBookings: 1, totalPaid: 78000, pending: 0, bookings: [
    { bookingNo: "BK-002", vehicle: "TVS Jupiter 125", date: "2025-02-15", amount: 78000, status: "Delivered" },
  ], payments: [
    { date: "2025-02-15", amount: 30000, mode: "Cash", booking: "BK-002" },
    { date: "2025-02-25", amount: 48000, mode: "UPI", booking: "BK-002" },
  ]},
  { id: "3", name: "Amit Sharma", mobile: "9876543212", email: "amit@email.com", address: "78 Indira Nagar, Lucknow", totalBookings: 1, totalPaid: 50000, pending: 22000, bookings: [
    { bookingNo: "BK-003", vehicle: "Hero Splendor Plus", date: "2025-03-01", amount: 72000, status: "Booked" },
  ], payments: [
    { date: "2025-03-01", amount: 30000, mode: "Cash", booking: "BK-003" },
    { date: "2025-03-10", amount: 20000, mode: "UPI", booking: "BK-003" },
  ]},
  { id: "4", name: "Neha Gupta", mobile: "9876543213", email: "neha@email.com", address: "22 Aliganj, Lucknow", totalBookings: 1, totalPaid: 92000, pending: 0, bookings: [
    { bookingNo: "BK-004", vehicle: "Suzuki Access 125", date: "2025-01-20", amount: 92000, status: "Delivered" },
  ], payments: [
    { date: "2025-01-20", amount: 50000, mode: "Bank Transfer", booking: "BK-004" },
    { date: "2025-02-01", amount: 42000, mode: "Cash", booking: "BK-004" },
  ]},
  { id: "5", name: "Suresh Yadav", mobile: "9876543214", email: "suresh@email.com", address: "99 Mahanagar, Lucknow", totalBookings: 1, totalPaid: 100000, pending: 45000, bookings: [
    { bookingNo: "BK-005", vehicle: "Bajaj Pulsar 150", date: "2025-03-05", amount: 145000, status: "Booked" },
  ], payments: [
    { date: "2025-03-05", amount: 50000, mode: "Cash", booking: "BK-005" },
    { date: "2025-03-15", amount: 50000, mode: "UPI", booking: "BK-005" },
  ]},
];

export default function CustomersPage() {
  const [search, setSearch] = React.useState("");
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [alertCustomer, setAlertCustomer] = React.useState<Customer | null>(null);

  const filtered = mockCustomers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.mobile.includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Customer Ledger</h1>
          <p className="text-muted-foreground text-sm">Customer directory with booking & payment history</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportToCSV(filtered.map(c => ({ name: c.name, mobile: c.mobile, email: c.email, totalBookings: c.totalBookings, totalPaid: c.totalPaid, pending: c.pending })) as unknown as Record<string, unknown>[], "customer-ledger", [
            { key: "name", label: "Name" },
            { key: "mobile", label: "Mobile" },
            { key: "email", label: "Email" },
            { key: "totalBookings", label: "Total Bookings" },
            { key: "totalPaid", label: "Total Paid" },
            { key: "pending", label: "Pending" },
          ])}
        >
          <Download className="h-4 w-4 mr-1" /> Export CSV
        </Button>
      </div>

      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name or mobile..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="text-center">Bookings</TableHead>
                <TableHead className="text-right">Total Paid</TableHead>
                <TableHead className="text-right">Pending</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <React.Fragment key={c.id}>
                  <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                    <TableCell>
                      {expandedId === c.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.mobile}</TableCell>
                    <TableCell className="hidden md:table-cell">{c.email}</TableCell>
                    <TableCell className="text-center">{c.totalBookings}</TableCell>
                    <TableCell className="text-right text-green-600 font-medium">{fmt(c.totalPaid)}</TableCell>
                    <TableCell className="text-right">
                      {c.pending > 0 ? (
                        <span className="text-red-600 font-medium">{fmt(c.pending)}</span>
                      ) : (
                        <span className="text-green-600">Clear ✓</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-blue-600"
                        onClick={(e) => { e.stopPropagation(); setAlertCustomer(c); }}
                        title="Send Alert"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedId === c.id && (
                    <TableRow>
                      <TableCell colSpan={8} className="p-0 bg-muted/30">
                        <CustomerDetail customer={c} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No customers found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {alertCustomer && (
        <SendAlertDialog
          open={!!alertCustomer}
          onClose={() => setAlertCustomer(null)}
          recipient={{
            name: alertCustomer.name,
            mobile: alertCustomer.mobile,
            email: alertCustomer.email,
          }}
          context={{
            bookingId: alertCustomer.bookings[0]?.bookingNo,
            vehicle: alertCustomer.bookings[0]?.vehicle,
            amount: alertCustomer.totalPaid + alertCustomer.pending,
            remaining: alertCustomer.pending,
          }}
        />
      )}
    </div>
  );
}
