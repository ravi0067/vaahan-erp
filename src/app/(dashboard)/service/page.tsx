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
import { Wrench, Clock, CheckCircle2, AlertCircle, Plus, Search, IndianRupee, RefreshCw } from "lucide-react";
import { ServiceRevenueChart } from "@/components/charts/ChartComponents";
import { JobCardDialog, type JobCard } from "./components/JobCardDialog";
import { QuickReceiptDialog } from "./components/QuickReceiptDialog";
import { apiGet } from "@/lib/api";
import { toast } from "sonner";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const statusColor = (s: string) => {
  switch (s) {
    case "OPEN": case "Open": return "bg-blue-100 text-blue-700";
    case "IN_PROGRESS": case "In Progress": return "bg-yellow-100 text-yellow-700";
    case "COMPLETED": case "Completed": return "bg-green-100 text-green-700";
    case "INVOICED": return "bg-purple-100 text-purple-700";
    default: return "";
  }
};

const statusMap: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  INVOICED: "Invoiced",
};

export default function ServicePage() {
  const [jobs, setJobs] = React.useState<JobCard[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState("All");
  const [search, setSearch] = React.useState("");
  const [jobDialogOpen, setJobDialogOpen] = React.useState(false);
  const [receiptOpen, setReceiptOpen] = React.useState(false);
  const [selectedJob, setSelectedJob] = React.useState<JobCard | null>(null);
  const [editJob, setEditJob] = React.useState<JobCard | null>(null);

  const fetchJobs = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<any[]>('/api/service/jobs');
      const mapped: JobCard[] = data.map((j: any) => ({
        id: j.id,
        jobNo: j.id.slice(0, 8).toUpperCase(),
        vehicleReg: j.vehicleRegNo,
        customerName: j.customerName,
        customerMobile: j.customerMobile,
        complaints: j.complaints || '',
        diagnosis: '',
        parts: [],
        labourCharge: j.labourCharge || 0,
        status: statusMap[j.status] || j.status,
        mechanic: j.mechanic?.name || '',
        totalBilled: j.totalBilled || 0,
        received: j.totalReceived || 0,
        pending: j.pendingAmount || 0,
      }));
      setJobs(mapped);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      toast.error('Failed to load service jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const filtered = jobs.filter((j) => {
    if (tab !== "All" && j.status !== tab) return false;
    if (search) {
      const q = search.toLowerCase();
      return j.jobNo.toLowerCase().includes(q) || j.vehicleReg.toLowerCase().includes(q) || j.customerName.toLowerCase().includes(q);
    }
    return true;
  });

  const openJobs = jobs.filter((j) => j.status === "Open").length;
  const inProgress = jobs.filter((j) => j.status === "In Progress").length;
  const completedToday = jobs.filter((j) => j.status === "Completed").length;
  const pendingPayments = jobs.reduce((s, j) => s + j.pending, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Card key={i}><CardContent className="p-6"><div className="h-16 bg-muted animate-pulse rounded" /></CardContent></Card>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Service & Workshop</h1>
          <p className="text-muted-foreground text-sm">Manage job cards, service billing & payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchJobs} className="gap-1">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button onClick={() => { setEditJob(null); setJobDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> New Job Card
          </Button>
        </div>
      </div>

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
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
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

      <Card>
        <CardHeader><CardTitle className="text-lg">Service Revenue (Last 7 Days)</CardTitle></CardHeader>
        <CardContent><ServiceRevenueChart /></CardContent>
      </Card>

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
