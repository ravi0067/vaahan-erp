"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useBookingWizardStore } from "@/store/booking-wizard-store";
import {
  User,
  Bike,
  IndianRupee,
  Landmark,
  FileText,
  Edit,
  CheckCircle2,
} from "lucide-react";

const formatCurrency = (amt: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amt);

export function Step6Review() {
  const { customer, vehicle, payments, finance, documents, setStep, reset } =
    useBookingWizardStore();
  const [confirmed, setConfirmed] = React.useState(false);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const pending = (vehicle?.price || 0) - totalPaid;

  // Count uploaded docs
  const uploadedDocs = Object.values(documents).filter(Boolean).length;

  if (confirmed) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <CheckCircle2 className="h-16 w-16 text-green-600" />
          <h2 className="text-2xl font-bold text-green-800">Booking Confirmed!</h2>
          <p className="text-green-600">
            Booking #{Math.random().toString(36).slice(2, 8).toUpperCase()} has been created.
          </p>
          <Button onClick={reset} variant="outline">
            Create New Booking
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Review Booking Details</h2>

      {/* Customer */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" /> Customer
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
            <Edit className="h-3 w-3 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            <div><span className="text-muted-foreground">Name:</span> {customer.name || "—"}</div>
            <div><span className="text-muted-foreground">Mobile:</span> {customer.mobile || "—"}</div>
            <div><span className="text-muted-foreground">Email:</span> {customer.email || "—"}</div>
            <div><span className="text-muted-foreground">Address:</span> {customer.address || "—"}</div>
            <div><span className="text-muted-foreground">Aadhar:</span> {customer.aadharNo || "—"}</div>
            <div><span className="text-muted-foreground">PAN:</span> {customer.panNo || "—"}</div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bike className="h-4 w-4" /> Vehicle
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
            <Edit className="h-3 w-3 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent>
          {vehicle ? (
            <div className="grid gap-2 sm:grid-cols-2 text-sm">
              <div><span className="text-muted-foreground">Model:</span> {vehicle.model}</div>
              <div><span className="text-muted-foreground">Color:</span> {vehicle.color}</div>
              <div><span className="text-muted-foreground">Engine:</span> {vehicle.engineNo}</div>
              <div><span className="text-muted-foreground">Chassis:</span> {vehicle.chassisNo}</div>
              <div><span className="text-muted-foreground">Price:</span> <strong>{formatCurrency(vehicle.price)}</strong></div>
            </div>
          ) : (
            <p className="text-muted-foreground">No vehicle selected</p>
          )}
        </CardContent>
      </Card>

      {/* Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <IndianRupee className="h-4 w-4" /> Payments
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
            <Edit className="h-3 w-3 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Total:</span>{" "}
              <strong>{formatCurrency(vehicle?.price || 0)}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">Paid:</span>{" "}
              <strong className="text-green-700">{formatCurrency(totalPaid)}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">Pending:</span>{" "}
              <strong className={pending > 0 ? "text-amber-700" : "text-green-700"}>
                {formatCurrency(pending)}
              </strong>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{payments.length} payment(s) recorded</p>
        </CardContent>
      </Card>

      {/* Finance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Landmark className="h-4 w-4" /> Finance
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setStep(4)}>
            <Edit className="h-3 w-3 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent>
          {finance.required ? (
            <div className="grid gap-2 sm:grid-cols-2 text-sm">
              <div><span className="text-muted-foreground">Provider:</span> {finance.provider}</div>
              <div><span className="text-muted-foreground">Loan:</span> {formatCurrency(finance.loanAmount)}</div>
              <div><span className="text-muted-foreground">EMI:</span> {formatCurrency(finance.emiAmount)}/mo</div>
              <div>
                <span className="text-muted-foreground">Status:</span>{" "}
                <Badge variant="outline">{finance.loanStatus || "Pending"}</Badge>
              </div>
            </div>
          ) : (
            <Badge variant="secondary">Self Payment — No Finance</Badge>
          )}
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" /> Documents
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setStep(5)}>
            <Edit className="h-3 w-3 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            {uploadedDocs}/7 documents uploaded
          </p>
        </CardContent>
      </Card>

      <Separator />

      {/* Confirm */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => setConfirmed(true)} className="flex-1 sm:flex-none" size="lg">
          <CheckCircle2 className="mr-2 h-5 w-5" /> Confirm Booking
        </Button>
        <Button variant="outline" onClick={() => setStep(1)}>
          Start Over
        </Button>
      </div>
    </div>
  );
}
