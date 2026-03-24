"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddLeadDialog, type LeadFormData } from "./components/AddLeadDialog";
import { Search, Phone, ArrowRight, Users, Flame, Sun, Snowflake, List, CalendarDays, Download, Send, RefreshCw } from "lucide-react";
import { LeadSourceChart, LeadConversionGauge } from "@/components/charts/ChartComponents";
import { SendAlertDialog } from "@/components/alerts/SendAlertDialog";
import { FollowUpCalendar } from "./components/FollowUpCalendar";
import { exportToCSV } from "@/lib/export-csv";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────
interface LeadData {
  id: string;
  customerName: string;
  mobile: string;
  email?: string;
  interestedModel?: string;
  location?: string;
  source?: string;
  status: string;
  dealHealth: string;
  followUpDate?: string;
  notes?: string;
  assignedTo?: { id: string; name: string };
  createdAt: string;
}

// ── Health config ──────────────────────────────────────────────────────────
const healthBadge: Record<string, { emoji: string; color: string }> = {
  HOT: { emoji: "🔥", color: "bg-red-100 text-red-700 border-red-300" },
  WARM: { emoji: "☀️", color: "bg-amber-100 text-amber-700 border-amber-300" },
  COLD: { emoji: "❄️", color: "bg-blue-100 text-blue-700 border-blue-300" },
};

const statusColor: Record<string, string> = {
  NEW: "bg-green-100 text-green-700",
  CONTACTED: "bg-blue-100 text-blue-700",
  FOLLOWUP: "bg-purple-100 text-purple-700",
  CONVERTED: "bg-amber-100 text-amber-700",
  LOST: "bg-gray-100 text-gray-700",
};

// ── Page ────────────────────────────────────────────────────────────────────
export default function LeadsPage() {
  const [leads, setLeads] = React.useState<LeadData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"table" | "calendar">("table");
  const [alertLead, setAlertLead] = React.useState<LeadData | null>(null);

  const fetchLeads = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<LeadData[]>('/api/leads');
      setLeads(data);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      toast.error('Failed to load leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const hot = leads.filter((l) => l.dealHealth === "HOT").length;
  const warm = leads.filter((l) => l.dealHealth === "WARM").length;
  const cold = leads.filter((l) => l.dealHealth === "COLD").length;

  const filtered = leads.filter(
    (l) =>
      !search ||
      l.customerName.toLowerCase().includes(search.toLowerCase()) ||
      l.mobile.includes(search) ||
      (l.interestedModel?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddLead = async (data: LeadFormData) => {
    try {
      await apiPost('/api/leads', {
        customerName: data.name,
        mobile: data.mobile,
        email: data.email || null,
        interestedModel: data.interestedModel,
        source: data.source,
        dealHealth: (data.dealHealth || 'WARM').toUpperCase(),
        notes: data.notes || null,
      });
      toast.success('Lead added successfully!');
      fetchLeads();
    } catch (error) {
      toast.error('Failed to add lead');
    }
  };

  const handleConvertLead = async (leadId: string) => {
    try {
      await apiPost(`/api/leads/${leadId}/convert`, {});
      toast.success('Lead converted to booking!');
      fetchLeads();
    } catch (error) {
      toast.error('Failed to convert lead');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}><CardContent className="p-4"><div className="h-12 bg-muted animate-pulse rounded" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">{leads.length} total leads</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchLeads} className="gap-1">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <div className="flex border rounded-lg overflow-hidden">
            <Button variant={viewMode === "table" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("table")} className="rounded-none gap-1">
              <List className="h-4 w-4" /> Table
            </Button>
            <Button variant={viewMode === "calendar" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("calendar")} className="rounded-none gap-1">
              <CalendarDays className="h-4 w-4" /> Calendar
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(filtered as unknown as Record<string, unknown>[], "leads", [
              { key: "customerName", label: "Name" },
              { key: "mobile", label: "Mobile" },
              { key: "interestedModel", label: "Model" },
              { key: "status", label: "Status" },
              { key: "dealHealth", label: "Deal Health" },
            ])}
          >
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          <AddLeadDialog onAdd={handleAddLead} />
        </div>
      </div>

      {/* Health Summary */}
      <div className="grid gap-4 grid-cols-3">
        <Card className="border-red-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Flame className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm text-red-700">Hot Leads</p>
              <p className="text-3xl font-bold text-red-700">{hot}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Sun className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-sm text-amber-700">Warm Leads</p>
              <p className="text-3xl font-bold text-amber-700">{warm}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Snowflake className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-blue-700">Cold Leads</p>
              <p className="text-3xl font-bold text-blue-700">{cold}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, mobile, or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {viewMode === "calendar" ? (
        <FollowUpCalendar
          leads={filtered.map(l => ({
            id: l.id,
            name: l.customerName,
            mobile: l.mobile,
            model: l.interestedModel || '',
            status: l.status as any,
            dealHealth: l.dealHealth as any,
            followUpDate: l.followUpDate || '',
            assignedTo: l.assignedTo?.name || '',
            source: l.source || '',
          }))}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> All Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Mobile</TableHead>
                  <TableHead className="hidden md:table-cell">Model</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Assigned</TableHead>
                  <TableHead className="hidden lg:table-cell">Follow-up</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.customerName}</TableCell>
                    <TableCell className="hidden sm:table-cell font-mono text-sm">{lead.mobile}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{lead.interestedModel || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={healthBadge[lead.dealHealth]?.color || ""}>
                        {healthBadge[lead.dealHealth]?.emoji} {lead.dealHealth}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColor[lead.status] || ""}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {lead.assignedTo?.name || '—'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString('en-IN') : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-0.5">
                        {lead.status !== 'CONVERTED' && lead.status !== 'LOST' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-green-600"
                            onClick={() => handleConvertLead(lead.id)}
                            title="Convert to Booking"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-blue-600"
                          onClick={() => setAlertLead(lead)}
                          title="Send Alert"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => window.open(`tel:${lead.mobile}`)}
                          title="Call"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No leads found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Lead Sources</CardTitle></CardHeader>
          <CardContent><LeadSourceChart /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Conversion Rate</CardTitle></CardHeader>
          <CardContent><LeadConversionGauge /></CardContent>
        </Card>
      </div>

      {alertLead && (
        <SendAlertDialog
          open={!!alertLead}
          onClose={() => setAlertLead(null)}
          recipient={{
            name: alertLead.customerName,
            mobile: alertLead.mobile,
            email: alertLead.email || '',
          }}
          context={{
            bookingId: '',
            vehicle: alertLead.interestedModel || '',
            amount: 0,
            remaining: 0,
          }}
        />
      )}
    </div>
  );
}
