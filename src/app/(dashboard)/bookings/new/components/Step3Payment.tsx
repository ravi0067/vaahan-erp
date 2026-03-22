"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBookingWizardStore, type PaymentEntry } from "@/store/booking-wizard-store";
import { Plus, Trash2, IndianRupee } from "lucide-react";

const paymentModes = ["Cash", "UPI", "NEFT", "Bank Transfer", "Loan"] as const;

const formatCurrency = (amt: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amt);

export function Step3Payment() {
  const { vehicle, payments, addPayment, removePayment, nextStep } = useBookingWizardStore();
  const [amount, setAmount] = React.useState("");
  const [mode, setMode] = React.useState<string>("");
  const [reference, setReference] = React.useState("");

  const totalAmount = vehicle?.price || 0;
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const pending = totalAmount - totalPaid;

  const handleAdd = () => {
    if (!amount || !mode) return;
    const entry: PaymentEntry = {
      id: crypto.randomUUID(),
      amount: parseFloat(amount),
      mode: mode as PaymentEntry["mode"],
      reference,
      date: new Date().toISOString().split("T")[0],
    };
    addPayment(entry);
    setAmount("");
    setMode("");
    setReference("");
  };

  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-xl font-bold">{formatCurrency(totalAmount)}</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-green-700">Paid</p>
            <p className="text-xl font-bold text-green-700">{formatCurrency(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card className={pending > 0 ? "border-amber-200" : "border-green-200"}>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-amber-700">Pending</p>
            <p className="text-xl font-bold text-amber-700">{formatCurrency(pending)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" /> Add Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4 items-end">
            <div className="grid gap-2">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Mode</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  {paymentModes.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Reference</Label>
              <Input
                placeholder="Txn ID / Receipt"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
            <Button onClick={handleAdd} disabled={!amount || !mode}>
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No payments added yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p, idx) => (
                  <TableRow key={p.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{p.date}</TableCell>
                    <TableCell className="font-semibold text-green-700">
                      {formatCurrency(p.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.mode}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.reference}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                        onClick={() => removePayment(p.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Button onClick={nextStep} className="w-full sm:w-auto">
        Continue to Finance →
      </Button>
    </div>
  );
}
