"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Building2, Users, IndianRupee, Activity, Plus, Archive, RotateCcw, Settings2, Settings, RefreshCw, Building, Trash2, Bike } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
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

interface Brand {
  brandName: string;
  brandType: string;
  locations: string[];
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

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Limits & Quotas</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Max Users</span>
                <Input type="number" min={1} max={100} className="w-16 h-7" value={config.maxUsers} onChange={(e) => setNum("maxUsers", Number(e.target.value))} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Max Vehicles</span>
                <Input type="number" min={10} max={10000} className="w-20 h-7" value={config.maxVehicles} onChange={(e) => setNum("maxVehicles", Number(e.target.value))} />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => { handleSave(); onClose(); }} className={saved ? "bg-green-600 hover:bg-green-700" : ""}>
            {saved ? "✓ Saved" : "Save Configuration"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Enhanced Add Client Dialog ─────────────────────────────────────────
function EnhancedAddClientDialog({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const currentYear = new Date().getFullYear();
  const currentFY = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;

  const [formData, setFormData] = React.useState({
    clientName: '',
    slug: '',
    plan: 'FREE',
    ownerName: '',
    ownerPassword: '',
    phone: '',
    gstNumber: '',
    emailId: '',
    address: '',
    firmName: '',
    showroomType: 'BIKE',
    currentFY,
    logoUrl: '',
    brands: [] as Brand[]
  });

  const [currentBrand, setCurrentBrand] = React.useState({
    brandName: '',
    brandType: 'BIKE',
    locations: [] as string[]
  });

  const [newLocation, setNewLocation] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Auto-generate slug from client name
  const handleClientNameChange = (name: string) => {
    updateFormData('clientName', name);
    if (!formData.slug) {
      const slug = name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      updateFormData('slug', slug);
    }
  };

  const addLocation = () => {
    if (!newLocation.trim()) {
      toast.error('Location name is required');
      return;
    }

    setCurrentBrand(prev => ({
      ...prev,
      locations: [...prev.locations, newLocation.trim()]
    }));
    setNewLocation('');
  };

  const removeLocation = (index: number) => {
    setCurrentBrand(prev => ({
      ...prev,
      locations: prev.locations.filter((_, i) => i !== index)
    }));
  };

  const addBrand = () => {
    if (!currentBrand.brandName.trim()) {
      toast.error('Brand name is required');
      return;
    }

    if (currentBrand.locations.length === 0) {
      toast.error('At least one location is required');
      return;
    }

    setFormData(prev => ({
      ...prev,
      brands: [...prev.brands, currentBrand]
    }));

    setCurrentBrand({
      brandName: '',
      brandType: 'BIKE',
      locations: []
    });

    toast.success('Brand added successfully');
  };

  const removeBrand = (index: number) => {
    setFormData(prev => ({
      ...prev,
      brands: prev.brands.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.clientName || !formData.slug || !formData.ownerName) {
      toast.error('Please fill client name, slug, and owner name');
      return;
    }

    if (formData.brands.length === 0) {
      toast.error('Please add at least one brand');
      return;
    }

    setIsSubmitting(true);

    try {
      // Transform data for API
      const apiData = {
        clientName: formData.clientName,
        slug: formData.slug,
        plan: formData.plan,
        ownerName: formData.ownerName,
        ownerPassword: formData.ownerPassword,
        phone: formData.phone,
        gstNumber: formData.gstNumber,
        emailId: formData.emailId,
        address: formData.address,
        firmName: formData.firmName,
        showroomType: formData.showroomType,
        currentFY: formData.currentFY,
        logoUrl: formData.logoUrl,
        brands: formData.brands.map(brand => ({
          brandName: brand.brandName,
          brandType: brand.brandType,
          locations: brand.locations.map(locationName => ({
            locationName,
            address: `${locationName}, ${formData.address}`,
            phone: formData.phone,
            managerName: ''
          }))
        }))
      };

      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData)
      });

      if (response.ok) {
        toast.success('🎉 Client onboarded successfully!');
        onSuccess();
        onClose();
        resetForm();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create client');
      }
    } catch (error: any) {
      console.error('Error creating client:', error);
      toast.error(error.message || 'Failed to create client');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      slug: '',
      plan: 'FREE',
      ownerName: '',
      ownerPassword: '',
      phone: '',
      gstNumber: '',
      emailId: '',
      address: '',
      firmName: '',
      showroomType: 'BIKE',
      currentFY,
      logoUrl: '',
      brands: []
    });
    setCurrentBrand({
      brandName: '',
      brandType: 'BIKE',
      locations: []
    });
  };

  const isValid = formData.clientName && formData.slug && formData.ownerName && formData.brands.length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">🏢 Add New Client - Complete Onboarding</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  placeholder="e.g., Honda Motors Delhi"
                  value={formData.clientName}
                  onChange={(e) => handleClientNameChange(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  placeholder="e.g., honda-delhi"
                  value={formData.slug}
                  onChange={(e) => updateFormData('slug', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ownerName">Owner Name *</Label>
                <Input
                  id="ownerName"
                  placeholder="Dealership owner full name"
                  value={formData.ownerName}
                  onChange={(e) => updateFormData('ownerName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="ownerPassword">Owner Password *</Label>
                <Input
                  id="ownerPassword"
                  type="password"
                  placeholder="Set initial login password"
                  value={formData.ownerPassword}
                  onChange={(e) => updateFormData('ownerPassword', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+91-9876543210"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Business Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firmName">Firm/Company Name</Label>
                <Input
                  id="firmName"
                  placeholder="Legal business name"
                  value={formData.firmName}
                  onChange={(e) => updateFormData('firmName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  placeholder="e.g., 09ABCDE1234F1Z5"
                  value={formData.gstNumber}
                  onChange={(e) => updateFormData('gstNumber', e.target.value.toUpperCase())}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="emailId">Email ID</Label>
              <Input
                id="emailId"
                type="email"
                placeholder="business@example.com"
                value={formData.emailId}
                onChange={(e) => updateFormData('emailId', e.target.value)}
              />
            </div>

            <ImageUpload
              value={formData.logoUrl}
              onChange={(value) => updateFormData('logoUrl', value)}
              disabled={isSubmitting}
            />

            <div>
              <Label htmlFor="address">Business Address</Label>
              <Textarea
                id="address"
                placeholder="Complete address with pincode"
                value={formData.address}
                onChange={(e) => updateFormData('address', e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* System Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">System Configuration</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Subscription Plan</Label>
                <Select value={formData.plan} onValueChange={(value) => updateFormData('plan', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">🆓 Free (₹0/month)</SelectItem>
                    <SelectItem value="PRO">💼 Pro (₹2999/month)</SelectItem>
                    <SelectItem value="ENTERPRISE">🏢 Enterprise (₹9999/month)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Showroom Type</Label>
                <Select value={formData.showroomType} onValueChange={(value) => updateFormData('showroomType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BIKE">🏍️ Two Wheeler</SelectItem>
                    <SelectItem value="CAR">🚗 Four Wheeler</SelectItem>
                    <SelectItem value="EV">⚡ Electric Vehicle</SelectItem>
                    <SelectItem value="MULTI">🔄 Multi-Vehicle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Financial Year</Label>
                <Input value={formData.currentFY} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground mt-1">Auto-selected</p>
              </div>
            </div>
          </div>

          {/* Brands & Locations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">🏷️ Brands & Locations</h3>
            
            {/* Current Brands Display */}
            {formData.brands.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">✅ Added Brands ({formData.brands.length})</h4>
                {formData.brands.map((brand, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-green-600" />
                        <span className="font-medium">{brand.brandName}</span>
                        <Badge variant="secondary">{brand.brandType}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        📍 {brand.locations.join(' • ')}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => removeBrand(index)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Brand Form */}
            <div className="border border-dashed border-gray-300 rounded-lg p-4 space-y-4">
              <h4 className="font-medium">➕ Add New Brand</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Brand Name</Label>
                  <Input
                    placeholder="e.g., KTM, Triumph, Hero"
                    value={currentBrand.brandName}
                    onChange={(e) => setCurrentBrand(prev => ({...prev, brandName: e.target.value}))}
                  />
                </div>
                <div>
                  <Label>Vehicle Type</Label>
                  <Select 
                    value={currentBrand.brandType}
                    onValueChange={(value) => setCurrentBrand(prev => ({...prev, brandType: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BIKE">Two Wheeler</SelectItem>
                      <SelectItem value="CAR">Four Wheeler</SelectItem>
                      <SelectItem value="EV">Electric Vehicle</SelectItem>
                      <SelectItem value="SCOOTER">Scooter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Locations for current brand */}
              {currentBrand.locations.length > 0 && (
                <div>
                  <Label className="text-sm">Locations ({currentBrand.locations.length})</Label>
                  <div className="space-y-1 mt-2">
                    {currentBrand.locations.map((location, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                        <span>📍 {location}</span>
                        <Button size="sm" variant="ghost" onClick={() => removeLocation(index)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Input
                  placeholder="Location name (e.g., Chinhat Branch, Ring Road Branch)"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addLocation()}
                />
                <Button size="sm" onClick={addLocation}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>

              <div className="flex justify-end">
                <Button onClick={addBrand} disabled={!currentBrand.brandName || currentBrand.locations.length === 0} className="bg-blue-600 hover:bg-blue-700">
                  <Building className="h-4 w-4 mr-2" />
                  Add Brand
                </Button>
              </div>
            </div>

            {formData.brands.length === 0 && (
              <div className="text-center py-8 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                <Building className="h-12 w-12 mx-auto text-amber-600 mb-2" />
                <p className="text-amber-800 dark:text-amber-200 font-medium">No brands added yet</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">Add at least one brand to continue</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              📊 {formData.brands.length} brand(s) • {formData.brands.reduce((sum, b) => sum + b.locations.length, 0)} location(s)
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!isValid || isSubmitting} className="bg-green-600 hover:bg-green-700">
                {isSubmitting ? 'Creating Client...' : '🚀 Create Client'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Admin Page ────────────────────────────────────────────────────
export default function AdminPage() {
  const [tenants, setTenants] = React.useState<TenantData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [configClient, setConfigClient] = React.useState<TenantData | null>(null);

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
          <h1 className="text-2xl font-bold">Super Admin Panel</h1>
          <p className="text-muted-foreground text-sm">Multi-tenant client management & onboarding</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchTenants} className="gap-1">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Link href="/admin/ai-config"><Button variant="outline" className="bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700">🧠 AI Config</Button></Link>
          <Link href="/admin/settings"><Button variant="outline"><Settings className="h-4 w-4 mr-2" /> Master Settings</Button></Link>
          <Button onClick={() => setDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" /> 🏢 Add New Client
          </Button>
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
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Vehicles</CardTitle><Bike className="h-4 w-4 text-purple-500" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{tenants.reduce((s, c) => s + (c._count?.vehicles || 0), 0)}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
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
                <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Building2 className="h-12 w-12 text-muted-foreground/50" />
                    <p>Abhi koi client nahi hai</p>
                    <p className="text-sm text-muted-foreground">Naya client add karne ke liye "Add New Client" button dabao</p>
                  </div>
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {configClient && <ClientConfigDialog client={configClient} open={!!configClient} onClose={() => setConfigClient(null)} />}
      
      <EnhancedAddClientDialog 
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={fetchTenants}
      />
    </div>
  );
}