"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";

interface BookingInvoiceProps {
  booking: {
    bookingNo: string;
    customer: string;
    vehicle: string;
    amount: number;
    paid: number;
    date: string;
    status: string;
  };
  onClose: () => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export function BookingInvoice({ booking, onClose }: BookingInvoiceProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Action bar - hidden during print */}
        <div className="flex items-center justify-between p-4 border-b print:hidden">
          <h2 className="font-semibold">Invoice Preview</h2>
          <div className="flex gap-2">
            <Button size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Invoice content */}
        <div className="p-8 print:p-4" id="invoice-content">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center print:bg-gray-900">
                  <span className="text-white font-bold text-xl">V</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">Ravi Accounting Services</h1>
                  <p className="text-xs text-muted-foreground">Dealership Management</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5 mt-3">
                <p>Chinhat, Gomti Nagar, Lucknow 226028</p>
                <p>Phone: +91 9554762008</p>
                <p>Email: support@vaahanerp.com</p>
                <p>GST: XXXXXXXXXXXXXXXXX</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-primary">INVOICE</h2>
              <p className="text-sm font-mono mt-1">{booking.bookingNo}</p>
              <p className="text-xs text-muted-foreground mt-1">Date: {booking.date}</p>
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6 print:bg-gray-50">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
              Bill To
            </h3>
            <p className="font-medium">{booking.customer}</p>
            <p className="text-sm text-muted-foreground">Lucknow, Uttar Pradesh</p>
          </div>

          {/* Vehicle Details */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
              Vehicle Details
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 print:bg-gray-100">
                    <th className="text-left p-3 font-medium">Description</th>
                    <th className="text-right p-3 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3">
                      <p className="font-medium">{booking.vehicle}</p>
                      <p className="text-xs text-muted-foreground">Ex-showroom price</p>
                    </td>
                    <td className="p-3 text-right font-medium">{fmt(booking.amount)}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3 text-muted-foreground">Registration & RTO</td>
                    <td className="p-3 text-right">Included</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3 text-muted-foreground">Insurance (1 Year)</td>
                    <td className="p-3 text-right">Included</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t bg-muted/50 print:bg-gray-100">
                    <td className="p-3 font-bold">Total</td>
                    <td className="p-3 text-right font-bold text-lg">{fmt(booking.amount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
              Payment Summary
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3 text-center">
                <p className="text-xs text-green-600">Amount Paid</p>
                <p className="font-bold text-green-700">{fmt(booking.paid)}</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-3 text-center">
                <p className="text-xs text-amber-600">Balance Due</p>
                <p className="font-bold text-amber-700">
                  {fmt(booking.amount - booking.paid)}
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 text-center">
                <p className="text-xs text-blue-600">Status</p>
                <p className="font-bold text-blue-700">{booking.status}</p>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
              Terms & Conditions
            </h3>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Booking amount is non-refundable after vehicle allocation.</li>
              <li>Delivery subject to RTO registration completion.</li>
              <li>Warranty as per manufacturer terms and conditions.</li>
              <li>All disputes subject to Lucknow jurisdiction.</li>
            </ul>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 mt-12">
            <div className="text-center">
              <div className="border-t border-dashed pt-2">
                <p className="text-xs text-muted-foreground">Customer Signature</p>
                <p className="text-sm font-medium mt-1">{booking.customer}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-dashed pt-2">
                <p className="text-xs text-muted-foreground">Authorized Signatory</p>
                <p className="text-sm font-medium mt-1">Ravi Accounting Services</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Thank you for your business! — Powered by Ravi Accounting Services
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
