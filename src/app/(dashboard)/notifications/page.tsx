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
  group: "Today" | "Yesterday" | "Earlier";
  read: boolean;
}

const typeConfig: Record<
  NotificationType,
  { icon: React.ElementType; color: string; bg: string }
> = {
  new_lead: { icon: UserPlus, color: "text-blue-600", bg: "bg-blue-100" },
  booking_update: { icon: BookOpen, color: "text-purple-600", bg: "bg-purple-100" },
  payment_received: { icon: CreditCard, color: "text-green-600", bg: "bg-green-100" },
  rto_status: { icon: FileCheck, color: "text-amber-600", bg: "bg-amber-100" },
  follow_up: { icon: Calendar, color: "text-orange-600", bg: "bg-orange-100" },
  daybook_lock: { icon: Shield, color: "text-red-600", bg: "bg-red-100" },
  insurance_expiry: { icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-100" },
};

const mockNotifications: Notification[] = [
  { id: "1", type: "new_lead", title: "New Lead Received", message: "Amit Verma enquired about Honda Activa 6G via walk-in", time: "10 min ago", group: "Today", read: false },
  { id: "2", type: "payment_received", title: "Payment Received", message: "₹25,000 received from Priya Singh for BK-2024-002", time: "35 min ago", group: "Today", read: false },
  { id: "3", type: "follow_up", title: "Follow-up Reminder", message: "Follow up with Rohit Mishra about Honda Shine — due today", time: "1 hour ago", group: "Today", read: false },
  { id: "4", type: "rto_status", title: "RTO Status Updated", message: "Registration for BK-2024-003 (Suresh Yadav) approved by RTO", time: "2 hours ago", group: "Today", read: true },
  { id: "5", type: "booking_update", title: "Booking Status Changed", message: "BK-2024-005 moved to 'Ready for Delivery'", time: "3 hours ago", group: "Today", read: true },
  { id: "6", type: "daybook_lock", title: "Daybook Not Locked", message: "Yesterday's daybook (21 Mar) is still unlocked. Please review and lock.", time: "4 hours ago", group: "Today", read: false },
  { id: "7", type: "new_lead", title: "New Lead Received", message: "Kavita Rani enquired about Honda Dio via WhatsApp", time: "Yesterday 4:30 PM", group: "Yesterday", read: true },
  { id: "8", type: "payment_received", title: "Payment Received", message: "₹82,000 received from Suresh Yadav for BK-2024-003", time: "Yesterday 2:15 PM", group: "Yesterday", read: true },
  { id: "9", type: "insurance_expiry", title: "Insurance Expiry Warning", message: "Insurance for Honda CB350 (CHS-CB3-008) expires in 7 days", time: "Yesterday 11:00 AM", group: "Yesterday", read: false },
  { id: "10", type: "follow_up", title: "Follow-up Reminder", message: "Follow up with Deepak Singh about Honda Unicorn", time: "Yesterday 9:00 AM", group: "Yesterday", read: true },
  { id: "11", type: "booking_update", title: "Booking Confirmed", message: "BK-2024-006 confirmed by Meena Devi with ₹30,000 advance", time: "Yesterday 8:30 AM", group: "Yesterday", read: true },
  { id: "12", type: "rto_status", title: "RTO Application Submitted", message: "RTO application submitted for BK-2024-004 (Anita Sharma)", time: "20 Mar, 5:00 PM", group: "Earlier", read: true },
  { id: "13", type: "new_lead", title: "New Lead Received", message: "Sunita Devi enquired about Honda Activa via phone call", time: "20 Mar, 3:00 PM", group: "Earlier", read: true },
  { id: "14", type: "payment_received", title: "Payment Received", message: "₹10,000 advance from Anita Sharma for BK-2024-004", time: "20 Mar, 11:00 AM", group: "Earlier", read: true },
  { id: "15", type: "insurance_expiry", title: "Insurance Expiry Warning", message: "Insurance for Honda SP 125 (CHS-SP1-006) expires in 15 days", time: "19 Mar, 4:00 PM", group: "Earlier", read: true },
  { id: "16", type: "daybook_lock", title: "Daybook Locked", message: "Daybook for 18 Mar locked by Ravi (Owner)", time: "19 Mar, 10:00 AM", group: "Earlier", read: true },
  { id: "17", type: "follow_up", title: "Follow-up Overdue", message: "Manoj Tiwari follow-up is overdue by 3 days — lead marked as Cold", time: "18 Mar, 9:00 AM", group: "Earlier", read: true },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const grouped = {
    Today: notifications.filter((n) => n.group === "Today"),
    Yesterday: notifications.filter((n) => n.group === "Yesterday"),
    Earlier: notifications.filter((n) => n.group === "Earlier"),
  };

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
        if (items.length === 0) return null;
        return (
          <div key={group}>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">
              {group}
            </h2>
            <div className="space-y-2">
              {items.map((n) => {
                const cfg = typeConfig[n.type];
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
