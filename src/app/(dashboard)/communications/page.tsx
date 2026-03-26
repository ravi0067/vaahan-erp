"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Phone, MessageSquare, Mail, Bell, Send, Plus, Calendar, Clock,
  CheckCircle2, XCircle, AlertTriangle, PhoneCall, PhoneForwarded,
  PhoneMissed, Shield, Wrench, Megaphone, Users, Settings, Trash2,
  Volume2, Loader2,
} from "lucide-react";
import { toast } from "sonner";

// --- Types ---
interface CallEntry {
  id: string;
  customerName: string;
  phone: string;
  purpose: string;
  status: "Completed" | "Scheduled" | "Missed" | "Rescheduled";
  scheduledAt: string;
  notes: string;
}

interface NotificationEntry {
  id: string;
  message: string;
  type: string;
  time: string;
  read: boolean;
}

const callTemplates = [
  { name: "Insurance Expiry Reminder", icon: Shield, script: "Namaste {name} ji, main {dealership} se bol raha hoon. Aapki {vehicle} ka insurance {date} ko expire ho raha hai. Kya aap renewal karwana chahenge? Hamare paas special rates hain." },
  { name: "Service Due Reminder", icon: Wrench, script: "Namaste {name} ji, aapki {vehicle} ka {service_type} service due hai. Kya aap appointment book karna chahenge? Abhi service camp chal raha hai with 20% discount." },
  { name: "Promotional Call", icon: Megaphone, script: "Namaste {name} ji, {dealership} se bol raha hoon. Hamare yahan {promo_name} chal raha hai - {discount}% tak discount! Kya aap showroom visit kar sakte hain?" },
  { name: "Follow-up Call", icon: PhoneForwarded, script: "Namaste {name} ji, aapne pichle hafte {vehicle} ke baare mein inquiry ki thi. Kya aap abhi bhi interested hain? Hamare paas naye offers hain." },
];

const callStatusConfig: Record<string, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  Completed: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
  Scheduled: { icon: Clock, color: "text-blue-600", bg: "bg-blue-100" },
  Missed: { icon: PhoneMissed, color: "text-red-600", bg: "bg-red-100" },
  Rescheduled: { icon: PhoneForwarded, color: "text-amber-600", bg: "bg-amber-100" },
};

const notifTypeConfig: Record<string, { color: string; icon: typeof Shield }> = {
  insurance: { color: "bg-red-100 text-red-700", icon: Shield },
  service: { color: "bg-blue-100 text-blue-700", icon: Wrench },
  promo: { color: "bg-green-100 text-green-700", icon: Megaphone },
  general: { color: "bg-gray-100 text-gray-700", icon: Bell },
  call: { color: "bg-blue-100 text-blue-700", icon: PhoneCall },
  whatsapp: { color: "bg-green-100 text-green-700", icon: MessageSquare },
  email: { color: "bg-purple-100 text-purple-700", icon: Mail },
  sms: { color: "bg-gray-100 text-gray-700", icon: Send },
};

