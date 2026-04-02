// POST /api/subscriptions/cancel — Cancel current subscription
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.tenantId;

    const subscription = await prisma.subscription.findFirst({
      where: { tenantId, status: { in: ["ACTIVE", "TRIAL"] } },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    // Cancel — access continues until period end
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled. Access continues until current period ends.",
      accessUntil: subscription.currentPeriodEnd || subscription.trialEndsAt,
    });
  } catch (error: any) {
    console.error("Cancel error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
