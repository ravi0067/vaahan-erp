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
import { Receipt, TrendingDown, PieChart, Plus, Download } from "lucide-react";
import { AddExpenseDialog } from "./components/AddExpenseDialog";
import { exportToCSV } from "@/lib/export-csv";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  location: string;
  department: string;
  amount: number;
  receipt: boolean;
  approvedBy: string;
}

const mockExpenses: Expense[] = [
  { id: "1", date: "2025-03-20", category: "Rent", description: "Showroom rent - March", location: "Main Branch", department: "Admin", amount: 35000, receipt: true, approvedBy: "Ravi" },
  { id: "2", date: "2025-03-18", category: "Salary", description: "Mechanic salary - Amit", location: "Main Branch", department: "Service", amount: 15000, receipt: false, approvedBy: "Ravi" },
  { id: "3", date: "2025-03-17", category: "Utilities", description: "Electricity bill", location: "Main Branch", department: "Admin", amount: 4500, receipt: true, approvedBy: "Manager" },
  { id: "4", date: "2025-03-15", category: "Marketing", description: "Facebook ads - March", location: "Online", department: "Sales", amount: 5000, receipt: true, approvedBy: "Ravi" },
  { id: "5", date: "2025-03-14", category: "Petty Cash", description: "Tea, snacks & office supplies", location: "Main Branch", department: "Admin", amount: 1200, receipt: false, approvedBy: "Manager" },
  { id: "6", date: "2025-03-12", category: "Maintenance", description: "Workshop equipment repair", location: "Service Center", department: "Service", amount: 3500, receipt: true, approvedBy: "Ravi" },
  { id: "7", date: "2025-03-10", category: "Travel", description: "Delhi trip - OEM meeting", location: "Delhi", department: "Sales", amount: 4800, receipt: true, approvedBy: "Ravi" },
  { id: "8", date: "2025-03-08", category: "Office Supplies", description: "Printer cartridge & paper", location: "Main Branch", department: "Admin", amount: 2200, receipt: true, approvedBy: "Manager" },
];

const categories = ["All", "Rent", "Salary", "Utilities", "Marketing", "Maintenance", "Office Supplies", "Travel", "Petty Cash", "Other"];
const departments = ["All", "Admin", "Sales", "Service"];
const months = ["March 2025", "February 2025", "January 2025"];

const catColor = (c: string) => {
  const colors: Record<string, string> = {
    Rent: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    Salary: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    Utilities: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    Marketing: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
    Maintenance: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    "Office Supplies": "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
    Travel: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
    "Petty Cash": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };
  return colors[c] || "";
};

export default function ExpensesPage() {
  const [catFilter, setCatFilter] = React.useState("All");
  const [deptFilter, setDeptFilter] = React.useState("All");
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const filtered = mockExpenses.filter((e) => {
    if (catFilter !== "All" && e.category !== catFilter) return false;
    if (deptFilter !== "All" && e.department !== deptFilter) return false;
    return true;
  });

  const totalExpenses = mockExpenses.reduce((s, e) => s + e.amount, 0);
  const monthlyBudget = 100000;
  const budgetPct = Math.round((totalExpenses / monthlyBudget) * 100);
  const topCategory = mockExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);
  const topCat = Object.entries(topCategory).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Expenses</h1>
          <p className="text-muted-foreground text-sm">Track and manage dealership expenses</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(filtered as unknown as Record<string, unknown>[], "expenses", [
              { key: "date", label: "Date" },
              { key: "category", label: "Category" },
              { key: "description", label: "Description" },
              { key: "location", label: "Location" },
              { key: "department", label: "Department" },
              { key: "amount", label: "Amount" },
              { key: "approvedBy", label: "Approved By" },
            ])}
          >
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
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
            <div className="text-2xl font-bold">{topCat?.[0]}</div>
            <p className="text-xs text-muted-foreground">{fmt(topCat?.[1] ?? 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value="March 2025" onValueChange={() => {}}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {months.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            {categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            {departments.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PieChart className="h-4 w-4" /> Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(topCategory)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([cat, amount]) => {
                  const pct = Math.round((amount / totalExpenses) * 100);
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{cat}</span>
                        <span className="font-medium">{fmt(amount)} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${catColor(cat).includes("purple") ? "bg-purple-500" : catColor(cat).includes("blue") ? "bg-blue-500" : catColor(cat).includes("yellow") ? "bg-yellow-500" : catColor(cat).includes("pink") ? "bg-pink-500" : catColor(cat).includes("orange") ? "bg-orange-500" : "bg-gray-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Budget vs Actual */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Budget vs Actual by Department</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { dept: "Admin", budget: 50000, actual: mockExpenses.filter(e => e.department === "Admin").reduce((s, e) => s + e.amount, 0) },
              { dept: "Sales", budget: 30000, actual: mockExpenses.filter(e => e.department === "Sales").reduce((s, e) => s + e.amount, 0) },
              { dept: "Service", budget: 20000, actual: mockExpenses.filter(e => e.department === "Service").reduce((s, e) => s + e.amount, 0) },
            ].map((d) => {
              const pct = Math.round((d.actual / d.budget) * 100);
              return (
                <div key={d.dept} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{d.dept}</span>
                    <span className="text-muted-foreground">
                      {fmt(d.actual)} / {fmt(d.budget)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-500" : "bg-green-500"}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">{pct}% used</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Table */}
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
                <TableHead className="hidden sm:table-cell">Receipt</TableHead>
                <TableHead className="hidden sm:table-cell">Approved By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{e.date}</TableCell>
                  <TableCell><Badge className={catColor(e.category)}>{e.category}</Badge></TableCell>
                  <TableCell className="hidden md:table-cell">{e.description}</TableCell>
                  <TableCell className="hidden lg:table-cell">{e.location}</TableCell>
                  <TableCell className="hidden lg:table-cell">{e.department}</TableCell>
                  <TableCell className="text-right font-medium">{fmt(e.amount)}</TableCell>
                  <TableCell className="hidden sm:table-cell">{e.receipt ? <Badge variant="secondary">✓</Badge> : "—"}</TableCell>
                  <TableCell className="hidden sm:table-cell">{e.approvedBy}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No expenses found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddExpenseDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
