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
import { FileText, Search, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";
import { RTODetailDialog, type RTORecord } from "./components/RTODetailDialog";
import { DocumentVault } from "./components/DocumentVault";

const mockRTORecords: RTORecord[] = [
  { id: "1", bookingNo: "BK-001", customer: "Raj Kumar", vehicle: "Honda Activa 6G", regNumber: "UP32-AB-1234", status: "Approved", appliedDate: "2025-01-10", approvedDate: "2025-02-01", insuranceExpiry: "2026-01-10", notes: "All documents verified" },
  { id: "2", bookingNo: "BK-002", customer: "Priya Singh", vehicle: "TVS Jupiter 125", regNumber: "UP32-CD-5678", status: "Pending", appliedDate: "2025-02-15", approvedDate: "", insuranceExpiry: "2026-02-15", notes: "Waiting for NOC" },
  { id: "3", bookingNo: "BK-003", customer: "Amit Sharma", vehicle: "Hero Splendor Plus", regNumber: "", status: "Applied", appliedDate: "2025-03-01", approvedDate: "", insuranceExpiry: "2026-03-01", notes: "" },
  { id: "4", bookingNo: "BK-004", customer: "Neha Gupta", vehicle: "Suzuki Access 125", regNumber: "UP32-EF-9012", status: "Approved", appliedDate: "2025-01-20", approvedDate: "2025-02-10", insuranceExpiry: "2026-01-20", notes: "" },
  { id: "5", bookingNo: "BK-005", customer: "Suresh Yadav", vehicle: "Bajaj Pulsar 150", regNumber: "", status: "Pending", appliedDate: "2025-03-05", approvedDate: "", insuranceExpiry: "2026-03-05", notes: "Insurance pending" },
];

const statusColor = (s: string) => {
  switch (s) {
    case "Applied": return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    case "Pending": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
    case "Approved": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    default: return "";
  }
};

export default function RTOPage() {
  const [tab, setTab] = React.useState("All");
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<RTORecord | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [vaultOpen, setVaultOpen] = React.useState(false);
  const [vaultBooking, setVaultBooking] = React.useState("");

  const filtered = mockRTORecords.filter((r) => {
    if (tab !== "All" && r.status !== tab) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.bookingNo.toLowerCase().includes(q) ||
        r.customer.toLowerCase().includes(q) ||
        r.vehicle.toLowerCase().includes(q) ||
        r.regNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    All: mockRTORecords.length,
    Applied: mockRTORecords.filter((r) => r.status === "Applied").length,
    Pending: mockRTORecords.filter((r) => r.status === "Pending").length,
    Approved: mockRTORecords.filter((r) => r.status === "Approved").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">RTO & Documents</h1>
          <p className="text-muted-foreground text-sm">Manage registrations, documents & insurance</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Applied</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{counts.Applied}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{counts.Pending}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{counts.Approved}</div></CardContent>
        </Card>
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            {(["All", "Applied", "Pending", "Approved"] as const).map((t) => (
              <TabsTrigger key={t} value={t}>{t} ({counts[t]})</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search bookings..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Vehicle</TableHead>
                <TableHead>Reg Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Applied Date</TableHead>
                <TableHead className="hidden lg:table-cell">Insurance Expiry</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setSelected(r); setDetailOpen(true); }}>
                  <TableCell className="font-medium">{r.bookingNo}</TableCell>
                  <TableCell>{r.customer}</TableCell>
                  <TableCell className="hidden md:table-cell">{r.vehicle}</TableCell>
                  <TableCell>{r.regNumber || "—"}</TableCell>
                  <TableCell><Badge className={statusColor(r.status)}>{r.status}</Badge></TableCell>
                  <TableCell className="hidden lg:table-cell">{r.appliedDate}</TableCell>
                  <TableCell className="hidden lg:table-cell">{r.insuranceExpiry}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setVaultBooking(r.bookingNo); setVaultOpen(true); }}>
                      <ShieldCheck className="h-4 w-4 mr-1" /> Docs
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No records found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selected && (
        <RTODetailDialog open={detailOpen} onOpenChange={setDetailOpen} record={selected} />
      )}
      <DocumentVault open={vaultOpen} onOpenChange={setVaultOpen} bookingNo={vaultBooking} />
    </div>
  );
}
