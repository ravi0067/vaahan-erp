/**
 * GET /api/dashboard/quick-stats — Real-time dashboard stats from DB
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ collection: 0, pendingDeliveries: 0, openServiceJobs: 0, notifications: 0 });
    }
    const tenantId = session.user.tenantId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayBookings, pendingDeliveries, openServiceJobs] = await Promise.all([
      // Today's collection from bookings
      prisma.booking.findMany({
        where: { tenantId, createdAt: { gte: today } },
        select: { totalAmount: true },
      }),
      // Pending deliveries
      prisma.booking.count({
        where: { tenantId, status: "CONFIRMED" },
      }),
      // Open service jobs
      prisma.serviceJob.count({
        where: { tenantId, status: { in: ["PENDING", "IN_PROGRESS"] } },
      }).catch(() => 0), // ServiceJob table might not exist yet
    ]);

    const collection = todayBookings.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);

    return NextResponse.json({
      collection,
      pendingDeliveries,
      openServiceJobs: typeof openServiceJobs === "number" ? openServiceJobs : 0,
      notifications: 0,
    });
  } catch (error: any) {
    console.error("Quick stats error:", error);
    return NextResponse.json({ collection: 0, pendingDeliveries: 0, openServiceJobs: 0, notifications: 0 });
  }
}
