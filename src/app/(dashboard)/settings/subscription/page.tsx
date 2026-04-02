"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Zap,
  Building2,
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowUpRight,
  Loader2,
  Receipt,
  Shield,
  Gift,
} from "lucide-react";

interface Subscription {
  id: string;
  plan: string;
  status: string;
  billingCycle: string;
  amount: number;
  currency: string;
  trialEndsAt: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  paymentProvider: string | null;
  cancelledAt: string | null;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  paidAt: string | null;
  createdAt: string;
}

interface SubData {
  tenant: { name: string; plan: string; subscriptionExpiry: string | null };
  subscription: Subscription | null;
  payments: Payment[];
}

const PLAN_PRICES = {
  BASIC: { monthly: 4999, yearly: 49999 },
  PRO: { monthly: 9999, yearly: 99999 },
  ENTERPRISE: { monthly: 14999, yearly: 149999 },
} as Record<string, { monthly: number; yearly: number }>;

const planIcons: Record<string, typeof Zap> = {
  FREE: Gift,
  BASIC: Zap,
  STARTER: Zap,
  PRO: Crown,
  PROFESSIONAL: Crown,
  ENTERPRISE: Building2,
};

const planColors: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-700",
  BASIC: "bg-blue-100 text-blue-700",
  STARTER: "bg-blue-100 text-blue-700",
  PRO: "bg-purple-100 text-purple-700",
  PROFESSIONAL: "bg-purple-100 text-purple-700",
  ENTERPRISE: "bg-amber-100 text-amber-700",
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  TRIAL: "bg-blue-100 text-blue-700",
  PAST_DUE: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-700",
  EXPIRED: "bg-red-100 text-red-700",
};

const statusIcons: Record<string, typeof CheckCircle2> = {
  ACTIVE: CheckCircle2,
  TRIAL: Gift,
  PAST_DUE: AlertTriangle,
  CANCELLED: XCircle,
  EXPIRED: XCircle,
};

