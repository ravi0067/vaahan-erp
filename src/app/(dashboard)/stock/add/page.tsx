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

// ── Options ────────────────────────────────────────────────────────────────
const modelOptions = [
  "Honda Activa 6G",
  "Honda SP 125",
  "Honda Shine",
  "Honda Unicorn",
  "Honda CB350",
  "Honda Dio",
  "Honda Hornet 2.0",
  "Hero Splendor Plus",
  "Hero HF Deluxe",
  "Bajaj Pulsar 150",
  "TVS Apache RTR 160",
  "Royal Enfield Classic 350",
];

const variantOptions = ["STD", "DLX", "Drum", "Disc", "BS6", "ABS", "CBS"];

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
  "Midnight Black",
  "Racing Red",
];

const MAX_PHOTOS = 10;

export default function AddStockPage() {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [form, setForm] = React.useState({
    model: "",
    variant: "",
    color: "",
    engineNo: "",
    chassisNo: "",
    price: "",
    purchaseDate: new Date().toISOString().split("T")[0],
  });
  const [photos, setPhotos] = React.useState<string[]>([]);
  const [primaryIndex, setPrimaryIndex] = React.useState(0);
  const [dragActive, setDragActive] = React.useState(false);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState(0);

  const isValid = form.model && form.engineNo && form.chassisNo && form.price;

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

  const handleSubmit = () => {
    if (!isValid) return;
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
        </CardContent>
      </Card>

      {/* Photo Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" /> Vehicle Photos
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({photos.length}/{MAX_PHOTOS})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop Zone */}
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

          {/* Photo Previews */}
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
                    alt={`Vehicle photo ${idx + 1}`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
                  />

                  {/* Primary badge */}
                  {idx === primaryIndex && (
                    <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Star className="h-2.5 w-2.5" /> Primary
                    </div>
                  )}

                  {/* Hover actions */}
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

      {/* Lightbox */}
      <ImagePreviewModal
        images={photos}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
