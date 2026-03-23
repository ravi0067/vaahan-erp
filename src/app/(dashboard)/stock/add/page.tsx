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
import { ChevronLeft, Package, Save, Upload, X, Star, ImageIcon } from "lucide-react";
import { ImagePreviewModal } from "@/components/ui/image-preview-modal";
import { useShowroomStore } from "@/store/showroom-store";
import { showroomConfig, type ShowroomType, type FuelType, type FieldConfig } from "@/lib/showroom-config";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";

const variantOptions = ["STD", "DLX", "Drum", "Disc", "BS6", "ABS", "CBS", "Base", "Mid", "Top"];

const colorOptions = [
  "Pearl White", "Rebel Red", "Matte Black", "Athletic Blue", "Pearl Spartan Red",
  "Imperial Red", "Vibrant Orange", "Matte Axis Gray", "Pearl Siren Blue",
  "Midnight Black", "Racing Red", "Phantom Black", "Silver", "Deep Forest",
  "Pristine White", "Flame Red", "Gravity Grey", "Jet Black", "Space Grey",
  "Aurora Silver", "Copper Bronze", "Titanium Grey",
];

const MAX_PHOTOS = 10;

export default function AddStockPage() {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { showroomType } = useShowroomStore();
  const config = showroomConfig[showroomType];

  // For MULTI showroom, allow selecting vehicle sub-type
  const [vehicleSubType, setVehicleSubType] = React.useState<ShowroomType>("BIKE");
  const activeConfig = showroomType === "MULTI" ? showroomConfig[vehicleSubType] : config;
  const activeType = showroomType === "MULTI" ? vehicleSubType : showroomType;

  const [form, setForm] = React.useState({
    brand: "",
    model: "",
    variant: "",
    color: "",
    fuelType: "" as string,
    engineNo: "",
    chassisNo: "",
    price: "",
    purchaseDate: new Date().toISOString().split("T")[0],
  });
  const [dynamicFields, setDynamicFields] = React.useState<Record<string, string>>({});
  const [photos, setPhotos] = React.useState<string[]>([]);
  const [primaryIndex, setPrimaryIndex] = React.useState(0);
  const [dragActive, setDragActive] = React.useState(false);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState(0);

  const isValid = form.brand && form.model && form.engineNo && form.chassisNo && form.price;

  // Get the fields to show based on showroom type + fuel type
  const specificFields = activeConfig.specificFields;
  const showEvFields = form.fuelType === "ELECTRIC" && activeConfig.evFields.length > 0;
  const brands = activeConfig.popularBrands;
  const fuelTypes = activeConfig.fuelTypes;

  const handleDynamicField = (key: string, value: string) => {
    setDynamicFields((prev) => ({ ...prev, [key]: value }));
  };

  const renderField = (field: FieldConfig) => {
    if (field.type === "select" && field.options) {
      return (
        <div key={field.key} className="grid gap-2">
          <Label>{field.label}</Label>
          <Select value={dynamicFields[field.key] || ""} onValueChange={(v) => handleDynamicField(field.key, v)}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }
    return (
      <div key={field.key} className="grid gap-2">
        <Label>{field.label}</Label>
        <Input
          type={field.type === "number" ? "number" : "text"}
          placeholder={field.placeholder}
          value={dynamicFields[field.key] || ""}
          onChange={(e) => handleDynamicField(field.key, e.target.value)}
        />
      </div>
    );
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_PHOTOS - photos.length;
    const toProcess = Array.from(files).slice(0, remaining);

    toProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setPhotos((prev) => {
            if (prev.length >= MAX_PHOTOS) return prev;
            return [...prev, result];
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    if (primaryIndex >= index && primaryIndex > 0) {
      setPrimaryIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    try {
      await apiPost('/api/vehicles', {
        brand: form.brand,
        model: form.model,
        variant: form.variant,
        color: form.color,
        chassisNo: form.chassisNo,
        engineNo: form.engineNo,
        exShowroomPrice: Number(form.exShowroomPrice) || 0,
        purchasePrice: Number(form.purchasePrice) || 0,
        year: Number(form.year) || new Date().getFullYear(),
        fuelType: form.fuelType || null,
        photo: photos[0] || null,
      });
      toast.success(`${config.vehicleLabel} added successfully!`);
      router.push("/stock");
    } catch (error: any) {
      toast.error(error.message || `Failed to add ${config.vehicleLabel.toLowerCase()}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Add {config.vehicleLabel} to Stock
          </h1>
          <p className="text-muted-foreground">Register a new {config.vehicleLabel.toLowerCase()} in inventory</p>
        </div>
      </div>

      {/* Vehicle Type Selector for MULTI */}
      {showroomType === "MULTI" && (
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {(["BIKE", "CAR", "EV"] as ShowroomType[]).map((type) => {
                const c = showroomConfig[type];
                const isActive = vehicleSubType === type;
                return (
                  <button
                    key={type}
                    onClick={() => {
                      setVehicleSubType(type);
                      setForm((prev) => ({ ...prev, fuelType: "", brand: "" }));
                      setDynamicFields({});
                    }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      isActive
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-muted hover:border-primary/30"
                    }`}
                  >
                    <span className="text-2xl">{c.emoji}</span>
                    <span className="text-sm font-medium">{c.vehicleLabel}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" /> {activeType === "BIKE" ? "Bike" : activeType === "CAR" ? "Car" : "EV"} Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Brand */}
            <div className="grid gap-2">
              <Label>Brand *</Label>
              <Select value={form.brand} onValueChange={(v) => setForm({ ...form, brand: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Model */}
            <div className="grid gap-2">
              <Label>Model *</Label>
              <Input
                placeholder={`e.g. ${brands[0] || ""} ...`}
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              />
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

            {/* Fuel Type */}
            <div className="grid gap-2">
              <Label>Fuel Type</Label>
              <Select value={form.fuelType} onValueChange={(v) => setForm({ ...form, fuelType: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  {fuelTypes.map((ft: FuelType) => (
                    <SelectItem key={ft} value={ft}>{ft}</SelectItem>
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
        </CardContent>
      </Card>

      {/* Dynamic Spec Fields */}
      {specificFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{activeConfig.vehicleLabel} Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {specificFields.map(renderField)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* EV Fields */}
      {showEvFields && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⚡ Electric Vehicle Specs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {activeConfig.evFields.map(renderField)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" /> {config.vehicleLabel} Photos
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({photos.length}/{MAX_PHOTOS})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {photos.length < MAX_PHOTOS && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium">Drop photos here or click to upload</p>
              <p className="text-sm text-muted-foreground mt-1">
                JPG, PNG up to 10 photos. First photo = primary display photo.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>
          )}

          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {photos.map((photo, idx) => (
                <div
                  key={idx}
                  className={`relative group aspect-square rounded-lg overflow-hidden border-2 ${
                    idx === primaryIndex ? "border-primary ring-2 ring-primary/30" : "border-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo}
                    alt={`${config.vehicleLabel} photo ${idx + 1}`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
                  />
                  {idx === primaryIndex && (
                    <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Star className="h-2.5 w-2.5" /> Primary
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {idx !== primaryIndex && (
                      <button
                        onClick={() => setPrimaryIndex(idx)}
                        className="p-1.5 rounded-full bg-white/90 text-primary hover:bg-white text-xs"
                        title="Set as primary"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => removePhoto(idx)}
                      className="p-1.5 rounded-full bg-white/90 text-red-600 hover:bg-white"
                      title="Remove photo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleSubmit} disabled={!isValid}>
          <Save className="mr-2 h-4 w-4" /> Add to Stock
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <ImagePreviewModal
        images={photos}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
