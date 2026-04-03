/**
 * Lead Notification Service — Creates in-app notifications for lead events
 */
import prisma from "@/lib/prisma";

interface NotificationData {
  leadId?: string;
  type: string;
  title: string;
  message: string;
  userId?: string; // null = all admins
}

export async function createLeadNotification(
  tenantId: string,
  data: NotificationData
): Promise<void> {
  try {
    await prisma.leadNotification.create({
      data: {
        tenantId,
        leadId: data.leadId || null,
        type: data.type,
        title: data.title,
        message: data.message,
        userId: data.userId || null,
        isRead: false,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

export async function createOverdueNotifications(tenantId: string): Promise<number> {
  const now = new Date();
  
  // Find overdue leads
  const overdueLeads = await prisma.lead.findMany({
    where: {
      tenantId,
      followUpDate: { lt: now },
      status: { notIn: ["CONVERTED", "LOST"] },
    },
    select: {
      id: true,
      customerName: true,
      mobile: true,
      followUpDate: true,
      assignedToId: true,
    },
    take: 50,
  });

  let created = 0;
  for (const lead of overdueLeads) {
    const daysPast = Math.floor((now.getTime() - (lead.followUpDate?.getTime() || now.getTime())) / (1000 * 60 * 60 * 24));
    
    // Check if notification already exists for today
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    const existing = await prisma.leadNotification.findFirst({
      where: {
        tenantId,
        leadId: lead.id,
        type: "overdue_followup",
        createdAt: { gte: todayStart },
      },
    });

    if (!existing) {
      await createLeadNotification(tenantId, {
        leadId: lead.id,
        type: "overdue_followup",
        title: `⚠️ Overdue: ${lead.customerName}`,
        message: `Follow-up ${daysPast} din late hai! Phone: ${lead.mobile}`,
        userId: lead.assignedToId || undefined,
      });
      created++;
    }
  }

  return created;
}

export async function createStaleLeadNotifications(tenantId: string, hoursThreshold = 24): Promise<number> {
  const cutoff = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);
  
  const staleLeads = await prisma.lead.findMany({
    where: {
      tenantId,
      status: "NEW",
      updatedAt: { lt: cutoff },
    },
    select: {
      id: true,
      customerName: true,
      mobile: true,
      source: true,
      createdAt: true,
    },
    take: 50,
  });

  let created = 0;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  for (const lead of staleLeads) {
    const hours = Math.floor((Date.now() - lead.createdAt.getTime()) / (1000 * 60 * 60));
    
    const existing = await prisma.leadNotification.findFirst({
      where: {
        tenantId,
        leadId: lead.id,
        type: "stale_lead",
        createdAt: { gte: todayStart },
      },
    });

    if (!existing) {
      await createLeadNotification(tenantId, {
        leadId: lead.id,
        type: "stale_lead",
        title: `🕐 Stale Lead: ${lead.customerName}`,
        message: `${hours}h se koi response nahi! Source: ${lead.source || "unknown"} | Phone: ${lead.mobile}`,
      });
      created++;
    }
  }

  return created;
}
