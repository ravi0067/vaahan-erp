"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBookingWizardStore, type VehicleData } from "@/store/booking-wizard-store";
import { Bike, Check } from "lucide-react";

// ── Mock vehicles ──────────────────────────────────────────────────────────
const mockVehicles: VehicleData[] = [
  { id: "V001", model: "Honda Activa 6G", variant: "STD", color: "Pearl White", engineNo: "ENG-A6G-001", chassisNo: "CHS-A6G-001", price: 78000 },
  { id: "V002", model: "Honda Activa 6G", variant: "DLX", color: "Rebel Red", engineNo: "ENG-A6G-002", chassisNo: "CHS-A6G-002", price: 85000 },
  { id: "V003", model: "Honda SP 125", variant: "STD", color: "Matte Black", engineNo: "ENG-SP1-003", chassisNo: "CHS-SP1-003", price: 92000 },
  { id: "V004", model: "Honda Shine", variant: "Drum", color: "Athletic Blue", engineNo: "ENG-SHN-004", chassisNo: "CHS-SHN-004", price: 82000 },
  { id: "V005", model: "Honda Unicorn", variant: "BS6", color: "Pearl Spartan Red", engineNo: "ENG-UNI-005", chassisNo: "CHS-UNI-005", price: 105000 },
  { id: "V006", model: "Honda SP 125", variant: "Disc", color: "Imperial Red", engineNo: "ENG-SP1-006", chassisNo: "CHS-SP1-006", price: 96000 },
];

const models = Array.from(new Set(mockVehicles.map((v) => v.model)));
const colors = Array.from(new Set(mockVehicles.map((v) => v.color)));

const formatCurrency = (amt: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amt);

export function Step2Vehicle() {
  const { vehicle, setVehicle, nextStep } = useBookingWizardStore();
  const [filterModel, setFilterModel] = React.useState<string>("all");
  const [filterColor, setFilterColor] = React.useState<string>("all");
  const [selectedId, setSelectedId] = React.useState<string>(vehicle?.id || "");

  const filtered = mockVehicles.filter((v) => {
    if (filterModel !== "all" && v.model !== filterModel) return false;
    if (filterColor !== "all" && v.color !== filterColor) return false;
    return true;
  });

  const handleSelect = (v: VehicleData) => {
    setSelectedId(v.id);
    setVehicle(v);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bike className="h-5 w-5" /> Select Vehicle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Select value={filterModel} onValueChange={setFilterModel}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                {models.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterColor} onValueChange={setFilterColor}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colors</SelectItem>
                {colors.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((v) => {
          const isSelected = selectedId === v.id;
          return (
            <Card
              key={v.id}
              className={`cursor-pointer transition-all ${
                isSelected ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
              }`}
              onClick={() => handleSelect(v)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{v.model}</h3>
                    <p className="text-sm text-muted-foreground">{v.variant} • {v.color}</p>
                  </div>
                  {isSelected && (
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>

                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Engine No</span>
                    <span className="font-mono">{v.engineNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chassis No</span>
                    <span className="font-mono">{v.chassisNo}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">{formatCurrency(v.price)}</span>
                  <Badge variant="outline" className="text-green-700 border-green-300">Available</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No vehicles match the selected filters.
          </CardContent>
        </Card>
      )}

      <Button onClick={nextStep} disabled={!selectedId} className="w-full sm:w-auto">
        Continue to Payment →
      </Button>
    </div>
  );
}
