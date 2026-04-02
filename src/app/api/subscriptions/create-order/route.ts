// POST /api/subscriptions/create-order
// Creates a Razorpay or PayPal order for subscription checkout
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  createPayPalOrder,
  createRazorpayOrder,
  PLAN_PRICES,
  PlanId,
  BillingCycle,
  getTrialEndDate,
  getPlanEnum,
} from "@/lib/payment-providers";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { plan, cycle, provider } = body as {
      plan: PlanId;
      cycle: BillingCycle;
      provider: "razorpay" | "paypal";
    };

    // Validate
    if (!PLAN_PRICES[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    if (!["monthly", "yearly"].includes(cycle)) {
      return NextResponse.json({ error: "Invalid billing cycle" }, { status: 400 });
    }
    if (!["razorpay", "paypal"].includes(provider)) {
      return NextResponse.json({ error: "Invalid payment provider" }, { status: 400 });
    }

    const tenantId = session.user.tenantId;
    const price = PLAN_PRICES[plan];
    const amount = cycle === "yearly" ? price.yearly : price.monthly;

    // Check if already has active subscription
    const existingSub = await prisma.subscription.findFirst({
      where: {
        tenantId,
        status: { in: ["ACTIVE", "TRIAL"] },
      },
    });

    if (provider === "paypal") {
      const order = await createPayPalOrder(plan, cycle, tenantId);
      const approveLink = order.links?.find((l: any) => l.rel === "approve")?.href;

      // Create pending subscription record
      if (!existingSub) {
        await prisma.subscription.create({
          data: {
            tenantId,
            plan: getPlanEnum(plan),
            status: "TRIAL",
            billingCycle: cycle === "yearly" ? "YEARLY" : "MONTHLY",
            amount,
            currency: "INR",
            trialEndsAt: getTrialEndDate(),
            paymentProvider: "paypal",
            providerSubId: order.id,
          },
        });
      }

      return NextResponse.json({
        provider: "paypal",
        orderId: order.id,
        approveUrl: approveLink,
        amount,
        plan: price.name,
      });
    } else {
      // Razorpay
      const order = await createRazorpayOrder(plan, cycle, tenantId);

      if (!existingSub) {
        await prisma.subscription.create({
          data: {
            tenantId,
            plan: getPlanEnum(plan),
            status: "TRIAL",
            billingCycle: cycle === "yearly" ? "YEARLY" : "MONTHLY",
            amount,
            currency: "INR",
            trialEndsAt: getTrialEndDate(),
            paymentProvider: "razorpay",
            providerSubId: order.id,
          },
        });
      }

      return NextResponse.json({
        provider: "razorpay",
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: (await import("@/lib/payment-providers")).getRazorpayCredentials().then(c => c.keyId),
        plan: price.name,
      });
    }
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
