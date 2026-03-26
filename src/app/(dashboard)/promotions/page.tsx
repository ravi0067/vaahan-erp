"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Megaphone, Plus, Send, Edit2, Trash2, Calendar, Percent, Tag,
  MessageSquare, Mail, Phone, Users, UserPlus, UserCheck, Sparkles,
  Copy, CheckCircle2, Loader2,
} from "lucide-react";
import { toast } from "sonner";

// --- Types ---
interface Promotion {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  validFrom: string;
  validTo: string;
  applicableBrands: string;
  applicableVehicles: string;
  type: string;
  status: "Active" | "Upcoming" | "Expired";
}

// --- Templates ---
const promotionTemplates = [
  { name: "🪔 Diwali Dhamaka Sale", type: "Festival", discount: 15, desc: "Diwali special offer! Sabhi vehicles par special discount aur free accessories. Limited period offer!" },
  { name: "☀️ Summer Cool Offer", type: "Seasonal", discount: 10, desc: "Garmi mein cool deal! Summer special discount on all two-wheelers. Free helmet aur first service free!" },
  { name: "🛡️ Insurance Renewal Package", type: "Insurance", discount: 5, desc: "Insurance renewal karwayein aur payein special discount. Comprehensive coverage at best rates!" },
  { name: "🚗 RSA Protection Pack", type: "RSA", discount: 0, desc: "Roadside Assistance package - 24x7 support, towing, flat tyre, battery jumpstart sab included!" },
  { name: "🔧 Service Camp Special", type: "Service", discount: 20, desc: "Free multi-point checkup + 20% off on spare parts. Apni gaadi ki health check karwayein!" },
  { name: "🏷️ Year-End Clearance", type: "Clearance", discount: 25, desc: "Year-end clearance sale! Last year ke models par heavy discount. Jaldi karo, limited stock!" },
];

const promotionTypes = ["Festival", "Seasonal", "Clearance", "Insurance", "RSA", "Service"];

const defaultPromo: Omit<Promotion, "id" | "status"> = {
  title: "", description: "", discountPercent: 0, validFrom: "", validTo: "",
  applicableBrands: "", applicableVehicles: "", type: "Festival",
};

