"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  UserPlus,
  ClipboardList,
  Wallet,
  Package,
  Wrench,
  BarChart3,
  ArrowRight,
  Bike,
  Car,
  Shield,
  Smartphone,
  Play,
  Loader2,
} from "lucide-react";
import { PublicChatWidget } from "@/components/chat/PublicChatWidget";

const features = [
  {
    icon: UserPlus,
    title: "Lead CRM",
    desc: "Track every enquiry from walk-in to conversion. Auto follow-up reminders and hot lead alerts.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: ClipboardList,
    title: "Smart Booking",
    desc: "Step-by-step booking wizard with payment tracking, finance integration, and document management.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: Wallet,
    title: "CashFlow & Daybook",
    desc: "Daily cash tracking with daybook lock, multi-mode payments, and complete audit trail.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Package,
    title: "Inventory Management",
    desc: "Real-time stock tracking with chassis/engine search, photo gallery, and availability status.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: Wrench,
    title: "Service & Workshop",
    desc: "Job cards, service history, quick receipt generation, and mechanic assignment.",
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    desc: "Sales reports, revenue dashboards, expense analysis, and custom date-range filters.",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
];

const highlights = [
  { icon: Shield, text: "Role-Based Access Control" },
  { icon: Smartphone, text: "Mobile Responsive" },
  { icon: Bike, text: "Built for Indian Dealerships" },
];

export default function HomePage() {
  const router = useRouter();
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  const handleDemoLogin = async (email: string, password: string, type: string) => {
    setDemoLoading(type);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!result?.error) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      // silently fail
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Navbar */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">V</span>
            </div>
            <Image src="/logo.png" alt="VaahanERP" width={140} height={40} className="h-9 w-auto" />
          </div>
          <div className="flex gap-2">
            <Link href="/register">
              <Button variant="outline">Register</Button>
            </Link>
            <Link href="/login">
              <Button>Login to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Bike className="h-4 w-4" />
          Built for Indian Vehicle Dealerships
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          VaahanERP
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-2">
          Smart Dealership Management
        </p>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-8">
          Complete ERP solution for Indian vehicle dealerships — Bikes, Cars & EVs.
          Manage leads, bookings, inventory, cashflow, service, and more — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register">
            <Button size="lg" className="gap-2 text-base px-8">
              Register Your Dealership <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="gap-2 text-base px-8">
              Login to Dashboard
            </Button>
          </Link>
        </div>

        {/* Quick highlights */}
        <div className="flex flex-wrap justify-center gap-6 mt-10">
          {highlights.map((h) => (
            <div key={h.text} className="flex items-center gap-2 text-sm text-muted-foreground">
              <h.icon className="h-4 w-4 text-primary" />
              {h.text}
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVE DEMO SECTION ──────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
          🎯 See It In Action — Live Demo
        </h2>
        <p className="text-center text-muted-foreground mb-8">
          Click to explore a fully working dealership dashboard with real data
        </p>
        <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
          {/* Bike Demo */}
          <Link href="/demo?tab=bike">
            <Card className="hover:shadow-xl transition-all border-2 hover:border-orange-300 cursor-pointer group">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Bike className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">🏍️ Bike Dealership</h3>
                  <p className="text-sm text-muted-foreground mt-1">Complete Bike Showroom Demo</p>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>✅ Dashboard • Bookings • Leads • Stock</p>
                  <p>✅ Service Jobs • CashFlow • Reports</p>
                  <p>✅ Full dummy data — no login required</p>
                </div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700 gap-2">
                  <Play className="h-4 w-4" /> Explore Bike Demo
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Car Demo */}
          <Link href="/demo?tab=car">
            <Card className="hover:shadow-xl transition-all border-2 hover:border-blue-300 cursor-pointer group">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Car className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">🚗 Car Dealership</h3>
                  <p className="text-sm text-muted-foreground mt-1">Complete Car Showroom Demo</p>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>✅ Dashboard • Bookings • Test Drives • Finance</p>
                  <p>✅ Exchange • CashFlow • Reports</p>
                  <p>✅ Full dummy data — no login required</p>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
                  <Play className="h-4 w-4" /> Explore Car Demo
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
          Everything You Need
        </h2>
        <p className="text-center text-muted-foreground mb-10">
          Six powerful modules to run your dealership efficiently
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="hover:shadow-lg transition-shadow border-0 shadow-sm">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`h-6 w-6 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to modernize your dealership?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Join hundreds of dealerships already using VaahanERP to streamline
            their operations and grow their business.
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="gap-2 text-base px-8">
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Contact Section */}
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

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">V</span>
            </div>
            <span className="font-semibold">VaahanERP</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Powered by Ravi Accounting Services
          </p>
          <p className="text-sm text-muted-foreground">
            © 2026 Ravi Accounting Services. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Public Chat Widget — Lead Capture */}
      <PublicChatWidget />
    </div>
  );
}
