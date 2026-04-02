// GET /api/subscriptions/status — Get current tenant subscription details
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.tenantId;

    // Get tenant info
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { plan: true, subscriptionExpiry: true, name: true },
    });

    // Get active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        tenantId,
        status: { in: ["ACTIVE", "TRIAL"] },
      },
      orderBy: { createdAt: "desc" },
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    // Get payment history
    const allPayments = await prisma.subscriptionPayment.findMany({
      where: { subscription: { tenantId } },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      tenant: {
        name: tenant?.name,
        plan: tenant?.plan || "FREE",
        subscriptionExpiry: tenant?.subscriptionExpiry,
      },
      subscription: subscription
        ? {
            id: subscription.id,
            plan: subscription.plan,
            status: subscription.status,
            billingCycle: subscription.billingCycle,
            amount: subscription.amount,
            currency: subscription.currency,
            trialEndsAt: subscription.trialEndsAt,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            paymentProvider: subscription.paymentProvider,
            cancelledAt: subscription.cancelledAt,
          }
        : null,
      payments: allPayments.map((p) => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        provider: p.paymentProvider,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("Subscription status error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
