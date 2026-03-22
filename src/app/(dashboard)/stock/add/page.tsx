"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { ChevronLeft, Package, Save } from "lucide-react";

// ── Options ────────────────────────────────────────────────────────────────
const modelOptions = [
  "Honda Activa 6G",
  "Honda SP 125",
  "Honda Shine",
  "Honda Unicorn",
  "Honda CB350",
  "Honda Dio",
  "Honda Hornet 2.0",
];

const variantOptions = ["STD", "DLX", "Drum", "Disc", "BS6"];

const colorOptions = [
  "Pearl White",
  "Rebel Red",
  "Matte Black",
  "Athletic Blue",
  "Pearl Spartan Red",
  "Imperial Red",
  "Vibrant Orange",
  "Matte Axis Gray",
  "Pearl Siren Blue",
];

export default function AddStockPage() {
  const router = useRouter();
  const [form, setForm] = React.useState({
    model: "",
    variant: "",
    color: "",
    engineNo: "",
    chassisNo: "",
    price: "",
    purchaseDate: new Date().toISOString().split("T")[0],
  });

  const isValid = form.model && form.engineNo && form.chassisNo && form.price;

  const handleSubmit = () => {
    if (!isValid) return;
    // In a real app, this would call an API
    alert("Vehicle added to stock! (Mock — no API call)");
    router.push("/stock");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Vehicle to Stock</h1>
          <p className="text-muted-foreground">Register a new vehicle in inventory</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" /> Vehicle Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Model */}
            <div className="grid gap-2">
              <Label>Model *</Label>
              <Select value={form.model} onValueChange={(v) => setForm({ ...form, model: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Variant */}
            <div className="grid gap-2">
              <Label>Variant</Label>
              <Select value={form.variant} onValueChange={(v) => setForm({ ...form, variant: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select variant" />
                </SelectTrigger>
                <SelectContent>
                  {variantOptions.map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color */}
            <div className="grid gap-2">
              <Label>Color</Label>
              <Select value={form.color} onValueChange={(v) => setForm({ ...form, color: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Engine No */}
            <div className="grid gap-2">
              <Label>Engine Number *</Label>
              <Input
                placeholder="ENG-XXX-XXX"
                value={form.engineNo}
                onChange={(e) => setForm({ ...form, engineNo: e.target.value })}
              />
            </div>

            {/* Chassis No */}
            <div className="grid gap-2">
              <Label>Chassis Number *</Label>
              <Input
                placeholder="CHS-XXX-XXX"
                value={form.chassisNo}
                onChange={(e) => setForm({ ...form, chassisNo: e.target.value })}
              />
            </div>

            {/* Price */}
            <div className="grid gap-2">
              <Label>Ex-Showroom Price (₹) *</Label>
              <Input
                type="number"
                placeholder="Enter price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>

            {/* Purchase Date */}
            <div className="grid gap-2 sm:col-span-2">
              <Label>Purchase/Receipt Date</Label>
              <Input
                type="date"
                value={form.purchaseDate}
                onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                className="w-[200px]"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={handleSubmit} disabled={!isValid}>
              <Save className="mr-2 h-4 w-4" /> Add to Stock
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
