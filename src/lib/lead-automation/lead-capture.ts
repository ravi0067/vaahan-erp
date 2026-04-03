/**
 * Central Lead Capture — Auto-captures leads from Email, WhatsApp, Call
 * Creates/updates Lead + CommunicationLog + LeadActivity
 */
import prisma from "@/lib/prisma";
import { classifyMessage, Classification } from "./classifier";

// ── Types ─────────────────────────────────────────────────────────────────
interface EmailLead {
  senderEmail: string;
  senderName?: string;
  subject?: string;
  body: string;
}

interface WhatsAppLead {
  phone: string;
  name?: string;
  message: string;
}

interface CallLead {
  phone: string;
  name?: string;
  duration?: number;
  status?: string; // answered, missed, busy
  notes?: string;
}

interface CaptureResult {
  lead: any;
  isNew: boolean;
  classification: Classification;
  communicationId: string;
  activityId: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────
function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

function dealHealthFromPriority(priority: string): "HOT" | "WARM" | "COLD" {
  if (priority === "high") return "HOT";
  if (priority === "medium") return "WARM";
  return "COLD";
}

async function findOrCreateLead(
  tenantId: string,
  data: { name?: string; phone?: string; email?: string; source: string; message?: string },
  classification: Classification
) {
  // Try to find existing lead by phone or email
  const where: any[] = [];
  if (data.phone) where.push({ tenantId, mobile: data.phone });
  if (data.email) where.push({ tenantId, email: data.email });

  let existingLead = null;
  if (where.length > 0) {
    existingLead = await prisma.lead.findFirst({
      where: { OR: where },
      orderBy: { createdAt: "desc" },
    });
  }

  if (existingLead) {
    // Update existing lead — don't overwrite if already progressed
    const updates: any = {};
    if (data.name && !existingLead.customerName) updates.customerName = data.name;
    if (data.email && !existingLead.email) updates.email = data.email;
    if (data.phone && !existingLead.mobile) updates.mobile = data.phone;
    // Reopen if was lost/closed
    if (existingLead.status === "LOST") {
      updates.status = "NEW";
      updates.dealHealth = dealHealthFromPriority(classification.priority);
    }
    if (Object.keys(updates).length > 0) {
      await prisma.lead.update({ where: { id: existingLead.id }, data: updates });
    }
    return { lead: { ...existingLead, ...updates }, isNew: false };
  }

  // Create new lead
  const lead = await prisma.lead.create({
    data: {
      tenantId,
      customerName: data.name || data.email || data.phone || "Unknown",
      mobile: data.phone || "",
      email: data.email || null,
      source: data.source,
      status: "NEW",
      dealHealth: dealHealthFromPriority(classification.priority),
      notes: data.message ? data.message.substring(0, 500) : null,
      followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Auto follow-up in 24h
    },
  });

  return { lead, isNew: true };
}

async function logCommunication(
  tenantId: string,
  leadName: string,
  phone: string | undefined,
  channel: string,
  direction: string,
  message: string
): Promise<string> {
  const log = await prisma.communicationLog.create({
    data: {
      tenantId,
      customerName: leadName,
      phone: phone || null,
      channel,
      direction,
      purpose: message.substring(0, 200),
      status: "Completed",
      completedAt: new Date(),
    },
  });
  return log.id;
}

async function logActivity(
  tenantId: string,
  leadId: string,
  action: string,
  channel: string,
  direction: string,
  notes?: string
): Promise<string> {
  // Try LeadActivity model first, fallback to CommunicationLog
  try {
    const activity = await prisma.leadActivity.create({
      data: {
        tenantId,
        leadId,
        action,
        channel,
        direction: direction === "incoming" || direction === "inbound" ? "incoming" : "outgoing",
        message: notes?.substring(0, 2000) || null,
        metadata: null,
        createdBy: null, // System-generated
      },
    });
    return activity.id;
  } catch {
    // Fallback to CommunicationLog if LeadActivity table doesn't exist yet
    const log = await prisma.communicationLog.create({
      data: {
        tenantId,
        customerName: `Activity: ${action}`,
        channel,
        direction,
        purpose: `[LeadActivity] ${action} | Lead: ${leadId}`,
        notes: notes?.substring(0, 500) || null,
        status: "Completed",
        completedAt: new Date(),
      },
    });
    return log.id;
  }
}

// ── EMAIL CAPTURE ─────────────────────────────────────────────────────────
export async function captureLeadFromEmail(
  tenantId: string,
  data: EmailLead
): Promise<CaptureResult> {
  const classification = classifyMessage(data.body, data.subject, "email");

  if (classification.type === "spam") {
    throw new Error("SPAM detected — lead not captured");
  }

  const { lead, isNew } = await findOrCreateLead(tenantId, {
    name: data.senderName,
    email: data.senderEmail,
    source: "email",
    message: `Subject: ${data.subject || "No Subject"}\n\n${data.body}`,
  }, classification);

  const communicationId = await logCommunication(
    tenantId, lead.customerName, lead.mobile,
    "email", "inbound",
    `📧 Email from ${data.senderEmail}: ${data.subject || "No Subject"}`
  );

  const activityId = await logActivity(
    tenantId, lead.id,
    "email_received", "email", "incoming",
    `From: ${data.senderEmail} | Subject: ${data.subject} | ${data.body.substring(0, 200)}`
  );

  return { lead, isNew, classification, communicationId, activityId };
}

// ── WHATSAPP CAPTURE ──────────────────────────────────────────────────────
export async function captureLeadFromWhatsApp(
  tenantId: string,
  data: WhatsAppLead
): Promise<CaptureResult> {
  const phone = cleanPhone(data.phone);
  const classification = classifyMessage(data.message, undefined, "whatsapp");

  if (classification.type === "spam") {
    throw new Error("SPAM detected — lead not captured");
  }

  const { lead, isNew } = await findOrCreateLead(tenantId, {
    name: data.name,
    phone,
    source: "whatsapp",
    message: data.message,
  }, classification);

  const communicationId = await logCommunication(
    tenantId, lead.customerName, phone,
    "whatsapp", "inbound",
    `💬 WhatsApp: ${data.message.substring(0, 200)}`
  );

  const activityId = await logActivity(
    tenantId, lead.id,
    "whatsapp_received", "whatsapp", "incoming",
    `From: ${phone} | ${data.message.substring(0, 300)}`
  );

  return { lead, isNew, classification, communicationId, activityId };
}

// ── CALL CAPTURE ──────────────────────────────────────────────────────────
export async function captureLeadFromCall(
  tenantId: string,
  data: CallLead
): Promise<CaptureResult> {
  const phone = cleanPhone(data.phone);
  const classification = classifyMessage(data.notes || "phone call inquiry", undefined, "call");

  const { lead, isNew } = await findOrCreateLead(tenantId, {
    name: data.name,
    phone,
    source: "call",
    message: data.notes || `Call ${data.status || "received"} (${data.duration || 0}s)`,
  }, classification);

  const communicationId = await logCommunication(
    tenantId, lead.customerName, phone,
    "call", "inbound",
    `📞 Call ${data.status || "received"} | Duration: ${data.duration || 0}s`
  );

  const activityId = await logActivity(
    tenantId, lead.id,
    data.status === "missed" ? "call_missed" : "call_received",
    "call", "incoming",
    `Phone: ${phone} | Status: ${data.status} | Duration: ${data.duration || 0}s | ${data.notes || ""}`
  );

  return { lead, isNew, classification, communicationId, activityId };
}