export default function CommunicationsPage() {
  const [calls, setCalls] = useState<CallEntry[]>([]);
  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof callTemplates[0] | null>(null);
  const [newCall, setNewCall] = useState({ customerName: "", phone: "", purpose: "Insurance Expiry Reminder", scheduledAt: "", notes: "" });

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState({
    whatsapp: true, email: true, sms: false, push: true,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [callsRes, notifsRes] = await Promise.all([
        fetch("/api/communications"),
        fetch("/api/communications?type=notifications"),
      ]);
      const callsData = await callsRes.json();
      const notifsData = await notifsRes.json();

      if (callsData.success && callsData.calls) {
        const mapped: CallEntry[] = callsData.calls.map((c: Record<string, unknown>) => ({
          id: c.id as string,
          customerName: c.customerName as string,
          phone: (c.phone as string) || "",
          purpose: (c.purpose as string) || "",
          status: (c.status as string) || "Scheduled",
          scheduledAt: c.scheduledAt ? new Date(c.scheduledAt as string).toLocaleString("en-IN") : "",
          notes: (c.notes as string) || "",
        }));
        setCalls(mapped);
      }

      if (notifsData.success && notifsData.notifications) {
        setNotifications(notifsData.notifications.map((n: Record<string, unknown>) => ({
          id: n.id as string,
          message: n.message as string,
          type: (n.type as string) || "general",
          time: n.time ? new Date(n.time as string).toLocaleString("en-IN") : "",
          read: n.read as boolean,
        })));
      }
    } catch {
      toast.error("Failed to load communications data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleScheduleCall = async () => {
    if (!newCall.customerName || !newCall.phone || !newCall.scheduledAt) {
      toast.error("Customer name, phone aur time required hai!");
      return;
    }
    try {
      const res = await fetch("/api/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "schedule-call",
          customerName: newCall.customerName,
          phone: newCall.phone,
          purpose: newCall.purpose,
          scheduledAt: newCall.scheduledAt,
          notes: newCall.notes,
          channel: "call",
          direction: "outbound",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Call scheduled for ${newCall.customerName}! 📞`);
        setScheduleOpen(false);
        setNewCall({ customerName: "", phone: "", purpose: "Insurance Expiry Reminder", scheduledAt: "", notes: "" });
        fetchData();
      } else {
        toast.error(data.error || "Failed to schedule call");
      }
    } catch {
      toast.error("Failed to schedule call");
    }
  };

  const handleDeleteCall = async (id: string) => {
    try {
      const res = await fetch(`/api/communications?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setCalls((prev) => prev.filter((c) => c.id !== id));
        toast.success("Call entry delete ho gayi!");
      } else {
        toast.error(data.error || "Failed to delete");
      }
    } catch {
      toast.error("Failed to delete call");
    }
  };

  const markNotifRead = async (id: string) => {
    try {
      const res = await fetch("/api/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark-read", id }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
      }
    } catch {
      // silently fail for mark-read
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground text-sm">Loading communications...</p>
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
            <Phone className="h-6 w-6 text-primary" /> Communication Center
          </h1>
          <p className="text-muted-foreground text-sm">Calls, messages aur notifications ek jagah manage karein</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge className="bg-red-600">{unreadCount} Unread Notifications</Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Today's Calls", value: calls.filter((c) => c.status === "Scheduled").length, icon: PhoneCall, color: "text-blue-600" },
          { label: "Completed", value: calls.filter((c) => c.status === "Completed").length, icon: CheckCircle2, color: "text-green-600" },
          { label: "Missed", value: calls.filter((c) => c.status === "Missed").length, icon: PhoneMissed, color: "text-red-600" },
          { label: "Rescheduled", value: calls.filter((c) => c.status === "Rescheduled").length, icon: PhoneForwarded, color: "text-amber-600" },
          { label: "Notifications", value: unreadCount, icon: Bell, color: "text-purple-600" },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-7 w-7 ${s.color}`} />
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="calls" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full max-w-xl">
          <TabsTrigger value="calls" className="flex items-center gap-1"><PhoneCall className="h-3 w-3" /> Calls</TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> WhatsApp</TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-1"><Mail className="h-3 w-3" /> Email</TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-1"><Send className="h-3 w-3" /> SMS</TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1 relative">
            <Bell className="h-3 w-3" /> Notif
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">{unreadCount}</span>}
          </TabsTrigger>
        </TabsList>

        {/* CALLS TAB */}
        <TabsContent value="calls" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> Schedule New Call</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>📞 Nayi Call Schedule Karein</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Customer Name *</Label>
                    <Input value={newCall.customerName} onChange={(e) => setNewCall((p) => ({ ...p, customerName: e.target.value }))} placeholder="Customer ka naam" />
                  </div>
                  <div>
                    <Label>Phone Number *</Label>
                    <Input value={newCall.phone} onChange={(e) => setNewCall((p) => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <Label>Call Purpose</Label>
                    <Select value={newCall.purpose} onValueChange={(v) => setNewCall((p) => ({ ...p, purpose: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Insurance Expiry Reminder">🛡️ Insurance Expiry Reminder</SelectItem>
                        <SelectItem value="Service Due Reminder">🔧 Service Due Reminder</SelectItem>
                        <SelectItem value="Promotional Call">📢 Promotional Call</SelectItem>
                        <SelectItem value="Follow-up Call">📞 Follow-up Call</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Schedule Date & Time *</Label>
                    <Input type="datetime-local" value={newCall.scheduledAt} onChange={(e) => setNewCall((p) => ({ ...p, scheduledAt: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea value={newCall.notes} onChange={(e) => setNewCall((p) => ({ ...p, notes: e.target.value }))} placeholder="Call ke baare mein notes..." rows={2} />
                  </div>
                  <Button onClick={handleScheduleCall} className="w-full"><Calendar className="h-4 w-4 mr-2" /> Schedule Karein</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><Volume2 className="h-4 w-4 mr-2" /> Call Scripts / Templates</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>📋 Call Templates & Scripts</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  {callTemplates.map((t, i) => (
                    <Card key={i} className={`cursor-pointer hover:shadow-md transition-shadow ${selectedTemplate?.name === t.name ? "ring-2 ring-primary" : ""}`} onClick={() => setSelectedTemplate(t)}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <t.icon className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">{t.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground bg-muted rounded p-2">{t.script}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={() => toast.info("Auto-call feature coming soon! Insurance expiry wale customers automatically detect honge.")}>
              <Shield className="h-4 w-4 mr-2" /> Auto-Detect Insurance Expiry
            </Button>
          </div>

          {/* Call Log Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">📞 Call Log</CardTitle>
            </CardHeader>
            <CardContent>
              {calls.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <PhoneCall className="h-12 w-12 mb-3 opacity-30" />
                  <h3 className="text-lg font-semibold mb-1">No calls scheduled yet</h3>
                  <p className="text-sm text-center max-w-md">Schedule calls to follow up with customers about insurance renewals, service reminders, or promotions. Click &quot;Schedule New Call&quot; to get started.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calls.map((call) => {
                      const cfg = callStatusConfig[call.status] || callStatusConfig["Scheduled"];
                      const StatusIcon = cfg.icon;
                      return (
                        <TableRow key={call.id}>
                          <TableCell className="font-medium">{call.customerName}</TableCell>
                          <TableCell className="text-xs">{call.phone}</TableCell>
                          <TableCell><Badge variant="secondary" className="text-xs">{call.purpose}</Badge></TableCell>
                          <TableCell className="text-xs">{call.scheduledAt}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                              <StatusIcon className="h-3 w-3" /> {call.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{call.notes}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteCall(call.id)}>
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* WHATSAPP TAB */}
        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-green-600" /> WhatsApp Messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-200">💬 WhatsApp Business API connected karein Settings → AI Bot Config mein. Uske baad yahan se bulk messages, templates aur auto-replies manage kar sakte hain.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: "Bulk Promotion Message", desc: "Sabhi customers ko ek saath promo bhejein", icon: Users },
                  { title: "Payment Reminder", desc: "Pending payment wale customers ko remind karein", icon: AlertTriangle },
                  { title: "Delivery Update", desc: "Vehicle ready hone par customer ko notify karein", icon: CheckCircle2 },
                ].map((item, i) => (
                  <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => toast.info(`${item.title} feature - WhatsApp API configure karein pehle!`)}>
                    <CardContent className="p-4 text-center">
                      <item.icon className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EMAIL TAB */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-blue-600" /> Email Communications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">📧 Email integration se invoices, booking confirmations, aur promotional emails automatically bhejein.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: "Booking Confirmation", desc: "Naye booking par auto-email bhejein", icon: CheckCircle2 },
                  { title: "Invoice Email", desc: "Payment ke baad invoice email karein", icon: Mail },
                  { title: "Promotion Blast", desc: "Email campaign bhejein sabhi customers ko", icon: Megaphone },
                ].map((item, i) => (
                  <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => toast.info(`${item.title} - Email setup Settings mein configure karein!`)}>
                    <CardContent className="p-4 text-center">
                      <item.icon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS TAB */}
        <TabsContent value="sms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Send className="h-5 w-5 text-purple-600" /> SMS Messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-4">
                <p className="text-sm text-purple-800 dark:text-purple-200">📱 SMS gateway integrate karein for payment reminders, OTP, aur quick notifications. DLT registration required hai.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: "Payment Reminder SMS", desc: "Pending payment ke liye SMS bhejein", icon: AlertTriangle },
                  { title: "Delivery Notification", desc: "Vehicle ready hone par SMS alert", icon: CheckCircle2 },
                  { title: "Service Reminder", desc: "Service due hone par yaad dilayein", icon: Wrench },
                ].map((item, i) => (
                  <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => toast.info(`${item.title} - SMS gateway Settings mein configure karein!`)}>
                    <CardContent className="p-4 text-center">
                      <item.icon className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICATIONS TAB */}
        <TabsContent value="notifications" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Notifications List */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">🔔 Manager / Owner Notifications</h3>
                {notifications.some((n) => !n.read) && (
                  <Button size="sm" variant="outline" onClick={() => {
                    notifications.filter((n) => !n.read).forEach((n) => markNotifRead(n.id));
                    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                    toast.success("Sab notifications read mark ho gaye!");
                  }}>
                    Sab Read Karein
                  </Button>
                )}
              </div>
              {notifications.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-30" />
                    <h3 className="text-lg font-semibold mb-1">No notifications</h3>
                    <p className="text-sm text-muted-foreground">Notifications will appear here as communication activities happen — calls scheduled, completed, or missed.</p>
                  </CardContent>
                </Card>
              ) : (
                notifications.map((notif) => {
                  const cfg = notifTypeConfig[notif.type] || notifTypeConfig["general"];
                  const NIcon = cfg.icon;
                  return (
                    <Card key={notif.id} className={`cursor-pointer transition-all ${!notif.read ? "border-l-4 border-l-primary shadow-md" : "opacity-75"}`} onClick={() => markNotifRead(notif.id)}>
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cfg.color}`}>
                          <NIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notif.read ? "font-medium" : ""}`}>{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                        </div>
                        {!notif.read && <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-2" />}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4" /> Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">Choose karein ki notifications kahan receive karni hain:</p>
                {[
                  { key: "whatsapp" as const, label: "WhatsApp Notifications", icon: MessageSquare },
                  { key: "email" as const, label: "Email Notifications", icon: Mail },
                  { key: "sms" as const, label: "SMS Notifications", icon: Send },
                  { key: "push" as const, label: "Push Notifications", icon: Bell },
                ].map((pref) => (
                  <label key={pref.key} className="flex items-center justify-between cursor-pointer">
                    <span className="flex items-center gap-2 text-sm">
                      <pref.icon className="h-4 w-4 text-muted-foreground" />
                      {pref.label}
                    </span>
                    <input
                      type="checkbox"
                      checked={notifPrefs[pref.key]}
                      onChange={(e) => setNotifPrefs((p) => ({ ...p, [pref.key]: e.target.checked }))}
                      className="w-4 h-4"
                    />
                  </label>
                ))}
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-medium">Auto-Notifications:</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>✅ Insurance expiry alerts (7 din pehle)</p>
                    <p>✅ Service due reminders (har 3/6 months)</p>
                    <p>✅ Promotion campaign status updates</p>
                    <p>✅ New lead notifications</p>
                    <p>✅ Payment received confirmations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
