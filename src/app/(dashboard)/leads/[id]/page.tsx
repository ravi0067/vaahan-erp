"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, Phone, Mail, MapPin, Calendar, Clock, User, MessageSquare,
  PhoneCall, PhoneIncoming, PhoneMissed, Send, FileText, CheckCircle2,
  AlertCircle, Flame, Sun, Snowflake, ArrowRightCircle, Plus, RefreshCw,
  Globe, Loader2, Bell, Edit3, Save, X,
} from "lucide-react";
import { apiGet, apiPut, apiPost } from "@/lib/api";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────
interface LeadDetail {
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
  updatedAt: string;
}

interface TimelineItem {
  id: string;
  action: string;
  channel?: string;
  direction?: string;
  message?: string;
  metadata?: any;
  createdBy?: string;
  createdAt: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ── Constants ──────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["NEW", "CONTACTED", "FOLLOWUP", "CONVERTED", "LOST"];
const HEALTH_OPTIONS = ["HOT", "WARM", "COLD"];

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  NEW: { color: "bg-green-100 text-green-700 border-green-300", icon: <Plus className="w-3 h-3" /> },
  CONTACTED: { color: "bg-blue-100 text-blue-700 border-blue-300", icon: <Phone className="w-3 h-3" /> },
  FOLLOWUP: { color: "bg-purple-100 text-purple-700 border-purple-300", icon: <Clock className="w-3 h-3" /> },
  CONVERTED: { color: "bg-amber-100 text-amber-700 border-amber-300", icon: <CheckCircle2 className="w-3 h-3" /> },
  LOST: { color: "bg-gray-100 text-gray-700 border-gray-300", icon: <X className="w-3 h-3" /> },
};

const healthConfig: Record<string, { emoji: string; color: string }> = {
  HOT: { emoji: "🔥", color: "bg-red-100 text-red-700" },
  WARM: { emoji: "☀️", color: "bg-amber-100 text-amber-700" },
  COLD: { emoji: "❄️", color: "bg-blue-100 text-blue-700" },
};

const actionIcons: Record<string, React.ReactNode> = {
  email_received: <Mail className="w-4 h-4 text-blue-500" />,
  email_sent: <Send className="w-4 h-4 text-green-500" />,
  whatsapp_received: <MessageSquare className="w-4 h-4 text-green-600" />,
  whatsapp_sent: <MessageSquare className="w-4 h-4 text-green-400" />,
  call_received: <PhoneIncoming className="w-4 h-4 text-purple-500" />,
  call_missed: <PhoneMissed className="w-4 h-4 text-red-500" />,
  call_made: <PhoneCall className="w-4 h-4 text-blue-500" />,
  follow_up_scheduled: <Calendar className="w-4 h-4 text-orange-500" />,
  status_changed: <ArrowRightCircle className="w-4 h-4 text-indigo-500" />,
  note_added: <FileText className="w-4 h-4 text-gray-500" />,
  converted: <CheckCircle2 className="w-4 h-4 text-amber-500" />,
  lead_created: <Plus className="w-4 h-4 text-green-500" />,
};

