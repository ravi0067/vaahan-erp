"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldCheck, User, Briefcase, ArrowLeft, Users, Calculator, Wrench } from "lucide-react";

const demoAccounts = [
  {
    label: "Super Admin",
    emoji: "🔴",
    email: "superadmin@vaahan.com",
    password: "super123",
    icon: ShieldCheck,
    access: "All clients, settings, billing, master config",
    color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
  },
  {
    label: "Dealer Owner",
    emoji: "🟢",
    email: "owner@vaahan.com",
    password: "owner123",
    icon: Briefcase,
    access: "Full dealership access — stock, bookings, reports, users",
    color: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
  },
  {
    label: "Manager",
    emoji: "🔵",
    email: "manager@vaahan.com",
    password: "manager123",
    icon: Users,
    access: "Sales, bookings, leads, stock, reports",
    color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  },
  {
    label: "Sales Executive",
    emoji: "🟡",
    email: "sales@vaahan.com",
    password: "sales123",
    icon: User,
    access: "Leads, bookings, stock, customers",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
  },
  {
    label: "Accountant",
    emoji: "🟣",
    email: "accountant@vaahan.com",
    password: "accountant123",
    icon: Calculator,
    access: "CashFlow, expenses, reports, customer ledger",
    color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
  },
  {
    label: "Mechanic",
    emoji: "🟤",
    email: "mechanic@vaahan.com",
    password: "mechanic123",
    icon: Wrench,
    access: "Service jobs, PDI checklists",
    color: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (loginEmail: string, loginPassword: string) => {
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(email, password);
  };

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    handleLogin(demoEmail, demoPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <Card>
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-2">
              <span className="text-primary-foreground font-bold text-xl">V</span>
            </div>
            <CardTitle className="text-2xl font-bold">VaahanERP</CardTitle>
            <CardDescription>
              Sign in to your dealership management system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Demo Login Buttons */}
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Quick Demo Login
                  </span>
                </div>
              </div>

              <div className="grid gap-2">
                {demoAccounts.map((demo) => {
                  const Icon = demo.icon;
                  return (
                    <button
                      key={demo.email}
                      type="button"
                      onClick={() => handleDemoLogin(demo.email, demo.password)}
                      disabled={loading}
                      className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors ${demo.color} disabled:opacity-50`}
                    >
                      <span className="text-base shrink-0">{demo.emoji}</span>
                      <Icon className="h-4 w-4 shrink-0" />
                      <div className="text-left flex-1 min-w-0">
                        <span className="block">{demo.label}</span>
                        <span className="block text-[10px] opacity-60 font-normal truncate">{demo.access}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Powered by Ravi Accounting Services
        </p>
      </div>
    </div>
  );
}
