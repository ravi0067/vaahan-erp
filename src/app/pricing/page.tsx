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
// ── Plan Configuration ──────────────────────────────────────────────────
const plans = [
  {
    id: "basic",
    name: "ERP Basic",
    tagline: "The Hook — Chhote Showrooms",
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
      { text: "Vaani AI Voice Bot", included: false },
      { text: "Priority Support", included: false },
    ],
  },
  {
    id: "pro",
    name: "ERP Pro",
    tagline: "The Money Maker — Serious Dealers",
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
      { text: "Desktop Billing Software (FREE) 💿", included: true },
      { text: "AI Chatbot — 52+ Tools 🤖", included: true },
      { text: "WhatsApp Bot (1000 msg/mo)", included: true },
      { text: "Exotel Auto-Calling (500)", included: true },
      { text: "Live Tracking — Swiggy Style 🛵", included: true },
      { text: "Premium Daybook & Reports", included: true },
      { text: "Up to 10 User Access", included: true },
      { text: "Unlimited Leads", included: true },
      { text: "SMS Notifications (MSG91)", included: true },
      { text: "Email + Chat Support", included: true },
      { text: "Vaani AI Voice Bot", included: false },
    ],
    usageNote: "Usage: ₹1/WA • ₹2/AI • ₹3/Call",
  },
  {
    id: "enterprise",
    name: "ERP Enterprise",
    tagline: "The VIP — Multi-Location Chains",
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
      { text: "Desktop Billing Software (FREE) 🛡️", included: true },
      { text: "Unlimited Users", included: true },
      { text: "Multi-Location (2-3 branches)", included: true },
      { text: "Vaani AI Voice Bot 🎙️", included: true },
      { text: "Unlimited WhatsApp + Calls", included: true },
      { text: "Advanced Analytics Dashboard", included: true },
      { text: "Custom Report Builder", included: true },
      { text: "Priority Support — 24/7", included: true },
      { text: "Dedicated Account Manager", included: true },
      { text: "Vaani AI Avatar TV Setup 🖥️", included: true },
      { text: "SLA Guarantee — 99.9%", included: true },
    ],
  },
  {
    id: "books-pro",
    name: "VaahanBooks Pro",
    tagline: "Only Billing — Single Shop",
    monthlyPrice: 249,
    yearlyPrice: 2499,
    icon: BarChart3,
    color: "teal",
    borderColor: "border-teal-200 hover:border-teal-400",
    bgGradient: "from-teal-50 to-teal-100/50",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    buttonClass: "bg-teal-600 hover:bg-teal-700",
    popular: false,
    maxUsers: 1,
    features: [
      { text: "Desktop Software License", included: true },
      { text: "Unlimited Invoicing", included: true },
      { text: "GSTR 1/3B Reports", included: true },
      { text: "Offline-First Database", included: true },
      { text: "Inventory Tracking", included: true },
      { text: "Cash Tracking", included: true },
      { text: "Expense Manager", included: true },
    ],
  },
  {
    id: "books-ent",
    name: "VaahanBooks Ent.",
    tagline: "CA & Multi-Company Billing",
    monthlyPrice: 499,
    yearlyPrice: 4999,
    icon: Shield,
    color: "indigo",
    borderColor: "border-indigo-200 hover:border-indigo-400",
    bgGradient: "from-indigo-50 to-indigo-100/50",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    buttonClass: "bg-indigo-600 hover:bg-indigo-700",
    popular: false,
    maxUsers: 5,
    features: [
      { text: "Everything in Books Pro", included: true },
      { text: "Multi-Company (Up to 10)", included: true },
      { text: "AI Financial Assistant", included: true },
      { text: "Cloud Data Sync", included: true },
      { text: "Priority Support", included: true },
      { text: "Tally XML Export", included: true },
      { text: "Multi-User (Up to 5)", included: true },
    ],
  },
];

const faqs = [
  {
    q: "Free trial mein kya milega?",
    a: "Poore 1 month tak aapko Pro plan ki saari features milegi — koi credit card nahi chahiye. Trial khatam hone par aap apna plan choose kar sakte ho.",
  },
  {
    q: "Kya ERP users ko Billing Software alag se lena hoga?",
    a: "Nahi! Agar aap VaahanERP Pro ya Enterprise user hain, toh 'VaahanBooks Desktop App' aapke liye bilkul FREE hai.",
  },
  {
    q: "Kya main plan switch kar sakta hoon?",
    a: "Haan! Aap kabhi bhi upgrade ya downgrade kar sakte ho. Upgrade turant activate hota hai, downgrade next billing cycle se.",
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
          <div className="flex gap-2 items-center">
            <Link href="/blog">
              <Button variant="ghost">Blog</Button>
            </Link>
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
          Apni dealership ya billing needs ke hisaab se plan choose karo. Sab ke liye options hain.
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
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5 items-start">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden border-2 transition-all ${plan.borderColor} ${
                plan.popular ? "md:-mt-4 md:mb-0 shadow-2xl scale-[1.02]" : "shadow-lg"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center text-[10px] font-bold py-1">
                  ⭐ RECOMMENDED
                </div>
              )}
              <CardContent className={`p-4 ${plan.popular ? "pt-8" : "pt-4"}`}>
                <div className={`w-10 h-10 rounded-xl ${plan.iconBg} flex items-center justify-center mb-3`}>
                  <plan.icon className={`h-5 w-5 ${plan.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold leading-tight">{plan.name}</h3>
                <p className="text-[10px] text-muted-foreground mb-3 h-8">{plan.tagline}</p>

                <div className="mb-1">
                  <span className="text-2xl font-bold">
                    ₹{formatPrice(isYearly ? plan.yearlyPrice : plan.monthlyPrice)}
                  </span>
                  <span className="text-muted-foreground text-[10px]">
                    /{isYearly ? "yr" : "mo"}
                  </span>
                </div>
                
                <Link href={`/register?plan=${plan.id}&cycle=${isYearly ? "yearly" : "monthly"}`}>
                  <Button className={`w-full mb-4 ${plan.buttonClass} text-white h-9 text-xs`} size="sm">
                    Select Plan
                  </Button>
                </Link>

                <div className="space-y-2">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px]">
                      {f.included ? (
                        <Check className="h-3 w-3 text-green-600 mt-0.5" />
                      ) : (
                        <X className="h-3 w-3 text-muted-foreground/40 mt-0.5" />
                      )}
                      <span className={f.included ? "" : "text-muted-foreground/50"}>{f.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact & Footer Section */}
      <section className="bg-muted/30 border-t">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-center mb-8">Contact Us</h2>
          <div className="grid gap-6 sm:grid-cols-3 text-center">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-primary text-lg">📍</span>
              </div>
              <p className="font-medium">Address</p>
              <p className="text-sm text-muted-foreground">Chinhat, Gomti Nagar, Lucknow 226028</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-primary text-lg">📧</span>
              </div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-muted-foreground">support@vaahanerp.com</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-primary text-lg">📞</span>
              </div>
              <p className="font-medium">Phone</p>
              <p className="text-sm text-muted-foreground">+91 9554762008</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">V</span>
            </div>
            <span className="font-semibold">VaahanERP</span>
          </div>
          <p className="text-sm text-muted-foreground italic">
            Powered by Ravi Accounting Services
          </p>
          <p className="text-sm text-muted-foreground">
            © 2026 Ravi Accounting Services. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <a href="/privacy-policy" className="hover:text-primary underline">Privacy Policy</a>
            <a href="/terms" className="hover:text-primary underline">Terms of Service</a>
            <a href="/data-deletion" className="hover:text-primary underline">Data Deletion</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
