"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Lock, CheckCircle2 } from "lucide-react";

interface DaybookLockProps {
  systemClosingBalance: number;
  isLocked: boolean;
  onLock: (physicalCount: number) => void;
}

export function DaybookLock({ systemClosingBalance, isLocked, onLock }: DaybookLockProps) {
  const [physicalCount, setPhysicalCount] = React.useState<string>("");
  const difference = physicalCount ? parseFloat(physicalCount) - systemClosingBalance : null;

  const formatCurrency = (amt: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amt);

  if (isLocked) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex items-center gap-3 py-6">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
          <div>
            <p className="font-semibold text-green-800">Day Locked Successfully</p>
            <p className="text-sm text-green-600">
              Closing Balance: {formatCurrency(systemClosingBalance)} — Verified & locked
            </p>
          </div>
          <Badge variant="outline" className="ml-auto border-green-300 text-green-700">
            🔒 Locked
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lock className="h-5 w-5" /> Daybook Lock
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-4 items-end">
          {/* System Balance (read-only) */}
          <div className="grid gap-2">
            <Label className="text-muted-foreground">System Closing Balance</Label>
            <Input value={formatCurrency(systemClosingBalance)} readOnly className="bg-muted font-semibold" />
          </div>

          {/* Physical Cash Count */}
          <div className="grid gap-2">
            <Label>Physical Cash Count (₹)</Label>
            <Input
              type="number"
              placeholder="Count cash & enter..."
              value={physicalCount}
              onChange={(e) => setPhysicalCount(e.target.value)}
            />
          </div>

          {/* Difference */}
          <div className="grid gap-2">
            <Label>Difference</Label>
            <Input
              readOnly
              className={`font-semibold ${
                difference === null
                  ? ""
                  : difference === 0
                  ? "text-green-600 bg-green-50"
                  : "text-red-600 bg-red-50"
              }`}
              value={difference === null ? "—" : formatCurrency(difference)}
            />
          </div>

          {/* Lock Button */}
          <Button
            onClick={() => onLock(parseFloat(physicalCount))}
            disabled={difference !== 0}
            className="h-10"
          >
            <Lock className="mr-2 h-4 w-4" />
            Lock Day
          </Button>
        </div>

        {difference !== null && difference !== 0 && (
          <p className="mt-3 text-sm text-red-600">
            ⚠️ Difference of {formatCurrency(Math.abs(difference))} detected. Resolve before locking.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
