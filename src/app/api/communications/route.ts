import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;
    const tenantId = session!.user.tenantId;

    const { searchParams } = new URL(req.url);
    const resource = searchParams.get("type") || "calls";

    if (resource === "notifications") {
      // Return recent communication logs as notifications
      const logs = await prisma.communicationLog.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      const notifications = logs.map((l) => ({
        id: l.id,
        message: `${l.customerName} - ${l.purpose || l.channel}`,
        type: l.channel,
        time: l.createdAt.toISOString(),
        read: l.status === "Completed",
      }));
      return NextResponse.json({ success: true, notifications });
    }

    const calls = await prisma.communicationLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, calls });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;
    const tenantId = session!.user.tenantId;

    const body = await req.json();
    const { action } = body;

    if (action === "schedule-call") {
      const { customerName, phone, purpose, scheduledAt, notes, channel, direction } = body;

      if (!customerName || !phone || !scheduledAt) {
        return NextResponse.json(
          { success: false, error: "Customer name, phone and scheduled time are required" },
          { status: 400 }
        );
      }

      const call = await prisma.communicationLog.create({
        data: {
          tenantId,
          customerName,
          phone,
          purpose: purpose || "Follow-up Call",
          status: "Scheduled",
          scheduledAt: new Date(scheduledAt),
          notes: notes || null,
          channel: channel || "call",
          direction: direction || "outbound",
        },
      });

      return NextResponse.json({ success: true, call });
    }

    if (action === "update-call-status") {
      const { id, status } = body;

      if (!id || !status) {
        return NextResponse.json({ success: false, error: "ID and status are required" }, { status: 400 });
      }

      const existing = await prisma.communicationLog.findUnique({ where: { id } });
      if (!existing || existing.tenantId !== tenantId) {
        return NextResponse.json({ success: false, error: "Communication log not found" }, { status: 404 });
      }

      const data: any = { status };
      if (status === "Completed") data.completedAt = new Date();

      const call = await prisma.communicationLog.update({ where: { id }, data });
      return NextResponse.json({ success: true, call });
    }

    if (action === "send-bulk") {
      const { channel, customers, message } = body;

      // customers should be an array of { customerName, phone }
      const customerList: Array<{ customerName: string; phone?: string }> = Array.isArray(customers) ? customers : [];

      if (customerList.length === 0) {
        return NextResponse.json({
          success: true,
          message: `${channel || "bulk"} message queued`,
          sentCount: 0,
        });
      }

      await prisma.communicationLog.createMany({
        data: customerList.map((c) => ({
          tenantId,
          customerName: c.customerName,
          phone: c.phone || null,
          channel: channel || "whatsapp",
          purpose: message || "Bulk message",
          status: "Completed",
          direction: "outbound",
          completedAt: new Date(),
        })),
      });

      return NextResponse.json({
        success: true,
        message: `${channel || "bulk"} message sent to ${customerList.length} customers`,
        sentCount: customerList.length,
      });
    }

    if (action === "mark-read") {
      const { id } = body;
      if (id) {
        const existing = await prisma.communicationLog.findUnique({ where: { id } });
        if (existing && existing.tenantId === tenantId) {
          await prisma.communicationLog.update({
            where: { id },
            data: { status: "Completed" },
          });
        }
      }
      return NextResponse.json({ success: true });
    }

    if (action === "send-notification") {
      const { customerName, phone, message, type } = body;
      const log = await prisma.communicationLog.create({
        data: {
          tenantId,
          customerName: customerName || "System",
          phone: phone || null,
          channel: type || "call",
          purpose: message || "Notification",
          status: "Completed",
          direction: "outbound",
          completedAt: new Date(),
        },
      });
      return NextResponse.json({ success: true, notification: log });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;
    const tenantId = session!.user.tenantId;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    const existing = await prisma.communicationLog.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== tenantId) {
      return NextResponse.json({ success: false, error: "Log not found" }, { status: 404 });
    }

    await prisma.communicationLog.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
