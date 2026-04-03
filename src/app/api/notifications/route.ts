/**
 * GET /api/notifications — Dashboard notifications (overdue follow-ups, new leads, stale leads)
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

interface Notification {
  id: string;
  type: "new_lead" | "overdue_followup" | "stale_lead" | "missed_call" | "system";
  title: string;
  message: string;
  priority: "high" | "medium" | "low";
  read: boolean;
  timestamp: Date;
  leadId?: string;
  actionUrl?: string;
}

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;
    const tenantId = session!.user.tenantId;

    const now = new Date();
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const notifications: Notification[] = [];

    // 1. New leads in last 24h
    const newLeads = await prisma.lead.findMany({
      where: { tenantId, createdAt: { gte: last24h } },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    newLeads.forEach((l) => {
      notifications.push({
        id: `new_${l.id}`,
        type: "new_lead",
        title: "🆕 Naya Lead Aaya!",
        message: `${l.customerName} (${l.source || "website"}) — ${l.mobile}`,
        priority: l.dealHealth === "HOT" ? "high" : "medium",
        read: false,
        timestamp: l.createdAt,
        leadId: l.id,
        actionUrl: `/leads?search=${l.mobile}`,
      });
    });

    // 2. Overdue follow-ups
    const overdueLeads = await prisma.lead.findMany({
      where: {
        tenantId,
        followUpDate: { lt: now },
        status: { notIn: ["CONVERTED", "LOST"] },
      },
      orderBy: { followUpDate: "asc" },
      take: 10,
    });

    overdueLeads.forEach((l) => {
      const daysOverdue = Math.floor(
        (now.getTime() - (l.followUpDate?.getTime() || 0)) / (1000 * 60 * 60 * 24)
      );
      notifications.push({
        id: `overdue_${l.id}`,
        type: "overdue_followup",
        title: `⏰ Follow-up Overdue (${daysOverdue} din)`,
        message: `${l.customerName} — ${l.mobile} | Status: ${l.status}`,
        priority: daysOverdue > 3 ? "high" : "medium",
        read: false,
        timestamp: l.followUpDate || l.updatedAt,
        leadId: l.id,
        actionUrl: `/leads?search=${l.mobile}`,
      });
    });

    // 3. Stale leads (NEW for 24h+ with no update)
    const staleLeads = await prisma.lead.findMany({
      where: {
        tenantId,
        status: "NEW",
        updatedAt: { lt: last24h },
      },
      take: 5,
    });

    staleLeads.forEach((l) => {
      const hoursStale = Math.floor(
        (Date.now() - l.updatedAt.getTime()) / (1000 * 60 * 60)
      );
      notifications.push({
        id: `stale_${l.id}`,
        type: "stale_lead",
        title: `😴 Lead ${hoursStale}h se Pending!`,
        message: `${l.customerName} ko abhi tak contact nahi kiya — ${l.mobile}`,
        priority: hoursStale > 48 ? "high" : "low",
        read: false,
        timestamp: l.createdAt,
        leadId: l.id,
        actionUrl: `/leads?search=${l.mobile}`,
      });
    });

    // 4. Missed calls (from communication logs)
    const missedCalls = await prisma.communicationLog.findMany({
      where: {
        tenantId,
        channel: "call",
        status: { in: ["missed", "Missed", "no-answer"] },
        createdAt: { gte: last24h },
      },
      take: 5,
    });

    missedCalls.forEach((c) => {
      notifications.push({
        id: `missed_${c.id}`,
        type: "missed_call",
        title: "📞 Missed Call!",
        message: `${c.customerName} (${c.phone}) — call back karein!`,
        priority: "high",
        read: false,
        timestamp: c.createdAt,
        actionUrl: `/leads?search=${c.phone}`,
      });
    });

    // Sort by priority then timestamp
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    notifications.sort((a, b) => {
      const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pDiff !== 0) return pDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return NextResponse.json({
      notifications: notifications.slice(0, 20),
      counts: {
        total: notifications.length,
        high: notifications.filter((n) => n.priority === "high").length,
        newLeads: newLeads.length,
        overdue: overdueLeads.length,
        stale: staleLeads.length,
        missedCalls: missedCalls.length,
      },
    });
  } catch (error: any) {
    console.error("Notifications API error:", error);
    return NextResponse.json({ notifications: [], counts: { total: 0 } });
  }
}
