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
import { LeadCard, type Lead, type DealHealth, type LeadStatus } from "./components/LeadCard";
import { Search, Phone, Calendar, ArrowRight, Users, Flame, Sun, Snowflake } from "lucide-react";

// ── Mock data ──────────────────────────────────────────────────────────────
const mockLeads: Lead[] = [
  { id: "L001", name: "Amit Verma", mobile: "9876543210", model: "Honda Activa 6G", status: "Negotiation", dealHealth: "Hot", followUpDate: "2024-03-22", assignedTo: "Ravi", source: "Walk-in" },
  { id: "L002", name: "Sneha Gupta", mobile: "8765432109", model: "Honda SP 125", status: "Test Ride", dealHealth: "Hot", followUpDate: "2024-03-22", assignedTo: "Ajay", source: "Website" },
  { id: "L003", name: "Rohit Mishra", mobile: "7654321098", model: "Honda Shine", status: "Contacted", dealHealth: "Warm", followUpDate: "2024-03-23", assignedTo: "Ravi", source: "Referral" },
  { id: "L004", name: "Kavita Rani", mobile: "6543210987", model: "Honda Dio", status: "New", dealHealth: "Warm", followUpDate: "2024-03-24", assignedTo: "Priya", source: "WhatsApp" },
  { id: "L005", name: "Deepak Singh", mobile: "5432109876", model: "Honda Unicorn", status: "Interested", dealHealth: "Warm", followUpDate: "2024-03-25", assignedTo: "Ajay", source: "Social Media" },
  { id: "L006", name: "Sunita Devi", mobile: "4321098765", model: "Honda Activa 6G", status: "Contacted", dealHealth: "Cold", followUpDate: "2024-03-28", assignedTo: "Ravi", source: "Phone Call" },
  { id: "L007", name: "Manoj Tiwari", mobile: "3210987654", model: "Honda CB350", status: "Lost", dealHealth: "Cold", followUpDate: "2024-03-30", assignedTo: "Priya", source: "Walk-in" },
];

// ── Health config ──────────────────────────────────────────────────────────
const healthBadge: Record<DealHealth, { emoji: string; color: string }> = {
  Hot: { emoji: "🔥", color: "bg-red-100 text-red-700 border-red-300" },
  Warm: { emoji: "☀️", color: "bg-amber-100 text-amber-700 border-amber-300" },
  Cold: { emoji: "❄️", color: "bg-blue-100 text-blue-700 border-blue-300" },
};

const statusColor: Record<LeadStatus, string> = {
  New: "bg-green-100 text-green-700",
  Contacted: "bg-blue-100 text-blue-700",
  Interested: "bg-purple-100 text-purple-700",
  "Test Ride": "bg-orange-100 text-orange-700",
  Negotiation: "bg-amber-100 text-amber-700",
  Lost: "bg-gray-100 text-gray-700",
};

// ── Page ────────────────────────────────────────────────────────────────────
export default function LeadsPage() {
  const [leads, setLeads] = React.useState<Lead[]>(mockLeads);
  const [search, setSearch] = React.useState("");

  // Counts
  const hot = leads.filter((l) => l.dealHealth === "Hot").length;
  const warm = leads.filter((l) => l.dealHealth === "Warm").length;
  const cold = leads.filter((l) => l.dealHealth === "Cold").length;

  // Today's follow-ups
  const today = new Date().toISOString().split("T")[0];
  const todayFollowups = leads.filter((l) => l.followUpDate === today || l.followUpDate <= today);

  const filtered = leads.filter(
    (l) =>
      !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.mobile.includes(search) ||
      l.model.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddLead = (data: LeadFormData) => {
    const newLead: Lead = {
      id: `L${Date.now()}`,
      name: data.name,
      mobile: data.mobile,
      model: data.interestedModel,
      status: "New",
      dealHealth: "Warm",
      followUpDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      assignedTo: "Unassigned",
      source: data.source,
    };
    setLeads((prev) => [newLead, ...prev]);
  };

  const handleConvert = (lead: Lead) => {
    alert(`Converting ${lead.name} to a booking! (Redirect to /bookings/new)`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads CRM</h1>
          <p className="text-muted-foreground">Track and convert leads into bookings</p>
        </div>
        <AddLeadDialog onAdd={handleAddLead} />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Hot 🔥</CardTitle>
            <Flame className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{hot}</div>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">Warm ☀️</CardTitle>
            <Sun className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{warm}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Cold ❄️</CardTitle>
            <Snowflake className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{cold}</div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Follow-ups */}
      {todayFollowups.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5 text-orange-600" />
              Today&apos;s Follow-ups ({todayFollowups.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {todayFollowups.slice(0, 6).map((lead) => (
                <LeadCard key={lead.id} lead={lead} onConvert={handleConvert} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Leads Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Leads</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Mobile</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Health</TableHead>
                <TableHead className="hidden md:table-cell">Follow-up</TableHead>
                <TableHead className="hidden lg:table-cell">Assigned</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {lead.mobile}
                    </span>
                  </TableCell>
                  <TableCell>{lead.model}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColor[lead.status]}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={healthBadge[lead.dealHealth].color}>
                      {healthBadge[lead.dealHealth].emoji} {lead.dealHealth}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{lead.followUpDate}</TableCell>
                  <TableCell className="hidden lg:table-cell">{lead.assignedTo}</TableCell>
                  <TableCell>
                    {lead.dealHealth === "Hot" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => handleConvert(lead)}
                      >
                        Convert <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    )}
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
    </div>
  );
}
