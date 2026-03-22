"use client";

import * as React from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Upload } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const expenseCategories = [
  "Rent", "Salary", "Utilities", "Marketing", "Maintenance",
  "Office Supplies", "Travel", "Petty Cash", "Other",
];

const departmentList = ["Admin", "Sales", "Service", "Accounts"];

const MONTHLY_BUDGET = 100000;
const CURRENT_SPENT = 71200; // mock

export function AddExpenseDialog({ open, onOpenChange }: Props) {
  const [amount, setAmount] = React.useState(0);
  const [category, setCategory] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0]);

  const wouldExceed = CURRENT_SPENT + amount > MONTHLY_BUDGET;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Amount (₹)</Label>
              <Input type="number" value={amount || ""} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} placeholder="0" />
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Expense description..." rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Branch / City" />
            </div>
            <div className="grid gap-2">
              <Label>Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {departmentList.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Receipt</Label>
              <Button variant="outline" className="w-full gap-2 h-10">
                <Upload className="h-4 w-4" /> Upload Receipt
              </Button>
            </div>
          </div>

          {wouldExceed && amount > 0 && (
            <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg px-3 py-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Budget warning! This expense will exceed the monthly budget of ₹{MONTHLY_BUDGET.toLocaleString("en-IN")}.
              </p>
              <Badge className="bg-yellow-200 text-yellow-800 shrink-0">Over Budget</Badge>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onOpenChange(false)}>Add Expense</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
