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
import { Building2, Users, IndianRupee, Activity, Plus, Archive, RotateCcw, Settings2, Settings, RefreshCw } from "lucide-react";
import { EnhancedAddClientDialog } from './components/EnhancedAddClientDialog';
import Link from "next/link";
import { useSettingsStore, defaultClientFeatures, type ClientFeatureConfig } from "@/store/settings-store";
import { type ShowroomType, showroomConfig, showroomTypeDescriptions } from "@/lib/showroom-config";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { toast } from "sonner";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

interface TenantData {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  createdAt: string;
  _count?: { users: number; vehicles: number; bookings: number };
}

const planColor = (p: string) => {
  const c: Record<string, string> = {
    FREE: "bg-gray-100 text-gray-700", Free: "bg-gray-100 text-gray-700",
    PRO: "bg-blue-100 text-blue-700", Pro: "bg-blue-100 text-blue-700",
    ENTERPRISE: "bg-purple-100 text-purple-700", Enterprise: "bg-purple-100 text-purple-700",
  };
  return c[p] || "";
};

const statusColor = (s: string) => {
  const c: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700", Active: "bg-green-100 text-green-700",
    EXPIRED: "bg-yellow-100 text-yellow-700", Expired: "bg-yellow-100 text-yellow-700",
    ARCHIVED: "bg-red-100 text-red-700", Archived: "bg-red-100 text-red-700",
  };
  return c[s] || "";
};

// ── Client Config Dialog ───────────────────────────────────────────────
function ClientConfigDialog({ client, open, onClose }: { client: TenantData; open: boolean; onClose: () => void }) {
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

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

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
          <DialogTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5" /> Configure: {client.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Feature Toggles</Label>
            {featureToggles.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-muted/50">
                <span className="text-sm">{label}</span>
                <button onClick={() => toggle(key)} className={`relative w-9 h-5 rounded-full transition-colors ${config[key] ? "bg-green-500" : "bg-gray-300"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${config[key] ? "left-[18px]" : "left-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
          <div className="space-y-3 border-t pt-3">
            <Label className="text-sm font-semibold">Plan Limits</Label>
            <div className="grid gap-3">
              <div className="grid gap-1"><Label className="text-xs text-muted-foreground">Max Users</Label><Input type="number" value={config.maxUsers} onChange={(e) => setNum("maxUsers", Number(e.target.value))} min={1} /></div>
              <div className="grid gap-1"><Label className="text-xs text-muted-foreground">Max Vehicles</Label><Input type="number" value={config.maxVehicles} onChange={(e) => setNum("maxVehicles", Number(e.target.value))} min={1} /></div>
              <div className="grid gap-1"><Label className="text-xs text-muted-foreground">Max Bookings / Month</Label><Input type="number" value={config.maxBookingsPerMonth} onChange={(e) => setNum("maxBookingsPerMonth", Number(e.target.value))} min={1} /></div>
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

// ── Showroom Type Card Selector ────────────────────────────────────────
function ShowroomTypeSelector({ value, onChange }: { value: ShowroomType; onChange: (type: ShowroomType) => void }) {
  const types: ShowroomType[] = ["BIKE", "CAR", "EV", "MULTI"];
  return (
    <div className="grid grid-cols-2 gap-3">
      {types.map((type) => {
        const c = showroomConfig[type];
        const isActive = type === value;
        return (
          <button key={type} type="button" onClick={() => onChange(type)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${isActive ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30" : "border-muted hover:border-primary/30 hover:bg-muted/50"}`}>
            <span className="text-2xl">{c.emoji}</span>
            <span className="text-xs font-semibold">{c.label}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">{showroomTypeDescriptions[type]}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function AdminPage() {
  const [tenants, setTenants] = React.useState<TenantData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [configClient, setConfigClient] = React.useState<TenantData | null>(null);
  const [clientName, setClientName] = React.useState("");
  const [clientSlug, setClientSlug] = React.useState("");
  const [clientPlan, setClientPlan] = React.useState<string>("FREE");
  const [clientShowroomType, setClientShowroomType] = React.useState<ShowroomType>("BIKE");

  const fetchTenants = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<TenantData[]>('/api/tenants');
      setTenants(data);
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
      // Non-super-admin will get 403, show empty
      setTenants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchTenants(); }, [fetchTenants]);



  const totalClients = tenants.length;
  const activeClients = tenants.filter((c) => c.status === "ACTIVE").length;
  const totalUsers = tenants.reduce((s, c) => s + (c._count?.users || 0), 0);

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
          <h1 className="text-2xl font-bold">Super Admin</h1>
          <p className="text-muted-foreground text-sm">Multi-tenant client management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchTenants} className="gap-1">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Link href="/admin/settings"><Button variant="outline"><Settings className="h-4 w-4 mr-2" /> Master Settings</Button></Link>
          <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Client</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Clients</CardTitle><Building2 className="h-4 w-4 text-blue-500" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalClients}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Active</CardTitle><Activity className="h-4 w-4 text-green-500" /></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{activeClients}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle><Users className="h-4 w-4 text-yellow-500" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalUsers}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Vehicles</CardTitle><IndianRupee className="h-4 w-4 text-purple-500" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{tenants.reduce((s, c) => s + (c._count?.vehicles || 0), 0)}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Slug</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Users</TableHead>
                <TableHead className="text-center hidden sm:table-cell">Vehicles</TableHead>
                <TableHead className="text-center hidden sm:table-cell">Bookings</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{c.slug}</TableCell>
                  <TableCell><Badge className={planColor(c.plan)}>{c.plan}</Badge></TableCell>
                  <TableCell><Badge className={statusColor(c.status)}>{c.status}</Badge></TableCell>
                  <TableCell className="text-center">{c._count?.users || 0}</TableCell>
                  <TableCell className="text-center hidden sm:table-cell">{c._count?.vehicles || 0}</TableCell>
                  <TableCell className="text-center hidden sm:table-cell">{c._count?.bookings || 0}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="text-primary gap-1" onClick={() => setConfigClient(c)}>
                        <Settings2 className="h-3 w-3" /> Configure
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {tenants.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No tenants found (Super Admin access required)</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {configClient && <ClientConfigDialog client={configClient} open={!!configClient} onClose={() => setConfigClient(null)} />}
      
      <EnhancedAddClientDialog 
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={fetchTenants}
      />
    </div>
  );
}
