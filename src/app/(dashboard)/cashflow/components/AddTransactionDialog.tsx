"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
export interface Transaction {
  id: string;
  time: string;
  type: "Inflow" | "Outflow";
  category: string;
  description: string;
  amount: number;
  mode: string;
  reference: string;
}

// ── Category lists ─────────────────────────────────────────────────────────
const inflowCategories = [
  "Sale Payment",
  "Advance",
  "EMI Received",
  "Insurance Commission",
  "Accessory Sale",
  "Other Income",
];

const outflowCategories = [
  "Vendor Payment",
  "Salary",
  "Petty Cash",
  "Rent",
  "Utility",
  "RTO Charges",
  "Other Expense",
];

const paymentModes = ["Cash", "UPI", "NEFT", "Bank Transfer"];

interface AddTransactionDialogProps {
  onAdd: (txn: Transaction) => void;
}

export function AddTransactionDialog({ onAdd }: AddTransactionDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState<"Inflow" | "Outflow">("Inflow");
  const [category, setCategory] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [mode, setMode] = React.useState("");
  const [reference, setReference] = React.useState("");

  const categories = type === "Inflow" ? inflowCategories : outflowCategories;

  const handleSubmit = () => {
    if (!category || !amount || !mode) return;

    const txn: Transaction = {
      id: crypto.randomUUID(),
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      type,
      category,
      description,
      amount: parseFloat(amount),
      mode,
      reference,
    };

    onAdd(txn);
    // Reset form
    setType("Inflow");
    setCategory("");
    setDescription("");
    setAmount("");
    setMode("");
    setReference("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Type Toggle */}
          <div className="grid gap-2">
            <Label>Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === "Inflow" ? "default" : "outline"}
                className="flex-1"
                onClick={() => { setType("Inflow"); setCategory(""); }}
              >
                ↓ Inflow
              </Button>
              <Button
                type="button"
                variant={type === "Outflow" ? "destructive" : "outline"}
                className="flex-1"
                onClick={() => { setType("Outflow"); setCategory(""); }}
              >
                ↑ Outflow
              </Button>
            </div>
          </div>

          {/* Category */}
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Enter description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Amount */}
          <div className="grid gap-2">
            <Label>Amount (₹)</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Payment Mode */}
          <div className="grid gap-2">
            <Label>Payment Mode</Label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                {paymentModes.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reference */}
          <div className="grid gap-2">
            <Label>Reference</Label>
            <Input
              placeholder="Transaction ID / Receipt No."
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!category || !amount || !mode}>
            Add Transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