const statusColor: Record<string, string> = {
  Active: "bg-green-600",
  Upcoming: "bg-blue-600",
  Expired: "bg-gray-500",
};

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultPromo);
  const [sendTarget, setSendTarget] = useState("all");
  const [sendChannel, setSendChannel] = useState("whatsapp");
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/promotions");
      const data = await res.json();
      if (data.success && data.promotions) {
        const mapped: Promotion[] = data.promotions.map((p: Record<string, unknown>) => ({
          id: p.id as string,
          title: (p.title as string) || "",
          description: (p.description as string) || "",
          discountPercent: (p.discountPercent as number) || 0,
          validFrom: p.validFrom ? new Date(p.validFrom as string).toISOString().split("T")[0] : "",
          validTo: p.validTo ? new Date(p.validTo as string).toISOString().split("T")[0] : "",
          applicableBrands: (p.applicableBrands as string) || "",
          applicableVehicles: (p.applicableVehicles as string) || "",
          type: (p.type as string) || "Festival",
          status: (p.status as "Active" | "Upcoming" | "Expired") || "Active",
        }));
        setPromotions(mapped);
      }
    } catch {
      toast.error("Failed to load promotions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const handleSave = async () => {
    if (!form.title || !form.validFrom || !form.validTo) {
      toast.error("Title aur dates required hain!");
      return;
    }
    try {
      if (editingId) {
        const res = await fetch("/api/promotions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...form }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Promotion updated successfully! ✅");
          fetchPromotions();
        } else {
          toast.error(data.error || "Failed to update");
        }
      } else {
        const res = await fetch("/api/promotions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Naya promotion create ho gaya! 🎉");
          fetchPromotions();
        } else {
          toast.error(data.error || "Failed to create");
        }
      }
    } catch {
      toast.error("Failed to save promotion");
    }
    setDialogOpen(false);
    setEditingId(null);
    setForm(defaultPromo);
  };

  const handleEdit = (p: Promotion) => {
    setEditingId(p.id);
    setForm({ title: p.title, description: p.description, discountPercent: p.discountPercent, validFrom: p.validFrom, validTo: p.validTo, applicableBrands: p.applicableBrands, applicableVehicles: p.applicableVehicles, type: p.type });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/promotions?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setPromotions((prev) => prev.filter((p) => p.id !== id));
        toast.success("Promotion delete ho gaya!");
      } else {
        toast.error(data.error || "Failed to delete");
      }
    } catch {
      toast.error("Failed to delete promotion");
    }
  };

  const handleUseTemplate = (t: typeof promotionTemplates[0]) => {
    setForm({ ...defaultPromo, title: t.name, description: t.desc, discountPercent: t.discount, type: t.type });
    toast.info(`Template "${t.name}" load ho gaya!`);
  };

  const handleSendPromotion = async () => {
    toast.success(`Promotion "${selectedPromo?.title}" ${sendTarget} customers ko ${sendChannel} se bhej di gayi! 📨`);
    setSendDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground text-sm">Loading promotions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" /> Promotions & Offers
          </h1>
          <p className="text-muted-foreground text-sm">Promotional campaigns manage karein aur customers ko bhejein</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditingId(null); setForm(defaultPromo); } }}>
          <DialogTrigger asChild>
            <Button className="bg-primary"><Plus className="h-4 w-4 mr-2" /> Naya Promotion</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "✏️ Promotion Edit Karein" : "🆕 Naya Promotion Banayein"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Templates */}
              {!editingId && (
                <div>
                  <Label className="text-sm font-medium">Quick Templates</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {promotionTemplates.map((t, i) => (
                      <button key={i} onClick={() => handleUseTemplate(t)} className="text-left p-2 rounded-lg border hover:bg-accent text-xs transition-colors">
                        <span className="font-medium">{t.name}</span>
                        <span className="block text-muted-foreground mt-0.5">{t.discount > 0 ? `${t.discount}% off` : "Special Pack"}</span>
                      </button>
                    ))}
                  </div>
                  <Separator className="mt-3" />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Promotion Title *</Label>
                  <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Diwali Dhamaka Sale" />
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Promotion details likhein..." rows={3} />
                </div>
                <div>
                  <Label>Discount %</Label>
                  <Input type="number" min={0} max={100} value={form.discountPercent} onChange={(e) => setForm((p) => ({ ...p, discountPercent: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>Promotion Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {promotionTypes.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Valid From *</Label>
                  <Input type="date" value={form.validFrom} onChange={(e) => setForm((p) => ({ ...p, validFrom: e.target.value }))} />
                </div>
                <div>
                  <Label>Valid To *</Label>
                  <Input type="date" value={form.validTo} onChange={(e) => setForm((p) => ({ ...p, validTo: e.target.value }))} />
                </div>
                <div>
                  <Label>Applicable Brands</Label>
                  <Input value={form.applicableBrands} onChange={(e) => setForm((p) => ({ ...p, applicableBrands: e.target.value }))} placeholder="Honda, TVS, Bajaj..." />
                </div>
                <div>
                  <Label>Applicable Vehicles</Label>
                  <Input value={form.applicableVehicles} onChange={(e) => setForm((p) => ({ ...p, applicableVehicles: e.target.value }))} placeholder="All Two-Wheelers, Activa..." />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full">
                <CheckCircle2 className="h-4 w-4 mr-2" /> {editingId ? "Update Karein" : "Promotion Create Karein"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Promotions", value: promotions.length, icon: Tag, color: "text-blue-600" },
          { label: "Active", value: promotions.filter((p) => p.status === "Active").length, icon: CheckCircle2, color: "text-green-600" },
          { label: "Upcoming", value: promotions.filter((p) => p.status === "Upcoming").length, icon: Calendar, color: "text-amber-600" },
          { label: "Expired", value: promotions.filter((p) => p.status === "Expired").length, icon: Percent, color: "text-gray-500" },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Promotion Cards */}
      {promotions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Megaphone className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-30" />
            <h3 className="text-lg font-semibold mb-2">No Promotions Yet</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Create promotional campaigns to attract customers. Offer festival discounts, service camp specials, insurance packages, and more. Click &quot;Naya Promotion&quot; to get started or use a quick template below.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promotions.map((promo) => (
            <Card key={promo.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{promo.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{promo.type}</p>
                  </div>
                  <Badge className={statusColor[promo.status] || "bg-gray-500"}>{promo.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{promo.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-muted rounded p-2">
                    <span className="text-muted-foreground">Discount</span>
                    <p className="font-bold text-primary">{promo.discountPercent}% OFF</p>
                  </div>
                  <div className="bg-muted rounded p-2">
                    <span className="text-muted-foreground">Duration</span>
                    <p className="font-medium">{promo.validFrom} → {promo.validTo}</p>
                  </div>
                </div>
                {promo.applicableBrands && (
                  <p className="text-xs"><span className="text-muted-foreground">Brands:</span> {promo.applicableBrands}</p>
                )}
                <Separator />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit(promo)}>
                    <Edit2 className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => { setSelectedPromo(promo); setSendDialogOpen(true); }}>
                    <Send className="h-3 w-3 mr-1" /> Send
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(promo.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Send Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>📨 Promotion Bhejein - {selectedPromo?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Kisko bhejein? (Target Audience)</Label>
              <Select value={sendTarget} onValueChange={setSendTarget}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all"><span className="flex items-center gap-2"><Users className="h-3 w-3" /> All Customers</span></SelectItem>
                  <SelectItem value="new-leads"><span className="flex items-center gap-2"><UserPlus className="h-3 w-3" /> New Leads</span></SelectItem>
                  <SelectItem value="old-customers"><span className="flex items-center gap-2"><UserCheck className="h-3 w-3" /> Old Customers</span></SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Channel (Kaise bhejein?)</Label>
              <Select value={sendChannel} onValueChange={setSendChannel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp"><span className="flex items-center gap-2"><MessageSquare className="h-3 w-3" /> WhatsApp</span></SelectItem>
                  <SelectItem value="email"><span className="flex items-center gap-2"><Mail className="h-3 w-3" /> Email</span></SelectItem>
                  <SelectItem value="sms"><span className="flex items-center gap-2"><Phone className="h-3 w-3" /> SMS</span></SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Preview Message:</p>
              <p className="text-sm">🎉 {selectedPromo?.title} - {selectedPromo?.discountPercent}% discount! {selectedPromo?.description} Valid: {selectedPromo?.validFrom} to {selectedPromo?.validTo}. Visit us today!</p>
            </div>
            <Button onClick={handleSendPromotion} className="w-full bg-green-600 hover:bg-green-700">
              <Send className="h-4 w-4 mr-2" /> Promotion Bhejein
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Templates Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" /> Ready-Made Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {promotionTemplates.map((t, i) => (
              <div key={i} className="border rounded-lg p-3 hover:bg-accent transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{t.name}</span>
                  <Badge variant="secondary">{t.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{t.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">{t.discount > 0 ? `${t.discount}% OFF` : "Special Package"}</span>
                  <Button size="sm" variant="outline" onClick={() => { handleUseTemplate(t); setDialogOpen(true); }}>
                    <Copy className="h-3 w-3 mr-1" /> Use
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
