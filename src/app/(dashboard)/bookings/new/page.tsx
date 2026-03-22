"use client";

import { useBookingWizardStore } from "@/store/booking-wizard-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StepIndicator } from "./components/StepIndicator";
import { Step1Customer } from "./components/Step1Customer";
import { Step2Vehicle } from "./components/Step2Vehicle";
import { Step3Payment } from "./components/Step3Payment";
import { Step4Finance } from "./components/Step4Finance";
import { Step5Documents } from "./components/Step5Documents";
import { Step6Review } from "./components/Step6Review";
import { ChevronLeft } from "lucide-react";

// ── Step renderer ──────────────────────────────────────────────────────────
function CurrentStepContent({ step }: { step: number }) {
  switch (step) {
    case 1: return <Step1Customer />;
    case 2: return <Step2Vehicle />;
    case 3: return <Step3Payment />;
    case 4: return <Step4Finance />;
    case 5: return <Step5Documents />;
    case 6: return <Step6Review />;
    default: return <Step1Customer />;
  }
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function NewBookingPage() {
  const { currentStep, setStep, prevStep } = useBookingWizardStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Booking</h1>
          <p className="text-muted-foreground">Create a new vehicle booking in 6 steps</p>
        </div>
      </div>

      {/* Step Indicator */}
      <Card>
        <CardContent className="py-4">
          <StepIndicator currentStep={currentStep} onStepClick={setStep} />
        </CardContent>
      </Card>

      {/* Step Content */}
      <CurrentStepContent step={currentStep} />

      {/* Navigation (Back only — Next is handled by each step) */}
      {currentStep > 1 && currentStep < 6 && (
        <Button variant="outline" onClick={prevStep}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      )}
    </div>
  );
}
