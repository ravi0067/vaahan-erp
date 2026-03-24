"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AddTransactionDialog, type Transaction,
} from "./components/AddTransactionDialog";
import { DaybookLock } from "./components/DaybookLock";
import {
  ArrowDownCircle, ArrowUpCircle, Wallet, TrendingUp, ChevronLeft, ChevronRight, RefreshCw,
} from "lucide-react";
import { CashFlowChart } from "@/components/charts/ChartComponents";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";

const formatCurrency = (amt: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amt);

export default function CashFlowPage() {
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [daybook, setDaybook] = React.useState<any>(null);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const raw = await apiGet<any>(`/api/cashflow/daybook?date=${selectedDate}`);
      const data = raw && typeof raw === 'object' && !('error' in raw) ? raw : null;
      setDaybook(data);
      // Map API transactions to display format
      const txns: Transaction[] = (data?.transactions || []).map((t: any) => ({
        id: t.id,
        time: new Date(t.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        type: t.type === 'INFLOW' ? 'Inflow' : 'Outflow',
        category: t.category,
        description: t.description || '',
        amount: t.amount,
        mode: t.mode || 'Cash',
        reference: t.reference || '',
      }));
      setTransactions(txns);
    } catch (error) {
      console.error('Failed to fetch daybook:', error);
      toast.error('Failed to load daybook');
      setDaybook(null);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const openingBalance = daybook ? daybook.openingBalance : 0;
  const closingBalance = daybook ? daybook.closingBalance : 0;
  const isLocked = daybook?.isLocked || false;

  const totalInflow = transactions.filter((t) => t.type === "Inflow").reduce((sum, t) => sum + t.amount, 0);
  const totalOutflow = transactions.filter((t) => t.type === "Outflow").reduce((sum, t) => sum + t.amount, 0);

  const handleAddTransaction = async (txn: Transaction) => {
    try {
      await apiPost('/api/cashflow/transactions', {
        type: txn.type === 'Inflow' ? 'INFLOW' : 'OUTFLOW',
        category: txn.category,
        description: txn.description,
        amount: txn.amount,
        mode: txn.mode,
        reference: txn.reference,
        date: selectedDate,
      });
      toast.success('Transaction added!');
      fetchData();
    } catch (error) {
      toast.error('Failed to add transaction');
    }
  };

  const handleLock = async () => {
    try {
      await apiPost('/api/cashflow/daybook/lock', { date: selectedDate });
      toast.success('Daybook locked for today');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to lock daybook');
    }
  };

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-16 bg-muted animate-pulse rounded" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CashFlow & Daybook</h1>
          <p className="text-muted-foreground">Daily cash tracking and reconciliation</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => changeDate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-[160px]" />
          <Button variant="outline" size="icon" onClick={() => changeDate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-1">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Opening Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(openingBalance)}</div></CardContent>
        </Card>
        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Inflow</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-700">{formatCurrency(totalInflow)}</div></CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Total Outflow</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-700">{formatCurrency(totalOutflow)}</div></CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Closing Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-700">{formatCurrency(closingBalance)}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Daily Cash Flow (Last 7 Days)</CardTitle></CardHeader>
        <CardContent><CashFlowChart /></CardContent>
      </Card>

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
                  <TableCell className="hidden md:table-cell text-muted-foreground">{txn.description}</TableCell>
                  <TableCell className={`text-right font-semibold ${txn.type === "Inflow" ? "text-green-700" : "text-red-700"}`}>
                    {txn.type === "Inflow" ? "+" : "-"}{formatCurrency(txn.amount)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell"><Badge variant="outline">{txn.mode}</Badge></TableCell>
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

      <DaybookLock systemClosingBalance={closingBalance} isLocked={isLocked} onLock={handleLock} />
    </div>
  );
}
