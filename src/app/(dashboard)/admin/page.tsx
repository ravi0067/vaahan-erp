"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Building2, Users, IndianRupee, Activity, Plus, Archive, RotateCcw, Settings2, Settings } from "lucide-react";
import Link from "next/link";
import { useSettingsStore, defaultClientFeatures, type ClientFeatureConfig } from "@/store/settings-store";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

interface Client {
  id: string;
  name: string;
  slug: string;
  plan: "Free" | "Pro" | "Enterprise";
  status: "Active" | "Expired" | "Archived";
  subscriptionExpiry: string;
  usersCount: number;
}

const mockClients: Client[] = [
  { id: "1", name: "Vaahan Motors Lucknow", slug: "vaahan-lko", plan: "Pro", status: "Active", subscriptionExpiry: "2025-12-31", usersCount: 8 },
  { id: "2", name: "Shree Honda Kanpur", slug: "shree-honda-knp", plan: "Enterprise", status: "Active", subscriptionExpiry: "2025-06-30", usersCount: 15 },
  { id: "3", name: "Bajaj World Agra", slug: "bajaj-agra", plan: "Free", status: "Active", subscriptionExpiry: "2025-04-30", usersCount: 3 },
  { id: "4", name: "Hero Point Varanasi", slug: "hero-vns", plan: "Pro", status: "Expired", subscriptionExpiry: "2025-02-28", usersCount: 6 },
  { id: "5", name: "TVS Motors Allahabad", slug: "tvs-alld", plan: "Free", status: "Archived", subscriptionExpiry: "2024-12-31", usersCount: 2 },
];

const planColor = (p: string) => {
  switch (p) {
    case "Free": return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    case "Pro": return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    case "Enterprise": return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
    default: return "";
  }
};

const statusColor = (s: string) => {
  switch (s) {
    case "Active": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    case "Expired": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
    case "Archived": return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
    default: return "";
  }
};

// ── Client Config Dialog ───────────────────────────────────────────────
function ClientConfigDialog({
  client,
  open,
  onClose,
}: {
  client: Client;
  open: boolean;
  onClose: () => void;
}) {
  const { clientFeatures, setClientFeatures } = useSettingsStore();
  const config = clientFeatures[client.id] || defaultClientFeatures();
  const [saved, setSaved] = React.useState(false);

  const toggle = (key: keyof ClientFeatureConfig) => {
    if (typeof config[key] === "boolean") {
      setClientFeatures(client.id, { [key]: !config[key] });
    }
  };

  const setNum = (key: keyof ClientFeatureConfig, val: number) => {
    setClientFeatures(client.id, { [key]: val });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const featureToggles: { key: keyof ClientFeatureConfig; label: string }[] = [
    { key: "onlinePayment", label: "✅ Online Payment" },
    { key: "aiAssistant", label: "✅ AI Assistant" },
    { key: "whatsappAlerts", label: "✅ WhatsApp Alerts" },
    { key: "emailAlerts", label: "✅ Email Alerts" },
    { key: "smsAlerts", label: "✅ SMS Alerts" },
    { key: "customerTrackingLinks", label: "✅ Customer Tracking Links" },
    { key: "invoiceGeneration", label: "✅ Invoice Generation" },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" /> Configure: {client.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Feature Toggles</Label>
            {featureToggles.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-muted/50">
                <span className="text-sm">{label}</span>
                <button
                  onClick={() => toggle(key)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${
                    config[key] ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    config[key] ? "left-[18px]" : "left-0.5"
                  }`} />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-3 border-t pt-3">
            <Label className="text-sm font-semibold">Plan Limits</Label>
            <div className="grid gap-3">
              <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground">Max Users</Label>
                <Input
                  type="number"
                  value={config.maxUsers}
                  onChange={(e) => setNum("maxUsers", Number(e.target.value))}
                  min={1}
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground">Max Vehicles</Label>
                <Input
                  type="number"
                  value={config.maxVehicles}
                  onChange={(e) => setNum("maxVehicles", Number(e.target.value))}
                  min={1}
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground">Max Bookings / Month</Label>
                <Input
                  type="number"
                  value={config.maxBookingsPerMonth}
                  onChange={(e) => setNum("maxBookingsPerMonth", Number(e.target.value))}
                  min={1}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{saved ? "Saved ✅" : "Save Configuration"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [configClient, setConfigClient] = React.useState<Client | null>(null);
  const [clientName, setClientName] = React.useState("");
  const [clientSlug, setClientSlug] = React.useState("");
  const [clientPlan, setClientPlan] = React.useState<string>("Free");

  const totalClients = mockClients.length;
  const activeClients = mockClients.filter((c) => c.status === "Active").length;
  const expiredClients = mockClients.filter((c) => c.status === "Expired").length;
  const totalRevenue = mockClients.filter((c) => c.status === "Active").reduce((s, c) => {
    const rev = c.plan === "Enterprise" ? 5000 : c.plan === "Pro" ? 2000 : 0;
    return s + rev;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Super Admin</h1>
          <p className="text-muted-foreground text-sm">Multi-tenant client management</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/settings">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" /> Master Settings
            </Button>
          </Link>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Client
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalClients}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{activeClients}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <Users className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{expiredClients}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{fmt(totalRevenue)}</div><p className="text-xs text-muted-foreground">/month</p></CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Slug</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Subscription Expiry</TableHead>
                <TableHead className="text-center">Users</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockClients.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{c.slug}</TableCell>
                  <TableCell><Badge className={planColor(c.plan)}>{c.plan}</Badge></TableCell>
                  <TableCell><Badge className={statusColor(c.status)}>{c.status}</Badge></TableCell>
                  <TableCell className="hidden lg:table-cell">{c.subscriptionExpiry}</TableCell>
                  <TableCell className="text-center">{c.usersCount}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="text-primary gap-1" onClick={() => setConfigClient(c)}>
                        <Settings2 className="h-3 w-3" /> Configure
                      </Button>
                      {c.status === "Active" ? (
                        <Button variant="ghost" size="sm" className="text-yellow-600 gap-1">
                          <Archive className="h-3 w-3" /> Archive
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-green-600 gap-1">
                          <RotateCcw className="h-3 w-3" /> Reactivate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Client Config Dialog */}
      {configClient && (
        <ClientConfigDialog
          client={configClient}
          open={!!configClient}
          onClose={() => setConfigClient(null)}
        />
      )}

      {/* Add Client Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Client Name</Label>
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g., Honda Motors Delhi" />
            </div>
            <div className="grid gap-2">
              <Label>Slug</Label>
              <Input value={clientSlug} onChange={(e) => setClientSlug(e.target.value)} placeholder="e.g., honda-del" />
            </div>
            <div className="grid gap-2">
              <Label>Plan</Label>
              <Select value={clientPlan} onValueChange={setClientPlan}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => setDialogOpen(false)}>Add Client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
