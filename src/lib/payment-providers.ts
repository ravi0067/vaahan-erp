// ── Payment Provider Utilities (PayPal + Razorpay) ─────────────────────
import prisma from "@/lib/prisma";

// ── Plan pricing config ────────────────────────────────────────────────
export const PLAN_PRICES = {
  basic: { monthly: 4999, yearly: 49999, name: "Basic Plan" },
  pro: { monthly: 9999, yearly: 99999, name: "Pro Plan" },
  enterprise: { monthly: 14999, yearly: 149999, name: "Enterprise Plan" },
} as const;

export type PlanId = keyof typeof PLAN_PRICES;
export type BillingCycle = "monthly" | "yearly";

// ── Get settings from DB ────────────────────────────────────────────────
async function getSetting(key: string): Promise<string | null> {
  const setting = await prisma.systemSetting.findUnique({ where: { key } });
  return setting?.value ?? null;
}

// ── PayPal API ──────────────────────────────────────────────────────────
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = await getSetting("payment.paypal.clientId");
  const secret = await getSetting("payment.paypal.secret");
  const isTestMode = (await getSetting("payment.testMode")) === "true";
  
  if (!clientId || !secret) throw new Error("PayPal credentials not configured");

  const baseUrl = isTestMode
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal auth failed: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function getPayPalBaseUrl(): Promise<string> {
  const isTestMode = (await getSetting("payment.testMode")) === "true";
  return isTestMode
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";
}

export async function createPayPalOrder(
  plan: PlanId,
  cycle: BillingCycle,
  tenantId: string
) {
  const token = await getPayPalAccessToken();
  const baseUrl = await getPayPalBaseUrl();
  const price = PLAN_PRICES[plan];
  const amount = cycle === "yearly" ? price.yearly : price.monthly;

  // Convert INR to USD (approximate — PayPal India uses INR directly if merchant is India-based)
  const currency = "INR";

  const res = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: `${tenantId}_${plan}_${cycle}`,
          description: `${price.name} — ${cycle === "yearly" ? "Annual" : "Monthly"} Subscription`,
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          custom_id: JSON.stringify({ tenantId, plan, cycle }),
        },
      ],
      application_context: {
        brand_name: "VaahanERP",
        landing_page: "LOGIN",
        user_action: "PAY_NOW",
        return_url: `${process.env.NEXTAUTH_URL || "https://www.vaahanerp.com"}/api/subscriptions/paypal/capture`,
        cancel_url: `${process.env.NEXTAUTH_URL || "https://www.vaahanerp.com"}/pricing?cancelled=true`,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal order creation failed: ${err}`);
  }

  return res.json();
}

export async function capturePayPalOrder(orderId: string) {
  const token = await getPayPalAccessToken();
  const baseUrl = await getPayPalBaseUrl();

  const res = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal capture failed: ${err}`);
  }

  return res.json();
}

// ── Razorpay API ────────────────────────────────────────────────────────
export async function getRazorpayCredentials() {
  const keyId = await getSetting("payment.keyId");
  const keySecret = await getSetting("payment.keySecret");
  if (!keyId || !keySecret) throw new Error("Razorpay credentials not configured");
  return { keyId, keySecret };
}

export async function createRazorpayOrder(
  plan: PlanId,
  cycle: BillingCycle,
  tenantId: string
) {
  const { keyId, keySecret } = await getRazorpayCredentials();
  const price = PLAN_PRICES[plan];
  const amount = cycle === "yearly" ? price.yearly : price.monthly;

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amount * 100, // Razorpay uses paise
      currency: "INR",
      receipt: `${tenantId}_${plan}_${cycle}_${Date.now()}`,
      notes: {
        tenantId,
        plan,
        cycle,
        planName: price.name,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Razorpay order creation failed: ${err}`);
  }

  return res.json();
}

export async function verifyRazorpayPayment(
  orderId: string,
  paymentId: string,
  signature: string
) {
  const { keySecret } = await getRazorpayCredentials();
  const crypto = await import("crypto");
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expectedSignature === signature;
}

// ── Subscription Helpers ────────────────────────────────────────────────
export function getPlanEnum(plan: PlanId) {
  const map = { basic: "BASIC", pro: "PRO", enterprise: "ENTERPRISE" } as const;
  return map[plan];
}

export function getTrialEndDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 30); // 30 day trial
  return d;
}

export function getPeriodEndDate(cycle: BillingCycle): Date {
  const d = new Date();
  if (cycle === "yearly") {
    d.setFullYear(d.getFullYear() + 1);
  } else {
    d.setMonth(d.getMonth() + 1);
  }
  return d;
}
