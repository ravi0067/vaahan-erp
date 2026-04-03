/**
 * GET /api/leads/[id]/notifications — Notifications for a specific lead
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;
    const tenantId = session!.user.tenantId;

    const notifications = await prisma.leadNotification.findMany({
      where: { tenantId, leadId: params.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Mark as read
    if (notifications.some((n: any) => !n.isRead)) {
      await prisma.leadNotification.updateMany({
        where: { tenantId, leadId: params.id, isRead: false },
        data: { isRead: true },
      });
    }

    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error("Lead notifications error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
