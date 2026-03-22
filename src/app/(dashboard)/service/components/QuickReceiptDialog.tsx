"use client";

import * as React from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { IndianRupee, CheckCircle2 } from "lucide-react";
import type { JobCard } from "./JobCardDialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobCard;
}

interface PaymentEntry {
  date: string;
  amount: number;
  mode: string;
}

const mockPayments: PaymentEntry[] = [
  { date: "2025-03-01", amount: 500, mode: "Cash" },
  { date: "2025-03-05", amount: 500, mode: "UPI" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export function QuickReceiptDialog({ open, onOpenChange, job }: Props) {
  const [amount, setAmount] = React.useState(0);
  const [mode, setMode] = React.useState("Cash");

  React.useEffect(() => {
    setAmount(job.pending);
  }, [job, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Receipt — {job.jobNo}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Total Billed</p>
              <p className="font-bold">{fmt(job.totalBilled)}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Received</p>
              <p className="font-bold text-green-600">{fmt(job.received)}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-950 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="font-bold text-red-600">{fmt(job.pending)}</p>
            </div>
          </div>

          <Separator />

          {/* Payment Input */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Payment Amount (₹)</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="grid gap-2">
              <Label>Payment Mode</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Cash", "UPI", "Bank Transfer", "Card", "Cheque"].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full gap-2">
              <IndianRupee className="h-4 w-4" /> Receive Payment
            </Button>
          </div>

          <Separator />

          {/* Payment History */}
          <div>
            <p className="text-sm font-medium mb-2">Payment History</p>
            <div className="space-y-2">
              {mockPayments.map((p, i) => (
                <div key={i} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">{fmt(p.amount)}</p>
                      <p className="text-xs text-muted-foreground">{p.date}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{p.mode}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
