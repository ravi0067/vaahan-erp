"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Wrench, Clock, CheckCircle2, AlertCircle, Plus, Search, IndianRupee } from "lucide-react";
import { JobCardDialog, type JobCard } from "./components/JobCardDialog";
import { QuickReceiptDialog } from "./components/QuickReceiptDialog";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const mockJobs: JobCard[] = [
  { id: "1", jobNo: "SVC-001", vehicleReg: "UP32-AB-1234", customerName: "Raj Kumar", customerMobile: "9876543210", complaints: "Engine noise", diagnosis: "Timing chain loose", parts: [{ name: "Timing Chain", qty: 1, rate: 1200, amount: 1200 }], labourCharge: 800, status: "Completed", mechanic: "Amit", totalBilled: 2000, received: 2000, pending: 0 },
  { id: "2", jobNo: "SVC-002", vehicleReg: "UP32-CD-5678", customerName: "Priya Singh", customerMobile: "9876543211", complaints: "Brake squeal", diagnosis: "Worn brake pads", parts: [{ name: "Brake Pad Set", qty: 1, rate: 600, amount: 600 }, { name: "Brake Oil", qty: 1, rate: 200, amount: 200 }], labourCharge: 500, status: "In Progress", mechanic: "Raju", totalBilled: 1300, received: 500, pending: 800 },
  { id: "3", jobNo: "SVC-003", vehicleReg: "UP32-EF-9012", customerName: "Suresh Yadav", customerMobile: "9876543212", complaints: "General service", diagnosis: "Oil change + filter", parts: [{ name: "Engine Oil", qty: 1, rate: 450, amount: 450 }, { name: "Oil Filter", qty: 1, rate: 150, amount: 150 }], labourCharge: 300, status: "Open", mechanic: "", totalBilled: 900, received: 0, pending: 900 },
  { id: "4", jobNo: "SVC-004", vehicleReg: "UP32-GH-3456", customerName: "Neha Gupta", customerMobile: "9876543213", complaints: "Flat tyre", diagnosis: "Puncture repair", parts: [], labourCharge: 100, status: "Completed", mechanic: "Amit", totalBilled: 100, received: 100, pending: 0 },
  { id: "5", jobNo: "SVC-005", vehicleReg: "UP32-IJ-7890", customerName: "Vikash Tiwari", customerMobile: "9876543214", complaints: "Battery dead", diagnosis: "Battery replacement needed", parts: [{ name: "Battery 12V", qty: 1, rate: 2500, amount: 2500 }], labourCharge: 200, status: "In Progress", mechanic: "Raju", totalBilled: 2700, received: 1000, pending: 1700 },
];

const statusColor = (s: string) => {
  switch (s) {
    case "Open": return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    case "In Progress": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
    case "Completed": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    default: return "";
  }
};

export default function ServicePage() {
  const [tab, setTab] = React.useState("All");
  const [search, setSearch] = React.useState("");
  const [jobDialogOpen, setJobDialogOpen] = React.useState(false);
  const [receiptOpen, setReceiptOpen] = React.useState(false);
  const [selectedJob, setSelectedJob] = React.useState<JobCard | null>(null);
  const [editJob, setEditJob] = React.useState<JobCard | null>(null);

  const filtered = mockJobs.filter((j) => {
    if (tab !== "All" && j.status !== tab) return false;
    if (search) {
      const q = search.toLowerCase();
      return j.jobNo.toLowerCase().includes(q) || j.vehicleReg.toLowerCase().includes(q) || j.customerName.toLowerCase().includes(q);
    }
    return true;
  });

  const openJobs = mockJobs.filter((j) => j.status === "Open").length;
  const inProgress = mockJobs.filter((j) => j.status === "In Progress").length;
  const completedToday = mockJobs.filter((j) => j.status === "Completed").length;
  const pendingPayments = mockJobs.reduce((s, j) => s + j.pending, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Service & Workshop</h1>
          <p className="text-muted-foreground text-sm">Manage job cards, service billing & payments</p>
        </div>
        <Button onClick={() => { setEditJob(null); setJobDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> New Job Card
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Jobs</CardTitle>
            <Wrench className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{openJobs}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{inProgress}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{completedToday}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{fmt(pendingPayments)}</div></CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            {["All", "Open", "In Progress", "Completed"].map((t) => (
              <TabsTrigger key={t} value={t}>{t}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search jobs..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job #</TableHead>
                <TableHead>Vehicle Reg</TableHead>
                <TableHead className="hidden md:table-cell">Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Billed</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Received</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Pending</TableHead>
                <TableHead className="hidden lg:table-cell">Mechanic</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((j) => (
                <TableRow key={j.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setEditJob(j); setJobDialogOpen(true); }}>
                  <TableCell className="font-medium">{j.jobNo}</TableCell>
                  <TableCell>{j.vehicleReg}</TableCell>
                  <TableCell className="hidden md:table-cell">{j.customerName}</TableCell>
                  <TableCell><Badge className={statusColor(j.status)}>{j.status}</Badge></TableCell>
                  <TableCell className="text-right">{fmt(j.totalBilled)}</TableCell>
                  <TableCell className="text-right hidden sm:table-cell">{fmt(j.received)}</TableCell>
                  <TableCell className="text-right hidden sm:table-cell">{fmt(j.pending)}</TableCell>
                  <TableCell className="hidden lg:table-cell">{j.mechanic || "—"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedJob(j); setReceiptOpen(true); }}>
                      <IndianRupee className="h-4 w-4 mr-1" /> Receipt
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No jobs found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <JobCardDialog open={jobDialogOpen} onOpenChange={setJobDialogOpen} job={editJob} />
      {selectedJob && (
        <QuickReceiptDialog open={receiptOpen} onOpenChange={setReceiptOpen} job={selectedJob} />
      )}
    </div>
  );
}