// ── Helper ─────────────────────────────────────────────────────────────────
function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = React.useState<LeadDetail | null>(null);
  const [timeline, setTimeline] = React.useState<TimelineItem[]>([]);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState(false);
  const [editData, setEditData] = React.useState<Partial<LeadDetail>>({});
  const [newNote, setNewNote] = React.useState("");
  const [addingNote, setAddingNote] = React.useState(false);
  const [converting, setConverting] = React.useState(false);

  // ── Fetch Data ───────────────────────────────────────────────────────────
  const fetchLead = React.useCallback(async () => {
    try {
      const data = await apiGet<LeadDetail>(`/api/leads/${leadId}`);
      setLead(data);
      setEditData(data);
    } catch (e) {
      toast.error("Lead not found");
      router.push("/leads");
    }
  }, [leadId, router]);

  const fetchTimeline = React.useCallback(async () => {
    try {
      const data = await apiGet<{ timeline: TimelineItem[] }>(`/api/leads/${leadId}/activities`);
      setTimeline(data.timeline || []);
    } catch {
      setTimeline([]);
    }
  }, [leadId]);

  const fetchNotifications = React.useCallback(async () => {
    try {
      const data = await apiGet<Notification[]>(`/api/leads/${leadId}/notifications`);
      setNotifications(data || []);
    } catch {
      setNotifications([]);
    }
  }, [leadId]);

  React.useEffect(() => {
    setLoading(true);
    Promise.all([fetchLead(), fetchTimeline(), fetchNotifications()]).finally(() => setLoading(false));
  }, [fetchLead, fetchTimeline, fetchNotifications]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      const updates: any = {};
      if (editData.customerName !== lead?.customerName) updates.customerName = editData.customerName;
      if (editData.mobile !== lead?.mobile) updates.mobile = editData.mobile;
      if (editData.email !== lead?.email) updates.email = editData.email || null;
      if (editData.interestedModel !== lead?.interestedModel) updates.interestedModel = editData.interestedModel || null;
      if (editData.location !== lead?.location) updates.location = editData.location || null;
      if (editData.status !== lead?.status) updates.status = editData.status;
      if (editData.dealHealth !== lead?.dealHealth) updates.dealHealth = editData.dealHealth;
      if (editData.followUpDate !== lead?.followUpDate) updates.followUpDate = editData.followUpDate || null;

      if (Object.keys(updates).length === 0) {
        setEditing(false);
        return;
      }

      await apiPut(`/api/leads/${leadId}`, updates);
      toast.success("Lead updated!");
      setEditing(false);
      fetchLead();
      fetchTimeline();
    } catch {
      toast.error("Update failed");
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      await apiPost(`/api/leads/${leadId}/activities`, {
        action: "note_added",
        channel: "manual",
        message: newNote.trim(),
      });
      toast.success("Note added!");
      setNewNote("");
      fetchTimeline();
    } catch {
      toast.error("Failed to add note");
    } finally {
      setAddingNote(false);
    }
  };

  const handleConvert = async () => {
    if (!confirm("Convert this lead to a booking? Customer record will be created automatically.")) return;
    setConverting(true);
    try {
      const result = await apiPost(`/api/leads/${leadId}/convert`, {});
      toast.success(`Booking created: ${result.booking?.bookingNumber || "Success"}!`);
      fetchLead();
      fetchTimeline();
    } catch (e: any) {
      toast.error(e?.message || "Conversion failed");
    } finally {
      setConverting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <span className="ml-3 text-gray-500">Loading lead details...</span>
      </div>
    );
  }

  if (!lead) return null;

  const sc = statusConfig[lead.status] || statusConfig.NEW;
  const hc = healthConfig[lead.dealHealth] || healthConfig.WARM;

  return (
    <div className="space-y-6 pb-10">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/leads")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{lead.customerName}</h1>
            <p className="text-sm text-gray-500">Lead ID: {lead.id.slice(0, 8)}... | Created: {formatDate(lead.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => { setEditing(!editing); setEditData(lead); }}>
            <Edit3 className="w-4 h-4 mr-1" /> {editing ? "Cancel" : "Edit"}
          </Button>
          {lead.status !== "CONVERTED" && lead.status !== "LOST" && (
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={handleConvert} disabled={converting}>
              {converting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
              Convert to Booking
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => { fetchLead(); fetchTimeline(); fetchNotifications(); }}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ── Status Bar ──────────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        <Badge className={`${sc.color} border px-3 py-1`}>
          {sc.icon} <span className="ml-1">{lead.status}</span>
        </Badge>
        <Badge className={`${hc.color} px-3 py-1`}>
          {hc.emoji} {lead.dealHealth}
        </Badge>
        {lead.source && (
          <Badge variant="outline" className="px-3 py-1">
            {lead.source === "email" ? "📧" : lead.source === "whatsapp" ? "💬" : lead.source === "call" ? "📞" : "🌐"}{" "}
            {lead.source.toUpperCase()}
          </Badge>
        )}
        {lead.assignedTo && (
          <Badge variant="outline" className="px-3 py-1">
            <User className="w-3 h-3 mr-1" /> {lead.assignedTo.name}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Lead Info + Edit ────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Lead Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Name</label>
                    <Input value={editData.customerName || ""} onChange={(e) => setEditData({ ...editData, customerName: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Mobile</label>
                    <Input value={editData.mobile || ""} onChange={(e) => setEditData({ ...editData, mobile: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Email</label>
                    <Input value={editData.email || ""} onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Interested Model</label>
                    <Input value={editData.interestedModel || ""} onChange={(e) => setEditData({ ...editData, interestedModel: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Location</label>
                    <Input value={editData.location || ""} onChange={(e) => setEditData({ ...editData, location: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Status</label>
                    <select className="w-full border rounded-md px-3 py-2 text-sm" value={editData.status || ""} onChange={(e) => setEditData({ ...editData, status: e.target.value })}>
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Deal Health</label>
                    <select className="w-full border rounded-md px-3 py-2 text-sm" value={editData.dealHealth || ""} onChange={(e) => setEditData({ ...editData, dealHealth: e.target.value })}>
                      {HEALTH_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Follow-Up Date</label>
                    <Input type="datetime-local" value={editData.followUpDate ? new Date(editData.followUpDate).toISOString().slice(0, 16) : ""} onChange={(e) => setEditData({ ...editData, followUpDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                      <Save className="w-4 h-4 mr-1" /> Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                  </div>
                </>
              ) : (
                <>
                  <InfoRow icon={<User className="w-4 h-4" />} label="Name" value={lead.customerName} />
                  <InfoRow icon={<Phone className="w-4 h-4" />} label="Mobile" value={lead.mobile} link={`tel:${lead.mobile}`} />
                  {lead.email && <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={lead.email} link={`mailto:${lead.email}`} />}
                  {lead.interestedModel && <InfoRow icon={<Globe className="w-4 h-4" />} label="Interested In" value={lead.interestedModel} />}
                  {lead.location && <InfoRow icon={<MapPin className="w-4 h-4" />} label="Location" value={lead.location} />}
                  {lead.followUpDate && (
                    <InfoRow
                      icon={<Calendar className="w-4 h-4" />}
                      label="Follow-Up"
                      value={formatDate(lead.followUpDate)}
                      highlight={new Date(lead.followUpDate) < new Date()}
                    />
                  )}
                  {lead.notes && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* ── Notifications ─────────────────────────────────────────────── */}
          {notifications.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-500" /> Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className={`p-3 rounded-lg border text-sm ${n.isRead ? "bg-gray-50" : "bg-orange-50 border-orange-200"}`}>
                    <p className="font-medium">{n.title}</p>
                    <p className="text-gray-600 text-xs mt-1">{n.message}</p>
                    <p className="text-gray-400 text-xs mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* ── Quick Actions ─────────────────────────────────────────────── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => window.open(`tel:${lead.mobile}`)}>
                <PhoneCall className="w-4 h-4 mr-2 text-green-600" /> Call {lead.customerName}
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => window.open(`https://wa.me/91${lead.mobile}`)}>
                <MessageSquare className="w-4 h-4 mr-2 text-green-600" /> WhatsApp Message
              </Button>
              {lead.email && (
                <Button variant="outline" className="w-full justify-start" onClick={() => window.open(`mailto:${lead.email}`)}>
                  <Mail className="w-4 h-4 mr-2 text-blue-600" /> Send Email
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Right: Timeline ──────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {/* ── Add Note ────────────────────────────────────────────────── */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a note or update..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[60px]"
                />
                <Button
                  onClick={handleAddNote}
                  disabled={addingNote || !newNote.trim()}
                  className="bg-purple-600 hover:bg-purple-700 self-end"
                >
                  {addingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ── Activity Timeline ───────────────────────────────────────── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Activity Timeline</span>
                <Badge variant="outline">{timeline.length} activities</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeline.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No activities yet. Add a note to start tracking!</p>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-gray-200" />
                  <div className="space-y-4">
                    {timeline.map((item) => (
                      <div key={item.id} className="flex gap-3 relative">
                        <div className="w-9 h-9 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center z-10 shrink-0">
                          {actionIcons[item.action] || <Clock className="w-4 h-4 text-gray-400" />}
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-lg p-3 border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium capitalize">
                              {item.action.replace(/_/g, " ")}
                            </span>
                            <span className="text-xs text-gray-400">{timeAgo(item.createdAt)}</span>
                          </div>
                          {item.message && (
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{item.message}</p>
                          )}
                          <div className="flex gap-2 mt-1">
                            {item.channel && (
                              <span className="text-xs text-gray-400">
                                {item.channel === "email" ? "📧" : item.channel === "whatsapp" ? "💬" : item.channel === "call" ? "📞" : "🔧"}{" "}
                                {item.channel}
                              </span>
                            )}
                            {item.direction && (
                              <span className="text-xs text-gray-400">
                                {item.direction === "incoming" ? "↙️ Incoming" : "↗️ Outgoing"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Info Row Component ─────────────────────────────────────────────────────
function InfoRow({ icon, label, value, link, highlight }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  link?: string;
  highlight?: boolean;
}) {
  const content = link ? (
    <a href={link} className="text-purple-600 hover:underline">{value}</a>
  ) : (
    <span className={highlight ? "text-red-600 font-medium" : ""}>{value}</span>
  );

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-gray-400">{icon}</div>
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm text-gray-700">{content}</p>
      </div>
    </div>
  );
}