export default function SubscriptionPage() {
  const [data, setData] = useState<SubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [showCancel, setShowCancel] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      const res = await fetch("/api/subscriptions/status");
      if (res.ok) setData(await res.json());
    } catch {}
    setLoading(false);
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      const res = await fetch("/api/subscriptions/cancel", { method: "POST" });
      if (res.ok) {
        await fetchStatus();
        setShowCancel(false);
      }
    } catch {}
    setCancelling(false);
  }

  async function handleUpgrade(plan: string, cycle: string, provider: string) {
    setUpgrading(plan);
    try {
      const res = await fetch("/api/subscriptions/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.toLowerCase(), cycle, provider }),
      });
      const order = await res.json();

      if (provider === "paypal" && order.approveUrl) {
        window.location.href = order.approveUrl;
      } else if (provider === "razorpay" && order.orderId) {
        // Open Razorpay checkout
        const keyId = await order.keyId;
        const options = {
          key: keyId,
          amount: order.amount,
          currency: order.currency || "INR",
          name: "VaahanERP",
          description: order.plan,
          order_id: order.orderId,
          handler: async function (response: any) {
            const verifyRes = await fetch("/api/subscriptions/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: plan.toLowerCase(),
                cycle,
              }),
            });
            if (verifyRes.ok) {
              await fetchStatus();
            }
          },
          theme: { color: "#7c3aed" },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch {}
    setUpgrading(null);
  }

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  const fmtPrice = (n: number) => `₹${new Intl.NumberFormat("en-IN").format(n)}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const plan = data?.tenant?.plan || "FREE";
  const sub = data?.subscription;
  const PlanIcon = planIcons[plan] || Gift;
  const StatusIcon = statusIcons[sub?.status || ""] || Gift;
  const isActive = sub?.status === "ACTIVE" || sub?.status === "TRIAL";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          Subscription & Billing
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Apna plan manage karo, billing dekhein, aur upgrade/downgrade karein
        </p>
      </div>

      {/* Current Plan Card */}
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${planColors[plan] || "bg-gray-100"}`}>
                <PlanIcon className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{plan} Plan</h2>
                  {sub && (
                    <Badge className={statusColors[sub.status] || "bg-gray-100"}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {sub.status}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {data?.tenant?.name || "Your Dealership"}
                </p>
              </div>
            </div>

            {plan !== "FREE" && sub && (
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {fmtPrice(Number(sub.amount))}
                  <span className="text-sm text-muted-foreground font-normal">
                    /{sub.billingCycle === "YEARLY" ? "year" : "month"}
                  </span>
                </div>
                {sub.paymentProvider && (
                  <p className="text-xs text-muted-foreground capitalize">
                    via {sub.paymentProvider}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Dates */}
          {sub && (
            <div className="grid sm:grid-cols-3 gap-4 mt-6 pt-4 border-t">
              {sub.status === "TRIAL" && sub.trialEndsAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Gift className="h-4 w-4 text-blue-500" />
                  <span className="text-muted-foreground">Trial Ends:</span>
                  <span className="font-medium">{fmt(sub.trialEndsAt)}</span>
                </div>
              )}
              {sub.currentPeriodStart && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">Period Start:</span>
                  <span className="font-medium">{fmt(sub.currentPeriodStart)}</span>
                </div>
              )}
              {sub.currentPeriodEnd && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  <span className="text-muted-foreground">Renewal:</span>
                  <span className="font-medium">{fmt(sub.currentPeriodEnd)}</span>
                </div>
              )}
              {sub.cancelledAt && (
                <div className="flex items-center gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-muted-foreground">Cancelled:</span>
                  <span className="font-medium">{fmt(sub.cancelledAt)}</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t">
            {(plan === "FREE" || plan === "BASIC" || plan === "STARTER") && (
              <Button
                className="bg-purple-600 hover:bg-purple-700 gap-1"
                onClick={() => handleUpgrade("pro", "monthly", "razorpay")}
                disabled={!!upgrading}
              >
                {upgrading === "pro" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
                Upgrade to Pro — ₹9,999/mo
              </Button>
            )}
            {plan !== "ENTERPRISE" && (
              <Button
                variant="outline"
                className="gap-1 border-amber-300 text-amber-700 hover:bg-amber-50"
                onClick={() => handleUpgrade("enterprise", "monthly", "razorpay")}
                disabled={!!upgrading}
              >
                {upgrading === "enterprise" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
                Go Enterprise — ₹14,999/mo
              </Button>
            )}
            {isActive && plan !== "FREE" && (
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => setShowCancel(true)}
              >
                Cancel Plan
              </Button>
            )}
          </div>

          {/* Cancel Confirmation */}
          {showCancel && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm font-medium text-red-700 mb-3">
                ⚠️ Kya aap sure hain? Cancel karne par current period tak access rahega, uske baad FREE plan pe chale jayenge.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Haan, Cancel Karo
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowCancel(false)}>
                  Nahi, Rehne Do
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Options for Free Users */}
      {plan === "FREE" && (
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Choose a Plan
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { id: "basic", name: "Basic", price: "4,999", icon: Zap, color: "blue" },
              { id: "pro", name: "Pro ⭐", price: "9,999", icon: Crown, color: "purple" },
              { id: "enterprise", name: "Enterprise", price: "14,999", icon: Building2, color: "amber" },
            ].map((p) => (
              <Card key={p.id} className={`border-2 hover:border-${p.color}-400 transition-colors cursor-pointer`}>
                <CardContent className="p-5 text-center space-y-3">
                  <p.icon className={`h-8 w-8 mx-auto text-${p.color}-600`} />
                  <h4 className="font-bold text-lg">{p.name}</h4>
                  <p className="text-2xl font-bold">₹{p.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                  <div className="flex flex-col gap-2">
                    <Button
                      className={`w-full bg-${p.color}-600 hover:bg-${p.color}-700 text-white`}
                      onClick={() => handleUpgrade(p.id, "monthly", "razorpay")}
                      disabled={!!upgrading}
                    >
                      {upgrading === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Razorpay 🇮🇳"}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleUpgrade(p.id, "monthly", "paypal")}
                      disabled={!!upgrading}
                    >
                      PayPal 🌍
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Payment History
          </h3>
          {data?.payments && data.payments.length > 0 ? (
            <div className="space-y-3">
              {data.payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      p.status === "success" ? "bg-green-100" : "bg-red-100"
                    }`}>
                      {p.status === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{fmtPrice(Number(p.amount))}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {p.provider} • {p.status}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{fmt(p.paidAt || p.createdAt)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>Koi payment nahi hua abhi tak</p>
              <p className="text-xs">Plan choose karo upar se!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Note */}
      <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
        <Shield className="h-5 w-5 text-green-600 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-green-800">Secure Payments</p>
          <p className="text-xs text-green-600">
            Saare payments Razorpay/PayPal ke through hote hain — PCI DSS Level 1 certified. Aapki card details humare server pe kabhi save nahi hoti.
          </p>
        </div>
      </div>
    </div>
  );
}
