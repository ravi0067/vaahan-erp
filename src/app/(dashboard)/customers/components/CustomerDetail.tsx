"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { User, Phone, Mail, MapPin, CheckCircle2 } from "lucide-react";

export interface CustomerBooking {
  bookingNo: string;
  vehicle: string;
  date: string;
  amount: number;
  status: string;
}

export interface CustomerPayment {
  date: string;
  amount: number;
  mode: string;
  booking: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  totalBookings: number;
  totalPaid: number;
  pending: number;
  bookings: CustomerBooking[];
  payments: CustomerPayment[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const statusColor = (s: string) => {
  switch (s) {
    case "Delivered": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    case "Booked": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
    case "Cancelled": return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
    default: return "";
  }
};

export function CustomerDetail({ customer }: { customer: Customer }) {
  const totalBusiness = customer.bookings.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="p-4 space-y-4">
      {/* Customer Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> {customer.name}</div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {customer.mobile}</div>
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {customer.email}</div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {customer.address}</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Booking History */}
        <Card>
          <CardContent className="p-4">
            <p className="font-medium mb-2">Booking History</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking #</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.bookings.map((b) => (
                  <TableRow key={b.bookingNo}>
                    <TableCell className="font-medium">{b.bookingNo}</TableCell>
                    <TableCell>{b.vehicle}</TableCell>
                    <TableCell className="text-right">{fmt(b.amount)}</TableCell>
                    <TableCell><Badge className={statusColor(b.status)}>{b.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Payment Timeline */}
        <Card>
          <CardContent className="p-4">
            <p className="font-medium mb-2">Payment Timeline</p>
            <div className="space-y-2">
              {customer.payments.map((p, i) => (
                <div key={i} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{fmt(p.amount)}</p>
                      <p className="text-xs text-muted-foreground">{p.date} • {p.booking}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{p.mode}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Total Business</p>
          <p className="font-bold text-blue-600">{fmt(totalBusiness)}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Total Paid</p>
          <p className="font-bold text-green-600">{fmt(customer.totalPaid)}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-950 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Outstanding</p>
          <p className="font-bold text-red-600">{fmt(customer.pending)}</p>
        </div>
      </div>
    </div>
  );
}
