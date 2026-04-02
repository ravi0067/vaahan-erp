// GET /api/subscriptions/paypal/capture
// PayPal redirects here after user approves payment
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { capturePayPalOrder, getPeriodEndDate } from "@/lib/payment-providers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token"); // PayPal order ID

    if (!token) {
      return NextResponse.redirect(new URL("/pricing?error=missing_token", req.url));
    }

    // Capture the payment
    const capture = await capturePayPalOrder(token);

    if (capture.status !== "COMPLETED") {
      return NextResponse.redirect(new URL(`/pricing?error=payment_${capture.status}`, req.url));
    }

    // Extract details from the capture
    const purchaseUnit = capture.purchase_units?.[0];
    const captureDetails = purchaseUnit?.payments?.captures?.[0];
    const customData = purchaseUnit?.custom_id ? JSON.parse(purchaseUnit.custom_id) : null;

    if (!customData?.tenantId) {
      return NextResponse.redirect(new URL("/pricing?error=invalid_order", req.url));
    }

    const { tenantId, plan, cycle } = customData;
    const amount = parseFloat(captureDetails?.amount?.value || "0");
    const now = new Date();
    const periodEnd = getPeriodEndDate(cycle || "monthly");

    // Find subscription by PayPal order ID
    const subscription = await prisma.subscription.findFirst({
      where: { tenantId, providerSubId: token },
    });

    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });

      await prisma.subscriptionPayment.create({
        data: {
          subscriptionId: subscription.id,
          amount,
          currency: captureDetails?.amount?.currency_code || "INR",
          status: "success",
          paymentProvider: "paypal",
          providerPayId: captureDetails?.id,
          providerOrderId: token,
          paidAt: now,
        },
      });
    } else {
      // Create fresh subscription
      const planEnum = { basic: "BASIC", pro: "PRO", enterprise: "ENTERPRISE" }[plan] as any;
      const newSub = await prisma.subscription.create({
        data: {
          tenantId,
          plan: planEnum || "PRO",
          status: "ACTIVE",
          billingCycle: cycle === "yearly" ? "YEARLY" : "MONTHLY",
          amount,
          currency: "INR",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          paymentProvider: "paypal",
          providerSubId: token,
        },
      });

      await prisma.subscriptionPayment.create({
        data: {
          subscriptionId: newSub.id,
          amount,
          currency: captureDetails?.amount?.currency_code || "INR",
          status: "success",
          paymentProvider: "paypal",
          providerPayId: captureDetails?.id,
          providerOrderId: token,
          paidAt: now,
        },
      });
    }

    // Update tenant plan
    const planEnum = { basic: "BASIC", pro: "PRO", enterprise: "ENTERPRISE" }[plan] as any;
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        plan: planEnum || "PRO",
        subscriptionExpiry: periodEnd,
      },
    });

    // Redirect to success page
    return NextResponse.redirect(
      new URL(`/settings?tab=subscription&success=true&plan=${plan}`, req.url)
    );
  } catch (error: any) {
    console.error("PayPal capture error:", error);
    return NextResponse.redirect(new URL(`/pricing?error=${encodeURIComponent(error.message)}`, req.url));
  }
}
