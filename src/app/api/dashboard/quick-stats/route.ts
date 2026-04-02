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

    const [todayBookings, pendingDeliveries, openJobCards] = await Promise.all([
      // Today's collection from bookings
      prisma.booking.findMany({
        where: { tenantId, createdAt: { gte: today } },
        select: { totalAmount: true },
      }),
      // Pending deliveries (confirmed bookings)
      prisma.booking.count({
        where: { tenantId, status: "CONFIRMED" },
      }),
      // Open job cards (service jobs = JobCard model)
      prisma.jobCard.count({
        where: { tenantId, status: { in: ["OPEN", "IN_PROGRESS"] } },
      }).catch(() => 0),
    ]);

    const collection = todayBookings.reduce(
      (sum: number, b: { totalAmount: any }) => sum + Number(b.totalAmount || 0),
      0
    );

    return NextResponse.json({
      collection,
      pendingDeliveries,
      openServiceJobs: typeof openJobCards === "number" ? openJobCards : 0,
      notifications: 0,
    });
  } catch (error: any) {
    console.error("Quick stats error:", error);
    return NextResponse.json({ collection: 0, pendingDeliveries: 0, openServiceJobs: 0, notifications: 0 });
  }
}
