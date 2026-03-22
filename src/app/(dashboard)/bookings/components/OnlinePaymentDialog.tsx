"use client";

import * as React from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, QrCode, CheckCircle2, XCircle, IndianRupee } from "lucide-react";

const formatCurrency = (amt: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amt);

interface OnlinePaymentDialogProps {
  open: boolean;
  onClose: () => void;
  booking: {
    bookingNo: string;
    customer: string;
    vehicle: string;
    amount: number;
    paid: number;
  };
}

type PaymentStatus = "idle" | "processing" | "success" | "failed";

export function OnlinePaymentDialog({ open, onClose, booking }: OnlinePaymentDialogProps) {
  const pending = booking.amount - booking.paid;
  const [paymentAmount, setPaymentAmount] = React.useState(pending.toString());
  const [status, setStatus] = React.useState<PaymentStatus>("idle");
  const [txnId, setTxnId] = React.useState("");

  const handlePayRazorpay = () => {
    setStatus("processing");
    // Mock Razorpay checkout
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate for demo
      if (success) {
        const id = `txn_${Date.now().toString(36).toUpperCase()}`;
        setTxnId(id);
        setStatus("success");
      } else {
        setStatus("failed");
      }
    }, 2000);
  };

  const handleClose = () => {
    setStatus("idle");
    setTxnId("");
    setPaymentAmount(pending.toString());
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Collect Online Payment
          </DialogTitle>
        </DialogHeader>

        {status === "success" ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-green-700">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {formatCurrency(Number(paymentAmount))} received for {booking.bookingNo}
              </p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-sm">
              <p className="text-muted-foreground">Transaction ID</p>
              <p className="font-mono font-semibold">{txnId}</p>
            </div>
            <Button onClick={handleClose} className="w-full">Done</Button>
          </div>
        ) : status === "failed" ? (
          <div className="text-center py-6 space-y-4">
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-red-700">Payment Failed</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Transaction could not be completed. Please try again.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
              <Button onClick={() => setStatus("idle")} className="flex-1">Retry</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Booking Details */}
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Booking</span>
                <span className="font-mono font-semibold">{booking.bookingNo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Customer</span>
                <span>{booking.customer}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vehicle</span>
                <span>{booking.vehicle}</span>
              </div>
              <div className="border-t my-2" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-semibold">{formatCurrency(booking.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Already Paid</span>
                <span className="text-green-600">{formatCurrency(booking.paid)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span>Pending</span>
                <span className="text-amber-600">{formatCurrency(pending)}</span>
              </div>
            </div>

            {/* Payment Amount */}
            <div className="grid gap-2">
              <Label>Payment Amount</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="pl-9"
                  max={pending}
                  min={1}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setPaymentAmount(pending.toString())}
                >
                  Full Amount
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setPaymentAmount(Math.floor(pending / 2).toString())}
                >
                  50%
                </Button>
              </div>
            </div>

            {/* Pay Button */}
            <Button
              className="w-full h-12 text-base"
              onClick={handlePayRazorpay}
              disabled={status === "processing" || !paymentAmount || Number(paymentAmount) <= 0}
            >
              {status === "processing" ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Pay {formatCurrency(Number(paymentAmount) || 0)} with Razorpay
                </>
              )}
            </Button>

            {/* UPI QR */}
            <div className="border rounded-lg p-4 text-center space-y-2">
              <QrCode className="h-24 w-24 mx-auto text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground">
                UPI QR Code — Configure UPI ID in Settings
              </p>
              <Badge variant="outline" className="text-xs">Scan & Pay via UPI</Badge>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
