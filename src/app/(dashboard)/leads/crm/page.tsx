"use client";

import React, { useState, useEffect } from "react";
import {
  Phone, Mail, MessageSquare, Search, Filter, Clock, AlertTriangle,
  User, ChevronRight, RefreshCw, TrendingUp, PhoneIncoming,
  PhoneMissed, MessageCircle, MailOpen, Calendar, ArrowUpRight,
} from "lucide-react";

interface Lead {
  id: string;
  customerName: string;
  mobile: string;
  email: string | null;
  source: string | null;
  status: string;
  dealHealth: string;
  followUpDate: string | null;
  notes: string | null;
  createdAt: string;
  assignedTo?: { id: string; name: string } | null;
}

interface FollowUpSummary {
  overdue: number;
  todayFollowUps: number;
  newLeads24h: number;
  totalActive: number;
}

interface NotificationData {
  notifications: any[];
  counts: {
    total: number;
    high: number;
    newLeads: number;
    overdue: number;
    stale: number;
    missedCalls: number;
  };
}

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  CONTACTED: "bg-yellow-100 text-yellow-800",
  FOLLOWUP: "bg-orange-100 text-orange-800",
  CONVERTED: "bg-green-100 text-green-800",
  LOST: "bg-red-100 text-red-800",
};

const healthColors: Record<string, string> = {
  HOT: "bg-red-500 text-white",
  WARM: "bg-orange-400 text-white",
  COLD: "bg-blue-400 text-white",
};

const sourceIcons: Record<string, React.ReactNode> = {
  email: <MailOpen className="w-4 h-4" />,
  whatsapp: <MessageCircle className="w-4 h-4" />,
  call: <PhoneIncoming className="w-4 h-4" />,
  website: <ArrowUpRight className="w-4 h-4" />,
};

