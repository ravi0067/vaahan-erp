"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBookingWizardStore } from "@/store/booking-wizard-store";
import { Landmark, Wallet, CheckCircle2 } from "lucide-react";

const financeProviders = [
  "HDFC Bank",
  "SBI",
  "ICICI Bank",
  "Bajaj Finance",
  "IndoStar Capital",
  "Manappuram Finance",
  "Hero FinCorp",
];

const loanStatuses = ["Applied", "Approved", "Disbursed", "Rejected"] as const;

export function Step4Finance() {
  const { finance, setFinance, nextStep } = useBookingWizardStore();
  const [isFinanceRequired, setIsFinanceRequired] = React.useState(finance.required);
  const [form, setForm] = React.useState(finance);

  const handleToggle = (val: boolean) => {
    setIsFinanceRequired(val);
    if (!val) {
      const noFinance = { required: false, provider: "", loanAmount: 0, emiAmount: 0, loanStatus: "" as const };
      setForm(noFinance);
      setFinance(noFinance);
    } else {
      setForm({ ...form, required: true });
    }
  };

  const handleContinue = () => {
    setFinance({ ...form, required: isFinanceRequired });
    nextStep();
  };

  return (
    <div className="space-y-6">
      {/* Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" /> Finance Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="mb-3 block">Is finance required?</Label>
          <div className="flex gap-3">
            <Button
              variant={isFinanceRequired ? "default" : "outline"}
              onClick={() => handleToggle(true)}
            >
              <Landmark className="mr-2 h-4 w-4" /> Yes, Finance
            </Button>
            <Button
              variant={!isFinanceRequired ? "default" : "outline"}
              onClick={() => handleToggle(false)}
            >
              <Wallet className="mr-2 h-4 w-4" /> No, Self Payment
            </Button>
          </div>
        </CardContent>
      </Card>

      {isFinanceRequired ? (
        <Card>
          <CardHeader>
            <CardTitle>Finance Application</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Finance Provider</Label>
                <Select
                  value={form.provider}
                  onValueChange={(v) => setForm({ ...form, provider: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {financeProviders.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Loan Amount (₹)</Label>
                <Input
                  type="number"
                  placeholder="Loan amount"
                  value={form.loanAmount || ""}
                  onChange={(e) => setForm({ ...form, loanAmount: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="grid gap-2">
                <Label>EMI Amount (₹)</Label>
                <Input
                  type="number"
                  placeholder="Monthly EMI"
                  value={form.emiAmount || ""}
                  onChange={(e) => setForm({ ...form, emiAmount: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="grid gap-2">
                <Label>Loan Status</Label>
                <Select
                  value={form.loanStatus}
                  onValueChange={(v) => setForm({ ...form, loanStatus: v as typeof form.loanStatus })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {loanStatuses.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center gap-3 py-8">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">Self Payment</p>
              <p className="text-sm text-green-600">
                No finance required. Customer will pay the full amount directly.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleContinue} className="w-full sm:w-auto">
        Continue to Documents →
      </Button>
    </div>
  );
}
