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
import { useShowroomStore } from "@/store/showroom-store";
import { showroomConfig, mockVehiclesByType } from "@/lib/showroom-config";
import { Bike, Car, Zap, Store, Check } from "lucide-react";

const iconMap: Record<string, React.ElementType> = { Bike, Car, Zap, Store };

const formatCurrency = (amt: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amt);

export function Step2Vehicle() {
  const { vehicle, setVehicle, nextStep } = useBookingWizardStore();
  const { showroomType } = useShowroomStore();
  const config = showroomConfig[showroomType];
  const mockVehicles = mockVehiclesByType[showroomType];

  const VehicleIcon = iconMap[config.icon] || Bike;

  const [filterBrand, setFilterBrand] = React.useState<string>("all");
  const [filterColor, setFilterColor] = React.useState<string>("all");
  const [selectedId, setSelectedId] = React.useState<string>(vehicle?.id || "");

  const brands = Array.from(new Set(mockVehicles.map((v) => v.brand)));
  const colors = Array.from(new Set(mockVehicles.map((v) => v.color)));

  // Only show available vehicles for booking
  const filtered = mockVehicles.filter((v) => {
    if (v.status !== "Available") return false;
    if (filterBrand !== "all" && v.brand !== filterBrand) return false;
    if (filterColor !== "all" && v.color !== filterColor) return false;
    return true;
  });

  const handleSelect = (v: typeof mockVehicles[0]) => {
    setSelectedId(v.id);
    const vehicleData: VehicleData = {
      id: v.id,
      model: v.model,
      variant: v.variant,
      color: v.color,
      engineNo: v.engineNo,
      chassisNo: v.chassisNo,
      price: v.price,
    };
    setVehicle(vehicleData);
  };

  const getSpecDisplay = (v: typeof mockVehicles[0]) => {
    const specs = v.specs;
    switch (showroomType) {
      case "BIKE":
        return specs.cc ? `${specs.cc}cc • ${specs.mileage || "—"} km/l` : "";
      case "CAR":
        return `${specs.bodyType || ""} • ${specs.transmission || ""} • ${specs.seatingCapacity || ""} seats`;
      case "EV":
        return `${specs.batteryCapacity || ""} kWh • ${specs.range || ""} km range`;
      case "MULTI":
        return `${v.fuelType}${specs.cc ? ` • ${specs.cc}cc` : ""}${specs.range ? ` • ${specs.range} km` : ""}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <VehicleIcon className="h-5 w-5" /> Select {config.vehicleLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Select value={filterBrand} onValueChange={setFilterBrand}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
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

                {/* Dynamic specs */}
                <p className="text-xs text-muted-foreground mt-2">{getSpecDisplay(v)}</p>

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
                  <div className="flex gap-1">
                    {v.fuelType === "ELECTRIC" && (
                      <Badge variant="outline" className="text-green-700 border-green-300">⚡ EV</Badge>
                    )}
                    <Badge variant="outline" className="text-green-700 border-green-300">Available</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No {config.vehicleLabelPlural.toLowerCase()} match the selected filters.
          </CardContent>
        </Card>
      )}

      <Button onClick={nextStep} disabled={!selectedId} className="w-full sm:w-auto">
        Continue to Payment →
      </Button>
    </div>
  );
}
