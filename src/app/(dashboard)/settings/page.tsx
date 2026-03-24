"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Upload, AlertTriangle, HelpCircle, AlertCircle, Building, MapPin, Store } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useShowroomStore } from "@/store/showroom-store";
import { showroomConfig, showroomTypeDescriptions, type ShowroomType } from "@/lib/showroom-config";
import { usePermissionsStore, ALL_MODULES, type ModuleKey } from "@/store/permissions-store";
import { useWhatsAppBotStore, type BotContact } from "@/store/whatsapp-bot-store";

// ── Showroom Type Settings ──────────────────────────────────────────────────
function ShowroomTypeSettings() {
  const { showroomType, setShowroomType } = useShowroomStore();
  const [saved, setSaved] = React.useState(false);
  const types: ShowroomType[] = ["BIKE", "CAR", "EV", "MULTI"];

  const handleChange = (type: ShowroomType) => {
    setShowroomType(type);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Showroom Type</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 rounded-lg p-3">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p className="text-sm">
            Changing showroom type will update UI labels and vehicle fields across the system.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {types.map((type) => {
            const c = showroomConfig[type];
            const isActive = type === showroomType;
            return (
              <button
                key={type}
                onClick={() => handleChange(type)}
                className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all text-center ${
                  isActive
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30"
                    : "border-muted hover:border-primary/30 hover:bg-muted/50"
                }`}
              >
                <span className="text-3xl">{c.emoji}</span>
                <span className="text-sm font-semibold">{c.label}</span>
                <span className="text-[11px] text-muted-foreground leading-tight">{showroomTypeDescriptions[type]}</span>
              </button>
            );
          })}
        </div>
        {saved && (
          <p className="text-sm text-green-600 font-medium">✅ Showroom type updated!</p>
        )}
      </CardContent>
    </Card>
  );
}

// ── General Settings ───────────────────────────────────────────────────────
function GeneralSettings() {
  return (
    <Card>
      <CardHeader><CardTitle>General Information</CardTitle></CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label>Dealership Name</Label>
          <Input defaultValue="Ravi Accounting Services" />
        </div>
        <div className="grid gap-2">
          <Label>Address</Label>
          <Input defaultValue="Chinhat, Gomti Nagar, Lucknow 226028" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Phone</Label>
            <Input defaultValue="+91 9554762008" />
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input defaultValue="raviverma0067@gmail.com" />
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

        <Separator className="my-4" />

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
            <p className="font-medium text-sm">Support Contact</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Need help? Visit our Help &amp; Support page for FAQs, contact info, and bug reporting.
          </p>
          <Link href="/help">
            <Button variant="outline" size="sm" className="mt-1">
              <HelpCircle className="h-4 w-4 mr-2" /> Go to Help &amp; Support
            </Button>
          </Link>
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

// ── Brand Management ────────────────────────────────────────────────────────
function BrandManagementSettings() {
  const [brands, setBrands] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [newBrand, setNewBrand] = React.useState({ brandName: '', brandType: 'BIKE', logoUrl: '' });
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands');
      if (!response.ok) {
        setBrands([]);
        return;
      }
      const data = await response.json();
      setBrands(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBrand = async () => {
    if (!newBrand.brandName.trim()) return;
    setSubmitting(true);
    try {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBrand)
      });
      if (response.ok) {
        await fetchBrands();
        setNewBrand({ brandName: '', brandType: 'BIKE', logoUrl: '' });
        setShowAddDialog(false);
      }
    } catch (error) {
      console.error('Error adding brand:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    try {
      await fetch(`/api/brands?id=${brandId}`, { method: 'DELETE' });
      await fetchBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
    }
  };

  if (loading) {
    return <Card><CardContent className="p-6 text-center text-muted-foreground">Loading brands...</CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Your Dealership Brands</h3>
          <p className="text-sm text-muted-foreground">Add brands like KTM, Hero, Triumph to organize your inventory</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Brand
        </Button>
      </div>

      {/* Add Brand Inline Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Brand</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Brand Name *</Label>
              <Input placeholder="e.g. KTM, Triumph, Hero" value={newBrand.brandName} onChange={(e) => setNewBrand({...newBrand, brandName: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Vehicle Type</Label>
              <select className="w-full h-9 px-3 rounded-md border bg-background text-sm" value={newBrand.brandType} onChange={(e) => setNewBrand({...newBrand, brandType: e.target.value})}>
                <option value="BIKE">🏍️ Two Wheeler (Bike)</option>
                <option value="CAR">🚗 Four Wheeler (Car)</option>
                <option value="EV">⚡ Electric Vehicle</option>
                <option value="SCOOTER">🛵 Scooter</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Logo URL (Optional)</Label>
              <Input placeholder="https://example.com/logo.png" value={newBrand.logoUrl} onChange={(e) => setNewBrand({...newBrand, logoUrl: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddBrand} disabled={submitting || !newBrand.brandName.trim()}>
              {submitting ? 'Adding...' : 'Add Brand'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Brand List */}
      {brands.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Brands Added</h3>
            <p className="text-muted-foreground mb-4 text-sm">Add your dealership brands so vehicle dropdowns show only your inventory</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Your First Brand
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {brands.map((brand) => (
            <Card key={brand.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{brand.brandName}</p>
                      <p className="text-xs text-muted-foreground">
                        {brand.brandType} • {brand._count?.vehicles || 0} vehicles • {brand.showroomLocations?.length || 0} locations
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteBrand(brand.id)} className="text-red-500 h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
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

// ── Permissions Settings ───────────────────────────────────────────────────
function PermissionsSettings() {
  const { rolePermissions, setRolePermissions, resetToDefaults } = usePermissionsStore();
  const [selectedRole, setSelectedRole] = React.useState("MANAGER");
  const [saved, setSaved] = React.useState(false);
  
  const editableRoles = ["MANAGER", "SALES_EXEC", "ACCOUNTANT", "MECHANIC", "VIEWER"];
  
  const currentPerms = rolePermissions[selectedRole] || [];
  
  const toggleModule = (moduleKey: string) => {
    if (moduleKey === "dashboard" || moduleKey === "help") return;
    
    const updated = currentPerms.includes(moduleKey)
      ? currentPerms.filter((k) => k !== moduleKey)
      : [...currentPerms, moduleKey];
    
    setRolePermissions(selectedRole, updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  
  const roleLabels: Record<string, string> = {
    MANAGER: "🧑‍💼 Manager",
    SALES_EXEC: "💼 Sales Executive",
    ACCOUNTANT: "🧮 Accountant", 
    MECHANIC: "🔧 Mechanic",
    VIEWER: "👁️ Viewer",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>User Role Permissions</CardTitle>
          <Button variant="outline" size="sm" onClick={() => { resetToDefaults(); setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
            Reset to Defaults
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Control which modules each role can access. Owner always has full access.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Role Selector */}
        <div className="flex flex-wrap gap-2">
          {editableRoles.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedRole === role
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {roleLabels[role] || role}
            </button>
          ))}
        </div>
        
        <Separator />
        
        {/* Module Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ALL_MODULES.map((mod) => {
            const isEnabled = currentPerms.includes(mod.key);
            const isLocked = mod.key === "dashboard" || mod.key === "help";
            
            return (
              <button
                key={mod.key}
                onClick={() => toggleModule(mod.key)}
                disabled={isLocked}
                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                  isLocked
                    ? "bg-muted/50 border-muted cursor-not-allowed opacity-60"
                    : isEnabled
                    ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 opacity-70"
                }`}
              >
                <span className="text-xl">{mod.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{mod.label}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{mod.description}</p>
                </div>
                <span className="text-sm shrink-0">
                  {isLocked ? "🔒" : isEnabled ? "✅" : "❌"}
                </span>
              </button>
            );
          })}
        </div>
        
        {saved && (
          <p className="text-sm text-green-600 font-medium">✅ Permissions saved for {roleLabels[selectedRole]}!</p>
        )}
        
        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Note:</strong> Dashboard and Help are always accessible. Owner has full access and cannot be restricted.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── WhatsApp Bot Settings ──────────────────────────────────────────────────
function WhatsAppBotSettings() {
  const { isEnabled, setEnabled, contacts, addContact, removeContact, updateContact } = useWhatsAppBotStore();
  const [newName, setNewName] = React.useState("");
  const [newPhone, setNewPhone] = React.useState("");
  const [newRole, setNewRole] = React.useState<BotContact["role"]>("MANAGER");
  const [saved, setSaved] = React.useState(false);

  const roleOptions: { value: BotContact["role"]; label: string; emoji: string; desc: string }[] = [
    { value: "OWNER", label: "Owner", emoji: "👑", desc: "Full dealership access via bot" },
    { value: "MANAGER", label: "Manager", emoji: "🧑‍💼", desc: "Operations, bookings, leads, reports" },
    { value: "SERVICE_MANAGER", label: "Service Manager", emoji: "🔧", desc: "Service jobs, mechanic management" },
    { value: "SALES_EXEC", label: "Sales Executive", emoji: "💼", desc: "Leads, bookings, stock" },
    { value: "ACCOUNTANT", label: "Accountant", emoji: "🧮", desc: "Cashflow, expenses, reports" },
  ];

  const handleAdd = () => {
    if (!newName.trim() || !newPhone.trim() || !newPhone.match(/^\d{10}$/)) return;
    addContact({ phone: newPhone, name: newName.trim(), role: newRole, isActive: true });
    setNewName("");
    setNewPhone("");
    setNewRole("MANAGER");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>📱 WhatsApp Bot Configuration</CardTitle>
          <Button
            variant={isEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setEnabled(!isEnabled)}
            className={isEnabled ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isEnabled ? "✅ Bot Active" : "❌ Bot Inactive"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Register phone numbers for your team. The bot identifies callers by number and responds with role-appropriate access.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* How it works */}
        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 space-y-2">
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">💡 How WhatsApp Bot Works:</p>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li><strong>Owner</strong> — Full dealership data: sales, reports, cashflow, all operations</li>
            <li><strong>Manager</strong> — Operations data: bookings, leads, stock, service, reports</li>
            <li><strong>Service Manager</strong> — Service jobs, mechanic status, parts inventory</li>
            <li><strong>Sales Exec</strong> — Lead updates, booking status, stock availability</li>
            <li><strong>Accountant</strong> — Cashflow, expenses, payment status, reports</li>
            <li>🔒 <strong>Super Admin</strong> access is default and cannot be assigned to others</li>
          </ul>
        </div>

        {/* Add New Contact */}
        <div className="border rounded-lg p-4 space-y-3">
          <p className="text-sm font-semibold">Add Team Member</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Name</Label>
              <Input placeholder="e.g. Rahul Sharma" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">WhatsApp Number (10 digits)</Label>
              <Input placeholder="9876543210" value={newPhone} onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} maxLength={10} />
            </div>
            <div>
              <Label className="text-xs">Role</Label>
              <select 
                className="w-full h-9 px-3 rounded-md border bg-background text-sm"
                value={newRole} 
                onChange={(e) => setNewRole(e.target.value as BotContact["role"])}
              >
                {roleOptions.map(r => (
                  <option key={r.value} value={r.value}>{r.emoji} {r.label}</option>
                ))}
              </select>
            </div>
          </div>
          <Button onClick={handleAdd} size="sm" disabled={!newName.trim() || !newPhone.match(/^\d{10}$/)}>
            <Plus className="h-4 w-4 mr-1" /> Add Contact
          </Button>
        </div>

        {/* Registered Contacts */}
        {contacts.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Registered Team ({contacts.length})</p>
            {contacts.map((contact) => {
              const roleInfo = roleOptions.find(r => r.value === contact.role);
              return (
                <div key={contact.phone} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{roleInfo?.emoji || "👤"}</span>
                    <div>
                      <p className="text-sm font-medium">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">+91 {contact.phone} • {roleInfo?.label || contact.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateContact(contact.phone, { isActive: !contact.isActive })}
                      className={contact.isActive ? "text-green-600" : "text-red-600"}
                    >
                      {contact.isActive ? "Active" : "Inactive"}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => removeContact(contact.phone)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {contacts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No team members registered yet.</p>
            <p className="text-xs">Add your Owner, Manager, and Service Manager numbers above.</p>
          </div>
        )}

        {saved && (
          <p className="text-sm text-green-600 font-medium">✅ WhatsApp Bot settings saved!</p>
        )}

        {/* Security Notice */}
        <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-3 flex gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Security:</strong> The bot will ONLY respond to registered numbers. Unknown numbers get a generic &quot;Contact your dealership&quot; message. Super Admin features are never exposed to any client role.
          </div>
        </div>
      </CardContent>
    </Card>
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
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="brands">Brands & Locations</TabsTrigger>
          <TabsTrigger value="expense-heads">Expense Heads</TabsTrigger>
          <TabsTrigger value="banks">Banks</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="financial-year">Financial Year</TabsTrigger>
          <TabsTrigger value="whatsapp-bot">WhatsApp Bot</TabsTrigger>
        </TabsList>

        <TabsContent value="general"><GeneralSettings /></TabsContent>
        <TabsContent value="permissions"><PermissionsSettings /></TabsContent>
        <TabsContent value="brands"><BrandManagementSettings /></TabsContent>
        <TabsContent value="expense-heads"><ExpenseHeads /></TabsContent>
        <TabsContent value="banks"><BankSettings /></TabsContent>
        <TabsContent value="locations"><LocationSettings /></TabsContent>
        <TabsContent value="financial-year"><FinancialYearSettings /></TabsContent>
        <TabsContent value="whatsapp-bot"><WhatsAppBotSettings /></TabsContent>
      </Tabs>
    </div>
  );
}
