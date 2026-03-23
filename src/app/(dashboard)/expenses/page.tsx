"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Receipt, TrendingDown, PieChart, Plus, Download, RefreshCw } from "lucide-react";
import { AddExpenseDialog } from "./components/AddExpenseDialog";
import { exportToCSV } from "@/lib/export-csv";
import { ExpenseCategoryChart, MonthlyExpenseTrendChart } from "@/components/charts/ChartComponents";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

interface ExpenseData {
  id: string;
  date: string;
  category: string;
  description?: string;
  location?: string;
  department?: string;
  amount: number;
  receiptUrl?: string;
  approvedBy?: { id: string; name: string };
}

const categories = ["all", "Rent", "Salary", "Utilities", "Marketing", "Maintenance", "Office Supplies", "Travel", "Petty Cash", "Other"];
const departments = ["all", "Admin", "Sales", "Service"];

const catColor = (c: string) => {
  const colors: Record<string, string> = {
    Rent: "bg-purple-100 text-purple-700",
    Salary: "bg-blue-100 text-blue-700",
    Utilities: "bg-yellow-100 text-yellow-700",
    Marketing: "bg-pink-100 text-pink-700",
    Maintenance: "bg-orange-100 text-orange-700",
    "Office Supplies": "bg-teal-100 text-teal-700",
    Travel: "bg-indigo-100 text-indigo-700",
    "Petty Cash": "bg-gray-100 text-gray-700",
  };
  return colors[c] || "";
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = React.useState<ExpenseData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [catFilter, setCatFilter] = React.useState("all");
  const [deptFilter, setDeptFilter] = React.useState("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const fetchExpenses = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (catFilter !== 'all') params.set('category', catFilter);
      if (deptFilter !== 'all') params.set('department', deptFilter);
      const data = await apiGet<ExpenseData[]>(`/api/expenses?${params}`);
      setExpenses(data);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [catFilter, deptFilter]);

  React.useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const monthlyBudget = 100000;
  const budgetPct = Math.round((totalExpenses / monthlyBudget) * 100);
  const topCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);
  const topCat = Object.entries(topCategory).sort((a, b) => b[1] - a[1])[0];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Card key={i}><CardContent className="p-6"><div className="h-16 bg-muted animate-pulse rounded" /></CardContent></Card>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Expenses</h1>
          <p className="text-muted-foreground text-sm">Track and manage dealership expenses ({expenses.length} entries)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchExpenses} className="gap-1">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={() => exportToCSV(expenses as unknown as Record<string, unknown>[], "expenses", [
              { key: "date", label: "Date" },
              { key: "category", label: "Category" },
              { key: "description", label: "Description" },
              { key: "amount", label: "Amount" },
            ])}
          >
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Expense
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{fmt(totalExpenses)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
            <PieChart className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetPct}%</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div className={`h-2 rounded-full ${budgetPct > 90 ? "bg-red-500" : budgetPct > 70 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${Math.min(budgetPct, 100)}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <Receipt className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topCat?.[0] || '—'}</div>
            <p className="text-xs text-muted-foreground">{fmt(topCat?.[1] ?? 0)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.filter(c => c !== 'all').map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.filter(d => d !== 'all').map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><PieChart className="h-4 w-4" /> Expense Category Breakdown</CardTitle></CardHeader>
          <CardContent><ExpenseCategoryChart /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Monthly Expense Trend vs Budget</CardTitle></CardHeader>
          <CardContent><MonthlyExpenseTrendChart /></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="hidden lg:table-cell">Location</TableHead>
                <TableHead className="hidden lg:table-cell">Department</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="hidden sm:table-cell">Approved By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{new Date(e.date).toLocaleDateString('en-IN')}</TableCell>
                  <TableCell><Badge className={catColor(e.category)}>{e.category}</Badge></TableCell>
                  <TableCell className="hidden md:table-cell">{e.description || '—'}</TableCell>
                  <TableCell className="hidden lg:table-cell">{e.location || '—'}</TableCell>
                  <TableCell className="hidden lg:table-cell">{e.department || '—'}</TableCell>
                  <TableCell className="text-right font-medium">{fmt(e.amount)}</TableCell>
                  <TableCell className="hidden sm:table-cell">{e.approvedBy?.name || '—'}</TableCell>
                </TableRow>
              ))}
              {expenses.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No expenses found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddExpenseDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
