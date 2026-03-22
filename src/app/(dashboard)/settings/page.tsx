"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Upload, AlertTriangle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

// ── General Settings ───────────────────────────────────────────────────────
function GeneralSettings() {
  return (
    <Card>
      <CardHeader><CardTitle>General Information</CardTitle></CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label>Dealership Name</Label>
          <Input defaultValue="Vaahan Motors" />
        </div>
        <div className="grid gap-2">
          <Label>Address</Label>
          <Input defaultValue="123 MG Road, Lucknow, UP 226001" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Phone</Label>
            <Input defaultValue="+91 9876543210" />
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input defaultValue="info@vaahanmotors.com" />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>GST Number</Label>
          <Input defaultValue="09AABCU9603R1ZM" />
        </div>
        <div className="grid gap-2">
          <Label>Logo</Label>
          <Button variant="outline" className="w-fit gap-2">
            <Upload className="h-4 w-4" /> Upload Logo
          </Button>
        </div>
        <div className="flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Expense Heads ──────────────────────────────────────────────────────────
function ExpenseHeads() {
  const [heads, setHeads] = React.useState([
    "Rent", "Salary", "Utilities", "Marketing", "Maintenance",
    "Office Supplies", "Travel", "Petty Cash", "Insurance",
  ]);
  const [newHead, setNewHead] = React.useState("");

  const addHead = () => {
    if (newHead.trim() && !heads.includes(newHead.trim())) {
      setHeads([...heads, newHead.trim()]);
      setNewHead("");
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Expense Categories</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={newHead} onChange={(e) => setNewHead(e.target.value)} placeholder="New category name..." onKeyDown={(e) => e.key === "Enter" && addHead()} />
          <Button onClick={addHead}><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </div>
        <div className="space-y-2">
          {heads.map((h) => (
            <div key={h} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
              <span className="text-sm">{h}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setHeads(heads.filter((x) => x !== h))}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Banks ──────────────────────────────────────────────────────────────────
interface Bank {
  id: string;
  name: string;
  accountNo: string;
  ifsc: string;
  branch: string;
}

function BankSettings() {
  const [banks, setBanks] = React.useState<Bank[]>([
    { id: "1", name: "State Bank of India", accountNo: "3210XXXX7890", ifsc: "SBIN0001234", branch: "Lucknow Main" },
    { id: "2", name: "HDFC Bank", accountNo: "5010XXXX3456", ifsc: "HDFC0005678", branch: "Hazratganj" },
  ]);
  const [form, setForm] = React.useState({ name: "", accountNo: "", ifsc: "", branch: "" });

  const addBank = () => {
    if (form.name && form.accountNo) {
      setBanks([...banks, { ...form, id: Date.now().toString() }]);
      setForm({ name: "", accountNo: "", ifsc: "", branch: "" });
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Bank Accounts</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Bank Name" />
          <Input value={form.accountNo} onChange={(e) => setForm({ ...form, accountNo: e.target.value })} placeholder="Account Number" />
          <Input value={form.ifsc} onChange={(e) => setForm({ ...form, ifsc: e.target.value })} placeholder="IFSC Code" />
          <Input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} placeholder="Branch" />
        </div>
        <Button onClick={addBank}><Plus className="h-4 w-4 mr-1" /> Add Bank</Button>
        <Separator />
        <div className="space-y-2">
          {banks.map((b) => (
            <div key={b.id} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
              <div>
                <p className="text-sm font-medium">{b.name}</p>
                <p className="text-xs text-muted-foreground">A/C: {b.accountNo} | IFSC: {b.ifsc} | {b.branch}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setBanks(banks.filter((x) => x.id !== b.id))}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Locations ──────────────────────────────────────────────────────────────
function LocationSettings() {
  const [locations, setLocations] = React.useState(["Main Branch - Lucknow", "Service Center - Alambagh", "Warehouse - Chinhat"]);
  const [newLoc, setNewLoc] = React.useState("");

  const addLoc = () => {
    if (newLoc.trim() && !locations.includes(newLoc.trim())) {
      setLocations([...locations, newLoc.trim()]);
      setNewLoc("");
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Branch Locations</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={newLoc} onChange={(e) => setNewLoc(e.target.value)} placeholder="New location..." onKeyDown={(e) => e.key === "Enter" && addLoc()} />
          <Button onClick={addLoc}><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </div>
        <div className="space-y-2">
          {locations.map((l) => (
            <div key={l} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
              <span className="text-sm">{l}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setLocations(locations.filter((x) => x !== l))}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Financial Year ─────────────────────────────────────────────────────────
function FinancialYearSettings() {
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  return (
    <>
      <Card>
        <CardHeader><CardTitle>Financial Year</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Current Financial Year</p>
            <p className="text-2xl font-bold">April 2024 — March 2025</p>
          </div>
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            <AlertTriangle className="h-4 w-4 mr-2" /> Archive & Start New Year
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>⚠️ Archive Financial Year?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This will archive FY 2024-25 data and start FY 2025-26. This action cannot be undone.
              All current year data will be moved to archive and opening balances will be carried forward.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => setConfirmOpen(false)}>Yes, Archive & Start New Year</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Main Settings Page ─────────────────────────────────────────────────────
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="text-muted-foreground text-sm">Configure your dealership settings</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="expense-heads">Expense Heads</TabsTrigger>
          <TabsTrigger value="banks">Banks</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="financial-year">Financial Year</TabsTrigger>
        </TabsList>

        <TabsContent value="general"><GeneralSettings /></TabsContent>
        <TabsContent value="expense-heads"><ExpenseHeads /></TabsContent>
        <TabsContent value="banks"><BankSettings /></TabsContent>
        <TabsContent value="locations"><LocationSettings /></TabsContent>
        <TabsContent value="financial-year"><FinancialYearSettings /></TabsContent>
      </Tabs>
    </div>
  );
}
