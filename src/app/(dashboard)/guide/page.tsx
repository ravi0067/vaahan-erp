"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings, Users, Shield, PackagePlus, UserPlus, Bike, Wallet,
  CreditCard, Bell, BarChart3, Play, CheckCircle2,
  ArrowRight, HelpCircle, Rocket,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface GuideStep {
  number: number;
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  completed: boolean;
  adminOnly?: boolean;
}

const steps: GuideStep[] = [
  {
    number: 1,
    icon: Settings,
    title: "Setup Your Dealership",
    description: "Go to Settings, add dealership name, address, GST number, and logo",
    href: "/settings",
    completed: true,
  },
  {
    number: 2,
    icon: Users,
    title: "Add Your Team",
    description: "Go to Users, create accounts for your sales team, accountants, and mechanics",
    href: "/users",
    completed: true,
  },
  {
    number: 3,
    icon: Shield,
    title: "Set Permissions",
    description: "Go to Users > Permissions tab, configure role-based access for each team member",
    href: "/users",
    completed: false,
  },
  {
    number: 4,
    icon: PackagePlus,
    title: "Add Inventory",
    description: "Go to Add Stock, enter vehicle details including model, color, chassis number & photos",
    href: "/stock/add",
    completed: false,
  },
  {
    number: 5,
    icon: UserPlus,
    title: "Capture Leads",
    description: "Go to Leads CRM, add potential customers with their enquiry details and follow-up dates",
    href: "/leads",
    completed: false,
  },
  {
    number: 6,
    icon: Bike,
    title: "Create Bookings",
    description: "Go to Book Bike, use the 6-step wizard to create complete bookings with payment tracking",
    href: "/bookings/new",
    completed: false,
  },
  {
    number: 7,
    icon: Wallet,
    title: "Manage CashFlow",
    description: "Go to CashFlow, record daily transactions, lock daybook at end of day",
    href: "/cashflow",
    completed: false,
  },
  {
    number: 8,
    icon: CreditCard,
    title: "Configure Payments",
    description: "(Super Admin) Go to Admin Settings, add Razorpay/Stripe keys for online payments",
    href: "/admin/settings",
    completed: false,
    adminOnly: true,
  },
  {
    number: 9,
    icon: Bell,
    title: "Enable Alerts",
    description: "(Super Admin) Configure WhatsApp, Email, and SMS alert templates and API keys",
    href: "/admin/settings",
    completed: false,
    adminOnly: true,
  },
  {
    number: 10,
    icon: BarChart3,
    title: "Generate Reports",
    description: "Go to Reports, select report type and date range to analyze your business performance",
    href: "/reports",
    completed: false,
  },
];

export default function GuidePage() {
  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-4">
        <div className="flex items-center justify-center gap-2 text-4xl">
          <Rocket className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold">
          Get Started with VaahanERP in 5 Minutes! 🚀
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Follow these simple steps to set up your dealership management system
        </p>
      </div>

      {/* Demo Video Placeholder */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center py-20 relative">
          <div className="text-center space-y-4">
            <button className="w-20 h-20 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center mx-auto hover:bg-primary transition-colors shadow-lg">
              <Play className="h-8 w-8 ml-1" />
            </button>
            <div>
              <p className="font-semibold text-lg">Watch Demo Video</p>
              <p className="text-sm text-muted-foreground">
                Watch a complete walkthrough of VaahanERP
              </p>
            </div>
            <Badge variant="outline" className="text-xs">Duration: ~5 minutes</Badge>
          </div>
        </div>
      </Card>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Setup Progress</p>
            <p className="text-sm text-muted-foreground">
              {completedCount}/{steps.length} steps completed
            </p>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{progressPercent}% complete</p>
        </CardContent>
      </Card>

      {/* Step Cards */}
      <div className="grid gap-4">
        {steps.map((step) => (
          <Card
            key={step.number}
            className={`transition-colors ${
              step.completed ? "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900" : ""
            }`}
          >
            <CardContent className="py-4">
              <div className="flex items-start gap-4">
                {/* Step Number & Icon */}
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    step.completed
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-primary/10 text-primary"
                  }`}>
                    {step.completed ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <step.icon className="h-6 w-6" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs font-mono">
                      Step {step.number}
                    </Badge>
                    {step.adminOnly && (
                      <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 text-xs">
                        Super Admin
                      </Badge>
                    )}
                    {step.completed && (
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        Completed ✅
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold mt-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
                </div>

                {/* Action */}
                <Link href={step.href}>
                  <Button variant={step.completed ? "ghost" : "default"} size="sm" className="shrink-0 gap-1">
                    Go There <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Need Help */}
      <Card>
        <CardContent className="py-6 text-center space-y-3">
          <HelpCircle className="h-10 w-10 mx-auto text-muted-foreground" />
          <h3 className="font-semibold text-lg">Need Help?</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Stuck on any step? Visit our help center or reach out to our support team.
          </p>
          <Link href="/help">
            <Button variant="outline">
              <HelpCircle className="h-4 w-4 mr-2" />
              Go to Help & Support
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
