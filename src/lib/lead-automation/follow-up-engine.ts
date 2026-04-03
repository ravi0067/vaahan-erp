/**
 * Follow-Up Engine — Tracks overdue leads, stale leads, and schedules follow-ups
 */
import prisma from "@/lib/prisma";

export interface OverdueLead {
  id: string;
  customerName: string;
  mobile: string;
  email: string | null;
  status: string;
  dealHealth: string;
  followUpDate: Date | null;
  daysPastDue: number;
  assignedTo: { id: string; name: string } | null;
  source: string | null;
}

export interface StaleLead {
  id: string;
  customerName: string;
  mobile: string;
  source: string | null;
  status: string;
  hoursStale: number;
  createdAt: Date;
}

// ── Get Overdue Follow-Ups ────────────────────────────────────────────────
export async function getOverdueFollowUps(tenantId: string): Promise<OverdueLead[]> {
  const now = new Date();

  const leads = await prisma.lead.findMany({
    where: {
      tenantId,
      followUpDate: { lt: now },
      status: { notIn: ["CONVERTED", "LOST"] },
    },
    include: {
      assignedTo: { select: { id: true, name: true } },
    },
    orderBy: { followUpDate: "asc" },
  });

  return leads.map((l) => ({
    id: l.id,
    customerName: l.customerName,
    mobile: l.mobile,
    email: l.email,
    status: l.status,
    dealHealth: l.dealHealth,
    followUpDate: l.followUpDate,
    daysPastDue: l.followUpDate
      ? Math.floor((now.getTime() - l.followUpDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0,
    assignedTo: l.assignedTo,
    source: l.source,
  }));
}

// ── Get Stale Leads (No activity in X hours) ──────────────────────────────
export async function getStaleLeads(
  tenantId: string,
  hoursThreshold: number = 24
): Promise<StaleLead[]> {
  const cutoff = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);

  const leads = await prisma.lead.findMany({
    where: {
      tenantId,
      status: "NEW",
      updatedAt: { lt: cutoff },
    },
    orderBy: { createdAt: "asc" },
  });

  return leads.map((l) => ({
    id: l.id,
    customerName: l.customerName,
    mobile: l.mobile,
    source: l.source,
    status: l.status,
    hoursStale: Math.floor((Date.now() - l.updatedAt.getTime()) / (1000 * 60 * 60)),
    createdAt: l.createdAt,
  }));
}

// ── Schedule Follow-Up ────────────────────────────────────────────────────
export async function scheduleFollowUp(
  leadId: string,
  date: Date,
  note?: string
): Promise<void> {
  const updates: any = { followUpDate: date };

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");

  // Add note if provided
  if (note) {
    updates.notes = lead.notes ? `${lead.notes}\n\n[Follow-up ${date.toLocaleDateString("en-IN")}]: ${note}` : `[Follow-up ${date.toLocaleDateString("en-IN")}]: ${note}`;
  }

  // If status is NEW, move to FOLLOWUP
  if (lead.status === "NEW") {
    updates.status = "FOLLOWUP";
  }

  await prisma.lead.update({ where: { id: leadId }, data: updates });

  // Log activity
  if (lead.tenantId) {
    await prisma.communicationLog.create({
      data: {
        tenantId: lead.tenantId,
        customerName: lead.customerName,
        phone: lead.mobile,
        channel: "system",
        direction: "outbound",
        purpose: `Follow-up scheduled for ${date.toLocaleDateString("en-IN")}`,
        notes: note || null,
        status: "Scheduled",
        scheduledAt: date,
      },
    });
  }
}

// ── Get Follow-Up Summary for Dashboard ───────────────────────────────────
export async function getFollowUpSummary(tenantId: string) {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const [overdue, todayFollowUps, newLeads24h, totalActive] = await Promise.all([
    prisma.lead.count({
      where: {
        tenantId,
        followUpDate: { lt: now },
        status: { notIn: ["CONVERTED", "LOST"] },
      },
    }),
    prisma.lead.count({
      where: {
        tenantId,
        followUpDate: { gte: todayStart, lte: todayEnd },
        status: { notIn: ["CONVERTED", "LOST"] },
      },
    }),
    prisma.lead.count({
      where: {
        tenantId,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.lead.count({
      where: {
        tenantId,
        status: { notIn: ["CONVERTED", "LOST"] },
      },
    }),
  ]);

  return { overdue, todayFollowUps, newLeads24h, totalActive };
}

// ── Auto-Assign Lead to Team Member ───────────────────────────────────────
export async function autoAssignLead(
  tenantId: string,
  leadId: string,
  suggestedRole: string
): Promise<string | null> {
  // Find least-loaded team member with the suggested role
  const users = await prisma.user.findMany({
    where: {
      tenantId,
      role: suggestedRole as any,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          assignedLeads: {
            where: { status: { notIn: ["CONVERTED", "LOST"] } },
          },
        },
      },
    },
    orderBy: { assignedLeads: { _count: "asc" } },
  });

  if (users.length === 0) {
    // Fallback: assign to any active user
    const fallback = await prisma.user.findFirst({
      where: { tenantId, isActive: true },
      select: { id: true, name: true },
    });
    if (!fallback) return null;

    await prisma.lead.update({
      where: { id: leadId },
      data: { assignedToId: fallback.id },
    });
    return fallback.name;
  }

  const assignee = users[0];
  await prisma.lead.update({
    where: { id: leadId },
    data: { assignedToId: assignee.id },
  });

  return assignee.name;
}
