// POST /api/subscriptions/verify-payment
// Verifies Razorpay payment signature and activates subscription
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  verifyRazorpayPayment,
  getPeriodEndDate,
  PLAN_PRICES,
  PlanId,
  BillingCycle,
} from "@/lib/payment-providers";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      cycle,
    } = body;

    // Verify signature
    const isValid = await verifyRazorpayPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const tenantId = session.user.tenantId;
    const billingCycle: BillingCycle = cycle || "monthly";
    const planId: PlanId = plan || "pro";
    const price = PLAN_PRICES[planId];
    const amount = billingCycle === "yearly" ? price.yearly : price.monthly;

    // Find or create subscription
    const subscription = await prisma.subscription.findFirst({
      where: { tenantId, providerSubId: razorpay_order_id },
    });

    const now = new Date();
    const periodEnd = getPeriodEndDate(billingCycle);

    if (subscription) {
      // Update existing
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });

      // Record payment
      await prisma.subscriptionPayment.create({
        data: {
          subscriptionId: subscription.id,
          amount,
          currency: "INR",
          status: "success",
          paymentProvider: "razorpay",
          providerPayId: razorpay_payment_id,
          providerOrderId: razorpay_order_id,
          paidAt: now,
        },
      });
    } else {
      // Create new subscription with payment
      const planEnum = { basic: "BASIC", pro: "PRO", enterprise: "ENTERPRISE" }[planId] as any;
      const newSub = await prisma.subscription.create({
        data: {
          tenantId,
          plan: planEnum,
          status: "ACTIVE",
          billingCycle: billingCycle === "yearly" ? "YEARLY" : "MONTHLY",
          amount,
          currency: "INR",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          paymentProvider: "razorpay",
          providerSubId: razorpay_order_id,
        },
      });

      await prisma.subscriptionPayment.create({
        data: {
          subscriptionId: newSub.id,
          amount,
          currency: "INR",
          status: "success",
          paymentProvider: "razorpay",
          providerPayId: razorpay_payment_id,
          providerOrderId: razorpay_order_id,
          paidAt: now,
        },
      });
    }

    // Update tenant plan
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        plan: { basic: "BASIC", pro: "PRO", enterprise: "ENTERPRISE" }[planId] as any,
        subscriptionExpiry: periodEnd,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified & subscription activated!",
      plan: price.name,
      expiresAt: periodEnd.toISOString(),
    });
  } catch (error: any) {
    console.error("Verify payment error:", error);
    return NextResponse.json({ error: error.message || "Payment verification failed" }, { status: 500 });
  }
}