export default function LeadCRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [summary, setSummary] = useState<FollowUpSummary | null>(null);
  const [notifications, setNotifications] = useState<NotificationData | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);

  // Fetch data
  useEffect(() => {
    fetchAll();
  }, [statusFilter, sourceFilter, search]);

  async function fetchAll() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);

      const [leadsRes, summaryRes, notifRes] = await Promise.all([
        fetch(`/api/leads?${params}`),
        fetch("/api/leads/follow-ups?view=summary"),
        fetch("/api/notifications"),
      ]);

      if (leadsRes.ok) {
        let data = await leadsRes.json();
        if (sourceFilter !== "all") {
          data = data.filter((l: Lead) => l.source === sourceFilter);
        }
        setLeads(data);
      }
      if (summaryRes.ok) setSummary(await summaryRes.json());
      if (notifRes.ok) setNotifications(await notifRes.json());
    } catch (err) {
      console.error("Fetch error:", err);
    }
    setLoading(false);
  }

  async function viewLeadTimeline(lead: Lead) {
    setSelectedLead(lead);
    try {
      const res = await fetch(`/api/leads/${lead.id}/activity`);
      if (res.ok) {
        const data = await res.json();
        setTimeline(data.timeline || []);
      }
    } catch {}
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">📊 Lead CRM Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Sab leads ek jagah — Email, WhatsApp, Call sab track karein
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
            label="Naye Leads (24h)"
            value={summary.newLeads24h}
            color="bg-blue-50 border-blue-200"
          />
          <SummaryCard
            icon={<Clock className="w-5 h-5 text-orange-600" />}
            label="Aaj Follow-Up"
            value={summary.todayFollowUps}
            color="bg-orange-50 border-orange-200"
          />
          <SummaryCard
            icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
            label="Overdue"
            value={summary.overdue}
            color="bg-red-50 border-red-200"
          />
          <SummaryCard
            icon={<User className="w-5 h-5 text-green-600" />}
            label="Total Active"
            value={summary.totalActive}
            color="bg-green-50 border-green-200"
          />
        </div>
      )}

      {/* Alerts */}
      {notifications && notifications.counts.high > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {notifications.counts.high} Urgent Alerts!
          </h3>
          <div className="mt-2 space-y-1">
            {notifications.notifications
              .filter((n: any) => n.priority === "high")
              .slice(0, 3)
              .map((n: any) => (
                <p key={n.id} className="text-sm text-red-700">
                  {n.title} — {n.message}
                </p>
              ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search naam, phone, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="NEW">🆕 New</option>
          <option value="CONTACTED">📞 Contacted</option>
          <option value="FOLLOWUP">🔄 Follow-Up</option>
          <option value="CONVERTED">✅ Converted</option>
          <option value="LOST">❌ Lost</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Sources</option>
          <option value="email">📧 Email</option>
          <option value="whatsapp">💬 WhatsApp</option>
          <option value="call">📞 Call</option>
          <option value="website">🌐 Website</option>
        </select>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads List */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="text-center py-10 text-gray-400">Loading...</div>
          ) : leads.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400 text-lg">Koi lead nahi mili</p>
              <p className="text-gray-300 text-sm mt-1">
                Jab Email/WhatsApp/Call aayega, leads yahan automatic aayengi!
              </p>
            </div>
          ) : (
            leads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => viewLeadTimeline(lead)}
                className={`border rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow ${
                  selectedLead?.id === lead.id ? "ring-2 ring-purple-500 bg-purple-50" : "bg-white"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {sourceIcons[lead.source || "website"] || <User className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{lead.customerName}</h3>
                      <p className="text-xs text-gray-500">
                        {lead.mobile} {lead.email ? `• ${lead.email}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${healthColors[lead.dealHealth] || "bg-gray-100"}`}>
                      {lead.dealHealth}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[lead.status] || "bg-gray-100"}`}>
                      {lead.status}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                  <span>📌 {lead.source || "website"}</span>
                  {lead.assignedTo && <span>👤 {lead.assignedTo.name}</span>}
                  {lead.followUpDate && (
                    <span className={new Date(lead.followUpDate) < new Date() ? "text-red-500 font-semibold" : ""}>
                      📅 {new Date(lead.followUpDate).toLocaleDateString("en-IN")}
                    </span>
                  )}
                  <span>🕐 {new Date(lead.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Timeline Sidebar */}
        <div className="border rounded-xl bg-white p-4">
          {selectedLead ? (
            <>
              <h3 className="font-bold text-sm mb-1">{selectedLead.customerName}</h3>
              <p className="text-xs text-gray-500 mb-4">
                {selectedLead.mobile} • {selectedLead.source}
              </p>

              {/* Quick Actions */}
              <div className="flex gap-2 mb-4">
                <a
                  href={`tel:${selectedLead.mobile}`}
                  className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100"
                >
                  <Phone className="w-3 h-3" /> Call
                </a>
                <a
                  href={`https://wa.me/91${selectedLead.mobile}`}
                  target="_blank"
                  className="flex-1 flex items-center justify-center gap-1 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100"
                >
                  <MessageSquare className="w-3 h-3" /> WhatsApp
                </a>
                {selectedLead.email && (
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100"
                  >
                    <Mail className="w-3 h-3" /> Email
                  </a>
                )}
              </div>

              {/* Notes */}
              {selectedLead.notes && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs text-gray-600">
                  📝 {selectedLead.notes}
                </div>
              )}

              {/* Activity Timeline */}
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Activity Timeline</h4>
              {timeline.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">Koi activity nahi</p>
              ) : (
                <div className="space-y-3">
                  {timeline.map((t: any) => (
                    <div key={t.id} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {t.type === "email" ? <Mail className="w-3 h-3 text-blue-500" /> :
                         t.type === "whatsapp" ? <MessageCircle className="w-3 h-3 text-green-500" /> :
                         t.type === "call" ? <Phone className="w-3 h-3 text-orange-500" /> :
                         <Clock className="w-3 h-3 text-gray-400" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-700">{t.message}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(t.timestamp).toLocaleString("en-IN", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                          {t.direction === "inbound" ? " ← Incoming" : t.direction === "outbound" ? " → Outgoing" : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <User className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Kisi lead par click karein</p>
              <p className="text-xs">Timeline aur details yahan dikhenge</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-gray-600">{label}</p>
        </div>
      </div>
    </div>
  );
}
