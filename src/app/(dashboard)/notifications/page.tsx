"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  CreditCard,
  FileCheck,
  Calendar,
  BookOpen,
  Shield,
  AlertTriangle,
  Check,
  Bell,
  Loader2,
} from "lucide-react";

type NotificationType =
  | "new_lead"
  | "booking_update"
  | "payment_received"
  | "rto_status"
  | "follow_up"
  | "daybook_lock"
  | "insurance_expiry";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  createdAt: string;
  read: boolean;
}

const typeConfig: Record<
  string,
  { icon: React.ElementType; color: string; bg: string }
> = {
  new_lead: { icon: UserPlus, color: "text-blue-600", bg: "bg-blue-100" },
  booking_update: { icon: BookOpen, color: "text-purple-600", bg: "bg-purple-100" },
  payment_received: { icon: CreditCard, color: "text-green-600", bg: "bg-green-100" },
  rto_status: { icon: FileCheck, color: "text-amber-600", bg: "bg-amber-100" },
  follow_up: { icon: Calendar, color: "text-orange-600", bg: "bg-orange-100" },
  daybook_lock: { icon: Shield, color: "text-red-600", bg: "bg-red-100" },
  insurance_expiry: { icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-100" },
  call: { icon: Calendar, color: "text-blue-600", bg: "bg-blue-100" },
  whatsapp: { icon: Bell, color: "text-green-600", bg: "bg-green-100" },
  email: { icon: Bell, color: "text-purple-600", bg: "bg-purple-100" },
  sms: { icon: Bell, color: "text-gray-600", bg: "bg-gray-100" },
  general: { icon: Bell, color: "text-gray-600", bg: "bg-gray-100" },
};

function getTimeGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);

  if (date >= todayStart) return "Today";
  if (date >= yesterdayStart) return "Yesterday";
  return "Earlier";
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/communications?type=notifications");
        const data = await res.json();
        if (data.success && data.notifications) {
          const mapped: Notification[] = data.notifications.map((n: Record<string, unknown>) => {
            const rawType = (n.type as string) || "general";
            // Map communication channel types to notification types
            const typeMap: Record<string, NotificationType> = {
              call: "follow_up",
              whatsapp: "booking_update",
              email: "booking_update",
              sms: "booking_update",
            };
            const nType = typeMap[rawType] || "follow_up";
            return {
              id: n.id as string,
              type: nType,
              title: rawType === "call" ? "Call Log" : `${rawType.charAt(0).toUpperCase() + rawType.slice(1)} Activity`,
              message: n.message as string,
              time: n.time ? formatTime(n.time as string) : "",
              createdAt: (n.time as string) || new Date().toISOString(),
              read: n.read as boolean,
            };
          });
          setNotifications(mapped);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
    try {
      await fetch("/api/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark-read", id }),
      });
    } catch {
      // silently fail
    }
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    for (const id of unreadIds) {
      try {
        await fetch("/api/communications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "mark-read", id }),
        });
      } catch {
        // silently fail
      }
    }
  };

  // Group by computed time group
  const grouped: Record<string, Notification[]> = { Today: [], Yesterday: [], Earlier: [] };
  notifications.forEach((n) => {
    const group = getTimeGroup(n.createdAt);
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(n);
  });

  if (loading) {
    return (
      <div className="space-y-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground text-sm">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground text-sm">All caught up!</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-30" />
            <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Notifications will appear here as your dealership activity grows — new leads, bookings, payments, RTO updates, insurance expiries, and more.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground text-sm">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check className="h-4 w-4 mr-2" /> Mark All as Read
          </Button>
        )}
      </div>

      {(["Today", "Yesterday", "Earlier"] as const).map((group) => {
        const items = grouped[group];
        if (!items || items.length === 0) return null;
        return (
          <div key={group}>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">
              {group}
            </h2>
            <div className="space-y-2">
              {items.map((n) => {
                const cfg = typeConfig[n.type] || typeConfig["general"];
                const Icon = cfg.icon;
                return (
                  <Card
                    key={n.id}
                    className={`transition-colors cursor-pointer ${
                      !n.read ? "border-primary/30 bg-primary/5" : ""
                    }`}
                    onClick={() => toggleRead(n.id)}
                  >
                    <CardContent className="p-4 flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}
                      >
                        <Icon className={`h-4 w-4 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium ${!n.read ? "" : "text-muted-foreground"}`}>
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 truncate">
                          {n.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {n.time}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
