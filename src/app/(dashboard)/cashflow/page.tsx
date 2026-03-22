"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AddTransactionDialog,
  type Transaction,
} from "./components/AddTransactionDialog";
import { DaybookLock } from "./components/DaybookLock";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CashFlowChart } from "@/components/charts/ChartComponents";

// ── Mock data ──────────────────────────────────────────────────────────────
const mockTransactions: Transaction[] = [
  { id: "1", time: "09:15", type: "Inflow", category: "Sale Payment", description: "Honda Activa 6G - Raj Kumar", amount: 45000, mode: "Cash", reference: "RCP-001" },
  { id: "2", time: "10:30", type: "Inflow", category: "Advance", description: "Booking advance - Priya Singh", amount: 10000, mode: "UPI", reference: "UPI-8821" },
  { id: "3", time: "11:00", type: "Outflow", category: "Vendor Payment", description: "Spare parts - Mehta Auto", amount: 12500, mode: "NEFT", reference: "NEFT-4401" },
  { id: "4", time: "12:45", type: "Inflow", category: "EMI Received", description: "EMI - Suresh Yadav", amount: 3500, mode: "Bank Transfer", reference: "BNK-220" },
  { id: "5", time: "14:00", type: "Outflow", category: "Petty Cash", description: "Office supplies & tea", amount: 850, mode: "Cash", reference: "PC-045" },
  { id: "6", time: "15:30", type: "Outflow", category: "Salary", description: "Part salary - Amit (mechanic)", amount: 5000, mode: "Cash", reference: "SAL-012" },
  { id: "7", time: "16:15", type: "Inflow", category: "Accessory Sale", description: "Helmet & lock set", amount: 2200, mode: "Cash", reference: "ACC-078" },
];

const OPENING_BALANCE = 125000;

// ── Helper ─────────────────────────────────────────────────────────────────
const formatCurrency = (amt: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amt);

// ── Page Component ─────────────────────────────────────────────────────────
export default function CashFlowPage() {
  const [selectedDate, setSelectedDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [transactions, setTransactions] = React.useState<Transaction[]>(mockTransactions);
  const [isLocked, setIsLocked] = React.useState(false);

  // Calculations
  const totalInflow = transactions
    .filter((t) => t.type === "Inflow")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalOutflow = transactions
    .filter((t) => t.type === "Outflow")
    .reduce((sum, t) => sum + t.amount, 0);
  const closingBalance = OPENING_BALANCE + totalInflow - totalOutflow;

  const handleAddTransaction = (txn: Transaction) => {
    setTransactions((prev) => [...prev, txn]);
  };

  const handleLock = () => {
    setIsLocked(true);
  };

  // Navigate dates
  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CashFlow & Daybook</h1>
          <p className="text-muted-foreground">Daily cash tracking and reconciliation</p>
        </div>

        {/* Date Picker */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => changeDate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-[160px]"
          />
          <Button variant="outline" size="icon" onClick={() => changeDate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Opening Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(OPENING_BALANCE)}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Inflow</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{formatCurrency(totalInflow)}</div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Total Outflow</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{formatCurrency(totalOutflow)}</div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Closing Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{formatCurrency(closingBalance)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Chart */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Daily Cash Flow (Last 7 Days)</CardTitle></CardHeader>
        <CardContent><CashFlowChart /></CardContent>
      </Card>

      {/* Transaction Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transactions</CardTitle>
          {!isLocked && <AddTransactionDialog onAdd={handleAddTransaction} />}
          {isLocked && (
            <Badge variant="outline" className="text-amber-700 border-amber-300">
              🔒 Day Locked — Read Only
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="hidden sm:table-cell">Mode</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="font-mono text-sm">{txn.time}</TableCell>
                  <TableCell>
                    <Badge variant={txn.type === "Inflow" ? "default" : "destructive"}>
                      {txn.type === "Inflow" ? "↓" : "↑"} {txn.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{txn.category}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {txn.description}
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold ${
                      txn.type === "Inflow" ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {txn.type === "Inflow" ? "+" : "-"}
                    {formatCurrency(txn.amount)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline">{txn.mode}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No transactions yet. Click &quot;Add Transaction&quot; to begin.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Daybook Lock */}
      <DaybookLock
        systemClosingBalance={closingBalance}
        isLocked={isLocked}
        onLock={handleLock}
      />
    </div>
  );
}
