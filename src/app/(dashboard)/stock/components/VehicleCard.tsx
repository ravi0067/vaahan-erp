"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Bike } from "lucide-react";

interface VehicleCardProps {
  model: string;
  variant: string;
  color: string;
  price: number;
  status: "Available" | "Booked" | "Sold";
  engineNo: string;
  chassisNo: string;
  photo?: string;
  onView?: () => void;
  onEdit?: () => void;
  onBook?: () => void;
}

const statusStyle: Record<string, string> = {
  Available: "bg-green-100 text-green-700 border-green-300",
  Booked: "bg-amber-100 text-amber-700 border-amber-300",
  Sold: "bg-gray-100 text-gray-500 border-gray-300",
};

const colorDots: Record<string, string> = {
  "Pearl White": "bg-white border-gray-300",
  "Rebel Red": "bg-red-500",
  "Matte Black": "bg-gray-900",
  "Athletic Blue": "bg-blue-500",
  "Pearl Spartan Red": "bg-red-600",
  "Imperial Red": "bg-red-700",
  "Vibrant Orange": "bg-orange-500",
  "Matte Axis Gray": "bg-gray-500",
  "Pearl Siren Blue": "bg-blue-400",
};

const formatCurrency = (amt: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amt);

export function VehicleCard({
  model,
  variant,
  color,
  price,
  status,
  engineNo,
  chassisNo,
  photo,
  onView,
  onEdit,
  onBook,
}: VehicleCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Photo */}
      <div className="aspect-[4/3] bg-muted flex items-center justify-center relative">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={model} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center text-muted-foreground">
            <Bike className="h-12 w-12 mb-2 opacity-30" />
            <span className="text-xs">No Photo</span>
          </div>
        )}
        <Badge
          variant="outline"
          className={`absolute top-2 right-2 ${statusStyle[status]}`}
        >
          {status}
        </Badge>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Model + Variant */}
        <div>
          <h3 className="font-semibold text-base leading-tight">{model}</h3>
          {variant && <p className="text-sm text-muted-foreground">{variant}</p>}
        </div>

        {/* Color */}
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full border ${colorDots[color] || "bg-gray-300"}`}
          />
          <span className="text-sm text-muted-foreground">{color || "N/A"}</span>
        </div>

        {/* Price */}
        <p className="text-lg font-bold text-primary">{formatCurrency(price)}</p>

        {/* Engine / Chassis */}
        <div className="text-[11px] text-muted-foreground font-mono space-y-0.5">
          <p>ENG: {engineNo}</p>
          <p>CHS: {chassisNo}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={onView}>
            <Eye className="h-3 w-3" /> View
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={onEdit}>
            <Edit className="h-3 w-3" /> Edit
          </Button>
          {status === "Available" && (
            <Button size="sm" className="flex-1 gap-1" onClick={onBook}>
              <Bike className="h-3 w-3" /> Book
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
