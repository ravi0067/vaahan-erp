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
import { FileText, Search, ShieldCheck, Clock, CheckCircle2, RefreshCw } from "lucide-react";
import { RTODetailDialog, type RTORecord } from "./components/RTODetailDialog";
import { DocumentVault } from "./components/DocumentVault";
import { apiGet } from "@/lib/api";
import { toast } from "sonner";

const statusColor = (s: string) => {
  switch (s) {
    case "APPLIED": case "Applied": return "bg-blue-100 text-blue-700";
    case "PENDING": case "Pending": return "bg-yellow-100 text-yellow-700";
    case "APPROVED": case "Approved": return "bg-green-100 text-green-700";
    default: return "";
  }
};

const statusMap: Record<string, string> = {
  APPLIED: "Applied",
  PENDING: "Pending",
  APPROVED: "Approved",
};

export default function RTOPage() {
  const [records, setRecords] = React.useState<RTORecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState("All");
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<RTORecord | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [vaultOpen, setVaultOpen] = React.useState(false);
  const [vaultBooking, setVaultBooking] = React.useState("");

  const fetchRTO = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<any[]>('/api/rto');
      const mapped: RTORecord[] = data.map((r: any) => ({
        id: r.id,
        bookingNo: r.booking?.bookingNumber || '',
        customer: r.booking?.customer?.name || '',
        vehicle: r.booking?.vehicle ? `${r.booking.vehicle.brand} ${r.booking.vehicle.model}` : '',
        regNumber: r.registrationNumber || '',
        status: statusMap[r.status] || r.status,
        appliedDate: r.appliedDate ? new Date(r.appliedDate).toLocaleDateString('en-IN') : '',
        approvedDate: r.approvedDate ? new Date(r.approvedDate).toLocaleDateString('en-IN') : '',
        insuranceExpiry: r.insuranceExpiry ? new Date(r.insuranceExpiry).toLocaleDateString('en-IN') : '',
        notes: r.notes || '',
      }));
      setRecords(mapped);
    } catch (error) {
      console.error('Failed to fetch RTO data:', error);
      toast.error('Failed to load RTO data');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchRTO(); }, [fetchRTO]);

  const filtered = records.filter((r) => {
    if (tab !== "All" && r.status !== tab) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.bookingNo.toLowerCase().includes(q) || r.customer.toLowerCase().includes(q) || r.vehicle.toLowerCase().includes(q) || r.regNumber.toLowerCase().includes(q);
    }
    return true;
  });

  const counts = {
    All: records.length,
    Applied: records.filter((r) => r.status === "Applied").length,
    Pending: records.filter((r) => r.status === "Pending").length,
    Approved: records.filter((r) => r.status === "Approved").length,
  };

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
          <h1 className="text-2xl font-bold">RTO & Documents</h1>
          <p className="text-muted-foreground text-sm">Manage registrations, documents & insurance ({records.length} records)</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRTO} className="gap-1">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

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
