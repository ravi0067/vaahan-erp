/**
 * GET /api/leads/[id]/activities — Full activity timeline for a lead
 * POST /api/leads/[id]/activities — Add a new activity/note
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession, serializeDecimals } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;
    const tenantId = session!.user.tenantId;
    const leadId = params.id;

    const lead = await prisma.lead.findFirst({
      where: { id: leadId, tenantId },
      include: { assignedTo: { select: { id: true, name: true } } },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Try LeadActivity table first, fallback to CommunicationLog
    let timeline: any[] = [];
    try {
      const activities = await prisma.leadActivity.findMany({
        where: { leadId, tenantId },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      timeline = activities.map((a: any) => ({
        id: a.id,
        action: a.action,
        channel: a.channel,
        direction: a.direction,
        message: a.message,
        metadata: a.metadata,
        createdBy: a.createdBy,
        createdAt: a.createdAt,
      }));
    } catch {
      // Fallback: CommunicationLog (for old data before LeadActivity model)
      const comms = await prisma.communicationLog.findMany({
        where: {
          tenantId,
          OR: [
            { phone: lead.mobile },
            { customerName: lead.customerName },
            { purpose: { contains: leadId } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      timeline = comms.map((a: any) => ({
        id: a.id,
        action: a.channel === "email" ? "email_received" : a.channel === "whatsapp" ? "whatsapp_received" : a.channel === "call" ? "call_received" : "note_added",
        channel: a.channel,
        direction: a.direction === "inbound" ? "incoming" : "outgoing",
        message: a.purpose || a.notes || "",
        metadata: null,
        createdBy: null,
        createdAt: a.createdAt,
      }));
    }

    return NextResponse.json({
      lead: serializeDecimals(lead),
      timeline,
      totalActivities: timeline.length,
    });
  } catch (error: any) {
    console.error("Lead activities error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;
    const tenantId = session!.user.tenantId;
    const leadId = params.id;

    const lead = await prisma.lead.findFirst({
      where: { id: leadId, tenantId },
    });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const body = await req.json();
    const { action = "note_added", channel = "manual", direction, message, metadata } = body;

    const activity = await prisma.leadActivity.create({
      data: {
        tenantId,
        leadId,
        action,
        channel,
        direction: direction || null,
        message: message || null,
        metadata: metadata || null,
        createdBy: session!.user.id,
      },
    });

    // Also update lead's updatedAt
    await prisma.lead.update({
      where: { id: leadId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error: any) {
    console.error("Add activity error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
