"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  X,
  ArrowRight,
  Bike,
  Crown,
  Zap,
  Building2,
  Star,
  Gift,
  Shield,
  Phone,
  MessageSquare,
  Bot,
  BarChart3,
  Users,
  Headphones,
  Sparkles,
} from "lucide-react";

// ── Plan Configuration ──────────────────────────────────────────────────
const plans = [
  {
    id: "basic",
    name: "Basic",
    tagline: "The Hook — Chhote Showrooms ke liye",
    monthlyPrice: 4999,
    yearlyPrice: 49999,
    icon: Zap,
    color: "blue",
    borderColor: "border-blue-200 hover:border-blue-400",
    bgGradient: "from-blue-50 to-blue-100/50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    buttonClass: "bg-blue-600 hover:bg-blue-700",
    popular: false,
    maxUsers: 2,
    features: [
      { text: "Booking Engine", included: true },
      { text: "CashFlow & Daybook", included: true },
      { text: "Inventory Management", included: true },
      { text: "Basic Reports & Analytics", included: true },
      { text: "Lead CRM (50 leads/month)", included: true },
      { text: "2 User Access", included: true },
      { text: "Email Support", included: true },
      { text: "AI Chatbot (52 Tools)", included: false },
      { text: "WhatsApp Bot", included: false },
      { text: "Exotel Auto-Calling", included: false },
      { text: "Live Tracking (Swiggy-style)", included: false },
      { text: "Vaani AI Voice Bot", included: false },
      { text: "Priority Support", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "The Money Maker — Serious Dealers ke liye",
    monthlyPrice: 9999,
    yearlyPrice: 99999,
    icon: Crown,
    color: "purple",
    borderColor: "border-purple-300 hover:border-purple-500",
    bgGradient: "from-purple-50 to-purple-100/50",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    buttonClass: "bg-purple-600 hover:bg-purple-700",
    popular: true,
    maxUsers: 10,
    features: [
      { text: "Everything in Basic", included: true },
      { text: "AI Chatbot — 52+ Tools 🤖", included: true },
      { text: "WhatsApp Bot (1000 msg/mo free)", included: true },
      { text: "Exotel Auto-Calling (500 calls/mo)", included: true },
      { text: "Live Tracking — Swiggy Style 🛵", included: true },
      { text: "Premium Daybook & Reports", included: true },
      { text: "Up to 10 User Access", included: true },
      { text: "Unlimited Leads", included: true },
      { text: "SMS Notifications (MSG91)", included: true },
      { text: "Email + Chat Support", included: true },
      { text: "Vaani AI Voice Bot", included: false },
      { text: "Multi-Location Support", included: false },
      { text: "Priority Support", included: false },
    ],
    usageNote: "Limit ke baad: ₹1/WhatsApp msg • ₹2/AI query • ₹3/call min",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "The VIP — Multi-Location Chains ke liye",
    monthlyPrice: 14999,
    yearlyPrice: 149999,
    icon: Building2,
    color: "amber",
    borderColor: "border-amber-300 hover:border-amber-500",
    bgGradient: "from-amber-50 to-amber-100/50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    buttonClass: "bg-amber-600 hover:bg-amber-700",
    popular: false,
    maxUsers: -1, // unlimited
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Unlimited Users", included: true },
      { text: "Multi-Location (2-3 branches)", included: true },
      { text: "Vaani AI Voice Bot 🎙️", included: true },
      { text: "Unlimited WhatsApp + Calls", included: true },
      { text: "Unlimited AI Queries", included: true },
      { text: "Advanced Analytics Dashboard", included: true },
      { text: "Custom Report Builder", included: true },
      { text: "Priority Support — 24/7", included: true },
      { text: "Dedicated Account Manager", included: true },
      { text: "Vaani AI Avatar TV Setup 🖥️", included: true },
      { text: "Custom Integrations", included: true },
      { text: "SLA Guarantee — 99.9% Uptime", included: true },
    ],
  },
];

const faqs = [
  {
    q: "Free trial mein kya milega?",
    a: "Poore 1 month tak aapko Pro plan ki saari features milegi — koi credit card nahi chahiye. Trial khatam hone par aap apna plan choose kar sakte ho.",
  },
  {
    q: "Kya main plan switch kar sakta hoon?",
    a: "Haan! Aap kabhi bhi upgrade ya downgrade kar sakte ho. Upgrade turant activate hota hai, downgrade next billing cycle se.",
  },
  {
    q: "Payment kaise hoga?",
    a: "India mein Razorpay (UPI, Cards, Net Banking) aur international clients ke liye PayPal support hai. Auto-recurring billing har month/year.",
  },
  {
    q: "Usage limit cross karne par kya hoga?",
    a: "Pro plan mein 1000 WhatsApp messages aur 500 AI queries free hain. Uske baad per-use charge lagta hai — ₹1/msg, ₹2/query. Enterprise mein sab unlimited hai.",
  },
  {
    q: "Kya data safe rahega?",
    a: "Bilkul! Enterprise-grade encryption, daily backups, aur Supabase (PostgreSQL) pe hosted. Aapka data sirf aapka hai.",
  },
  {
    q: "Cancel kaise karein?",
    a: "Settings > Subscription se ek click mein cancel. Koi hidden charges nahi. Current period tak access rahega.",
  },
];

const stats = [
  { label: "AI Tools", value: "53+" },
  { label: "Indian Languages", value: "12" },
  { label: "Uptime", value: "99.9%" },
  { label: "Dealerships", value: "Growing" },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN").format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Navbar */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">V</span>
            </div>
            <Image src="/logo.png" alt="VaahanERP" width={140} height={40} className="h-9 w-auto" />
          </Link>
          <div className="flex gap-2">
            <Link href="/register">
              <Button variant="outline">Register</Button>
            </Link>
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold mb-6 animate-pulse">
          <Gift className="h-4 w-4" />
          🎉 1 Month FREE Trial — No Credit Card Required!
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Apni dealership ke size ke hisaab se plan choose karo. Chhota showroom ho ya multi-location chain — sab ke liye plan hai.
        </p>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mb-10">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-primary">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-medium ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              isYearly ? "bg-green-600" : "bg-muted-foreground/30"
            }`}
          >
            <div
              className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                isYearly ? "translate-x-7" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>
            Yearly
          </span>
          {isYearly && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
              Save ~17% — 2 Months FREE!
            </span>
          )}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid gap-8 md:grid-cols-3 items-start">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden border-2 transition-all ${plan.borderColor} ${
                plan.popular ? "md:-mt-4 md:mb-0 shadow-2xl scale-[1.02]" : "shadow-lg"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center text-xs font-bold py-1.5">
                  ⭐ MOST POPULAR — Best Value!
                </div>
              )}
              <CardContent className={`p-6 ${plan.popular ? "pt-10" : "pt-6"}`}>
                {/* Header */}
                <div className={`w-14 h-14 rounded-2xl ${plan.iconBg} flex items-center justify-center mb-4`}>
                  <plan.icon className={`h-7 w-7 ${plan.iconColor}`} />
                </div>
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.tagline}</p>

                {/* Price */}
                <div className="mb-1">
                  <span className="text-4xl font-bold">
                    ₹{formatPrice(isYearly ? plan.yearlyPrice : plan.monthlyPrice)}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    /{isYearly ? "year" : "month"}
                  </span>
                </div>
                {isYearly && (
                  <p className="text-xs text-green-600 font-medium mb-4">
                    = ₹{formatPrice(Math.round(plan.yearlyPrice / 12))}/month (2 months free!)
                  </p>
                )}
                {!isYearly && <div className="mb-4" />}

                {/* Users */}
                <div className="flex items-center gap-2 mb-4 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{plan.maxUsers === -1 ? "Unlimited Users" : `Up to ${plan.maxUsers} Users`}</span>
                </div>

                {/* CTA */}
                <Link href={`/register?plan=${plan.id}&cycle=${isYearly ? "yearly" : "monthly"}`}>
                  <Button className={`w-full mb-6 ${plan.buttonClass} text-white`} size="lg">
                    Start Free Trial <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm">
                      {f.included ? (
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/40 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={f.included ? "" : "text-muted-foreground/50"}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Usage Note */}
                {plan.usageNote && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                    <Sparkles className="h-3.5 w-3.5 inline mr-1" />
                    {plan.usageNote}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
          Feature Comparison
        </h2>
        <p className="text-center text-muted-foreground mb-8">
          Har plan mein kya milega — ek nazar mein dekho
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-4 font-semibold">Feature</th>
                <th className="text-center p-4 font-semibold text-blue-600">Basic</th>
                <th className="text-center p-4 font-semibold text-purple-600">Pro ⭐</th>
                <th className="text-center p-4 font-semibold text-amber-600">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                ["Core ERP (Booking, Inventory, CRM)", "✅", "✅", "✅"],
                ["CashFlow & Daybook", "✅", "✅ Premium", "✅ Premium"],
                ["Reports & Analytics", "Basic", "Advanced", "Custom Builder"],
                ["User Access", "2", "10", "Unlimited"],
                ["Lead CRM", "50/month", "Unlimited", "Unlimited"],
                ["AI Chatbot (52+ Tools)", "❌", "✅", "✅"],
                ["WhatsApp Bot", "❌", "1000 msg/mo", "Unlimited"],
                ["Exotel Auto-Calling", "❌", "500 calls/mo", "Unlimited"],
                ["Live Tracking (Swiggy-style)", "❌", "✅", "✅"],
                ["SMS Notifications", "❌", "✅", "✅"],
                ["Vaani AI Voice Bot", "❌", "❌", "✅"],
                ["Multi-Location Support", "❌", "❌", "✅"],
                ["Priority Support 24/7", "❌", "❌", "✅"],
                ["Vaani AI Avatar TV", "❌", "❌", "✅ Included"],
              ].map(([feature, basic, pro, enterprise], i) => (
                <tr key={i} className="hover:bg-muted/30">
                  <td className="p-3 font-medium">{feature}</td>
                  <td className="p-3 text-center">{basic}</td>
                  <td className="p-3 text-center">{pro}</td>
                  <td className="p-3 text-center">{enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="bg-muted/30 border-y">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-3">💳 Payment Methods</h2>
          <p className="text-muted-foreground mb-8">India + International — dono supported hai</p>
          <div className="grid sm:grid-cols-2 gap-6 max-w-xl mx-auto">
            <Card className="border-2 hover:border-blue-300 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">🇮🇳</div>
                <h3 className="font-bold text-lg mb-1">Razorpay</h3>
                <p className="text-sm text-muted-foreground">UPI • Credit/Debit Card • Net Banking • Wallets</p>
                <p className="text-xs text-green-600 mt-2 font-medium">Recommended for India</p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-indigo-300 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">🌍</div>
                <h3 className="font-bold text-lg mb-1">PayPal</h3>
                <p className="text-sm text-muted-foreground">International Cards • PayPal Balance • Bank Transfer</p>
                <p className="text-xs text-blue-600 mt-2 font-medium">For NRI & International Dealers</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
          ❓ Frequently Asked Questions
        </h2>
        <p className="text-center text-muted-foreground mb-8">
          Sawaal? Yahan jawab hai!
        </p>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-4 text-left font-medium flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                {faq.q}
                <span className="text-muted-foreground ml-2 text-lg">
                  {openFaq === i ? "−" : "+"}
                </span>
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            🚀 Abhi Start Karo — 1 Month FREE!
          </h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">
            Koi credit card nahi chahiye. 30 din tak poora Pro plan try karo. Pasand aaye toh continue karo, nahi toh koi charge nahi.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="gap-2 text-base px-8 font-bold">
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">V</span>
            </div>
            <span className="font-semibold">VaahanERP</span>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <Link href="/pricing" className="hover:text-foreground font-medium text-foreground">Pricing</Link>
            <Link href="/login" className="hover:text-foreground">Login</Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Ravi Accounting Services. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
