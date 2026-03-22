"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const steps = [
  { num: 1, label: "Customer" },
  { num: 2, label: "Vehicle" },
  { num: 3, label: "Payment" },
  { num: 4, label: "Finance" },
  { num: 5, label: "Documents" },
  { num: 6, label: "Review" },
];

interface StepIndicatorProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <nav className="flex items-center justify-between">
      {steps.map((step, idx) => {
        const isCompleted = currentStep > step.num;
        const isCurrent = currentStep === step.num;

        return (
          <div key={step.num} className="flex items-center flex-1 last:flex-none">
            {/* Step circle + label */}
            <button
              onClick={() => onStepClick(step.num)}
              className={cn(
                "flex flex-col items-center gap-1 group cursor-pointer",
                !isCompleted && !isCurrent && "opacity-50"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary bg-primary/10",
                  !isCompleted && !isCurrent && "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : step.num}
              </div>
              <span
                className={cn(
                  "text-xs font-medium hidden sm:block",
                  isCurrent ? "text-primary" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </button>

            {/* Connector line */}
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2",
                  currentStep > step.num ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
