"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Bike, Car, Zap, Store } from "lucide-react";
import { type ShowroomType } from "@/lib/showroom-config";

interface VehicleCardProps {
  model: string;
  variant: string;
  color: string;
  price: number;
  status: "Available" | "Booked" | "Sold";
  engineNo: string;
  chassisNo: string;
  photo?: string;
  fuelType?: string;
  specs?: Record<string, string | number>;
  showroomType?: ShowroomType;
  onView?: () => void;
  onEdit?: () => void;
  onBook?: () => void;
}

const statusStyle: Record<string, string> = {
  Available: "bg-green-100 text-green-700 border-green-300",
  Booked: "bg-amber-100 text-amber-700 border-amber-300",
  Sold: "bg-gray-100 text-gray-500 border-gray-300",
};

const formatCurrency = (amt: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amt);

const PlaceholderIcon = ({ showroomType }: { showroomType?: ShowroomType }) => {
  switch (showroomType) {
    case "CAR": return <Car className="h-12 w-12 mb-2 opacity-30" />;
    case "EV": return <Zap className="h-12 w-12 mb-2 opacity-30" />;
    case "MULTI": return <Store className="h-12 w-12 mb-2 opacity-30" />;
    default: return <Bike className="h-12 w-12 mb-2 opacity-30" />;
  }
};

const BookIcon = ({ showroomType }: { showroomType?: ShowroomType }) => {
  switch (showroomType) {
    case "CAR": return <Car className="h-3 w-3" />;
    case "EV": return <Zap className="h-3 w-3" />;
    default: return <Bike className="h-3 w-3" />;
  }
};

function SpecLine({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined || value === "—") return null;
  return (
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export function VehicleCard({
  model,
  variant,
  color,
  price,
  status,
  engineNo,
  chassisNo,
  photo,
  fuelType,
  specs,
  showroomType = "BIKE",
  onView,
  onEdit,
  onBook,
}: VehicleCardProps) {
  const renderSpecs = () => {
    if (!specs) return null;
    switch (showroomType) {
      case "BIKE":
        return (
          <>
            <SpecLine label="CC" value={specs.cc} />
            <SpecLine label="Mileage" value={specs.mileage ? `${specs.mileage} km/l` : undefined} />
            {fuelType === "ELECTRIC" && <SpecLine label="Range" value={specs.range ? `${specs.range} km` : undefined} />}
          </>
        );
      case "CAR":
        return (
          <>
            <SpecLine label="Body" value={specs.bodyType} />
            <SpecLine label="Trans." value={specs.transmission} />
            <SpecLine label="Seats" value={specs.seatingCapacity} />
          </>
        );
      case "EV":
        return (
          <>
            <SpecLine label="Battery" value={specs.batteryCapacity ? `${specs.batteryCapacity} kWh` : undefined} />
            <SpecLine label="Range" value={specs.range ? `${specs.range} km` : undefined} />
            <SpecLine label="Motor" value={specs.motorPower ? `${specs.motorPower} kW` : undefined} />
          </>
        );
      case "MULTI":
        return (
          <>
            <SpecLine label="Fuel" value={fuelType} />
            {specs.cc && <SpecLine label="CC" value={specs.cc} />}
            {specs.range && <SpecLine label="Range" value={`${specs.range} km`} />}
          </>
        );
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-[4/3] bg-muted flex items-center justify-center relative">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={model} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center text-muted-foreground">
            <PlaceholderIcon showroomType={showroomType} />
            <span className="text-xs">No Photo</span>
          </div>
        )}
        <Badge variant="outline" className={`absolute top-2 right-2 ${statusStyle[status]}`}>
          {status}
        </Badge>
        {fuelType && (
          <Badge variant="outline" className="absolute top-2 left-2 bg-background/80 text-xs">
            {fuelType === "ELECTRIC" ? "⚡ EV" : fuelType}
          </Badge>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-base leading-tight">{model}</h3>
          {variant && <p className="text-sm text-muted-foreground">{variant} • {color || "N/A"}</p>}
        </div>

        {/* Dynamic specs */}
        <div className="space-y-1">
          {renderSpecs()}
        </div>

        <p className="text-lg font-bold text-primary">{formatCurrency(price)}</p>

        <div className="text-[11px] text-muted-foreground font-mono space-y-0.5">
          <p>ENG: {engineNo}</p>
          <p>CHS: {chassisNo}</p>
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={onView}>
            <Eye className="h-3 w-3" /> View
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={onEdit}>
            <Edit className="h-3 w-3" /> Edit
          </Button>
          {status === "Available" && (
            <Button size="sm" className="flex-1 gap-1" onClick={onBook}>
              <BookIcon showroomType={showroomType} /> Book
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
