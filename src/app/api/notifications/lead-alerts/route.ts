/**
 * GET /api/notifications/lead-alerts — All unread lead notifications for the user
 * POST /api/notifications/lead-alerts — Mark notifications as read
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;
    const tenantId = session!.user.tenantId;
    const userId = session!.user.id;

    const notifications = await prisma.leadNotification.findMany({
      where: {
        tenantId,
        OR: [{ userId }, { userId: null }],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        lead: {
          select: { id: true, customerName: true, mobile: true, status: true },
        },
      },
    });

    const unreadCount = notifications.filter((n: any) => !n.isRead).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    console.error("Notifications error:", error);
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;
    const tenantId = session!.user.tenantId;

    const body = await req.json();
    const { ids, markAll } = body;

    if (markAll) {
      await prisma.leadNotification.updateMany({
        where: { tenantId, isRead: false },
        data: { isRead: true },
      });
    } else if (ids?.length) {
      await prisma.leadNotification.updateMany({
        where: { id: { in: ids }, tenantId },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
