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

interface Brand {
  id: string;
  brandName: string;
  brandType: string;
  showroomLocations: Array<{
    id: string;
    locationName: string;
  }>;
}

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
    brandId: "",
    locationId: "",
    model: "",
    variant: "",
    color: "",
    chassisNo: "",
    engineNo: "",
    exShowroomPrice: "",
    purchasePrice: "",
    year: new Date().getFullYear().toString(),
    fuelType: "",
  });

  // Brand/Location Management
  const [brands, setBrands] = React.useState<Brand[]>([]);
  const [filteredLocations, setFilteredLocations] = React.useState<Array<{id: string; locationName: string;}>>([]);

  const [dynamicFields, setDynamicFields] = React.useState<Record<string, string>>({});
  const [photos, setPhotos] = React.useState<string[]>([]);
  const [dragActive, setDragActive] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [primaryIndex, setPrimaryIndex] = React.useState(0);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = React.useState<number | null>(null);

  // Fetch brands on component mount
  React.useEffect(() => {
    fetchBrands();
  }, []);

  // Update locations when brand changes
  React.useEffect(() => {
    if (form.brandId) {
      const selectedBrand = brands.find(b => b.id === form.brandId);
      setFilteredLocations(selectedBrand?.showroomLocations || []);
      setForm(prev => ({ ...prev, locationId: "" })); // Reset location
    } else {
      setFilteredLocations([]);
    }
  }, [form.brandId, brands]);

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands');
      const data = await response.json();
      setBrands(data);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDynamicField = (field: string, value: string) => {
    setDynamicFields((prev) => ({ ...prev, [field]: value }));
  };

  const isValid = React.useMemo(() => {
    return (
      form.brandId &&
      form.locationId &&
      form.model.trim() &&
      form.chassisNo.trim() &&
      form.exShowroomPrice.trim() &&
      Number(form.exShowroomPrice) > 0
    );
  }, [form]);

  const renderFieldInput = (field: FieldConfig) => {
    if (field.type === "select") {
      return (
        <Select
          value={dynamicFields[field.key] || ""}
          onValueChange={(value) => handleDynamicField(field.key, value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        placeholder={field.placeholder}
        value={dynamicFields[field.key] || ""}
        onChange={(e) => handleDynamicField(field.key, e.target.value)}
      />
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
    
    const selectedBrand = brands.find(b => b.id === form.brandId);
    const selectedLocation = filteredLocations.find(l => l.id === form.locationId);
    
    try {
      await apiPost('/api/vehicles', {
        make: selectedBrand?.brandName || "",
        model: form.model,
        variant: form.variant,
        color: form.color,
        chassisNo: form.chassisNo,
        engineNo: form.engineNo,
        price: Number(form.exShowroomPrice) || 0,
        year: Number(form.year) || new Date().getFullYear(),
        fuelType: form.fuelType || "PETROL",
        transmission: "MANUAL",
        vehicleType: activeType,
        brandId: form.brandId,
        locationId: form.locationId,
        photo: photos[0] || null,
      });
      toast.success(`${activeConfig.vehicleLabel} added successfully!`);
      router.push("/stock");
    } catch (error: any) {
      toast.error(error.message || `Failed to add ${activeConfig.vehicleLabel.toLowerCase()}`);
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
            Add {activeConfig.vehicleLabel} to Stock
          </h1>
          <p className="text-muted-foreground">Register a new {activeConfig.vehicleLabel.toLowerCase()} in inventory</p>
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
                      setForm((prev) => ({ ...prev, fuelType: "", brandId: "", locationId: "" }));
                      setDynamicFields({});
                    }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      isActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <c.icon className="h-8 w-8" />
                    <span className="font-medium">{c.vehicleLabel}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Brand & Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Brand Selection */}
            <div>
              <Label htmlFor="brand">Brand *</Label>
              <Select value={form.brandId} onValueChange={(value) => handleInputChange("brandId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your brand (KTM, Triumph, etc.)" />
                </SelectTrigger>
                <SelectContent>
                  {brands
                    .filter(brand => showroomType === "MULTI" || brand.brandType === activeType)
                    .map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.brandName} ({brand.brandType})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Selection */}
            <div>
              <Label htmlFor="location">Showroom Location *</Label>
              <Select 
                value={form.locationId} 
                onValueChange={(value) => handleInputChange("locationId", value)}
                disabled={!form.brandId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={form.brandId ? "Select showroom location" : "First select a brand"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.locationName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {brands.length === 0 && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>No brands found!</strong> Add your brands (KTM, Triumph) in{" "}
                  <Button 
                    variant="link" 
                    size="sm"
                    className="p-0 h-auto text-primary"
                    onClick={() => router.push("/admin/brands")}
                  >
                    Brand Management
                  </Button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Details */}
        <Card>
          <CardHeader>
            <CardTitle>{activeConfig.vehicleLabel} Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  placeholder={activeConfig.modelPlaceholder}
                  value={form.model}
                  onChange={(e) => handleInputChange("model", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="variant">Variant</Label>
                <Select value={form.variant} onValueChange={(value) => handleInputChange("variant", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {variantOptions.map((variant) => (
                      <SelectItem key={variant} value={variant}>
                        {variant}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="color">Color</Label>
                <Select value={form.color} onValueChange={(value) => handleInputChange("color", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="year">Model Year</Label>
                <Input
                  id="year"
                  type="number"
                  min="2010"
                  max="2030"
                  value={form.year}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Identification Numbers */}
        <Card>
          <CardHeader>
            <CardTitle>Identification & Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="chassisNo">Chassis Number *</Label>
                <Input
                  id="chassisNo"
                  placeholder="Enter chassis number"
                  value={form.chassisNo}
                  onChange={(e) => handleInputChange("chassisNo", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="engineNo">Engine Number</Label>
                <Input
                  id="engineNo"
                  placeholder="Enter engine number"
                  value={form.engineNo}
                  onChange={(e) => handleInputChange("engineNo", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="exShowroomPrice">Ex-Showroom Price *</Label>
                <Input
                  id="exShowroomPrice"
                  type="number"
                  placeholder="Enter selling price"
                  value={form.exShowroomPrice}
                  onChange={(e) => handleInputChange("exShowroomPrice", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="purchasePrice">Purchase Price</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  placeholder="Your purchase cost"
                  value={form.purchasePrice}
                  onChange={(e) => handleInputChange("purchasePrice", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Fields based on vehicle type */}
        {activeConfig.dynamicFields && activeConfig.dynamicFields.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{activeConfig.vehicleLabel} Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {activeConfig.dynamicFields.map((field) => (
                  <div key={field.key}>
                    <Label htmlFor={field.key}>
                      {field.label}
                      {field.required && " *"}
                    </Label>
                    {renderFieldInput(field)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Photos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              {activeConfig.vehicleLabel} Photos ({photos.length}/{MAX_PHOTOS})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Photo Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-primary/50"
              } ${photos.length >= MAX_PHOTOS ? "opacity-50" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center py-12">
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  Drag photos here or{" "}
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    disabled={photos.length >= MAX_PHOTOS}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    browse files
                  </button>
                </p>
                <p className="text-sm text-muted-foreground">
                  JPG, PNG up to 10MB each • Maximum {MAX_PHOTOS} photos
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                disabled={photos.length >= MAX_PHOTOS}
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {/* Photo Preview Grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <div
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                        index === primaryIndex
                          ? "border-primary ring-2 ring-primary/25"
                          : "border-transparent hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedPhotoIndex(index)}
                    >
                      <img
                        src={photo}
                        alt={`Vehicle photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {index === primaryIndex && (
                        <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                          <Star className="h-3 w-3 inline mr-1" />
                          Primary
                        </div>
                      )}
                      <button
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(index);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      className={`mt-2 w-full text-xs px-2 py-1 rounded transition-colors ${
                        index === primaryIndex
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-primary/20"
                      }`}
                      onClick={() => setPrimaryIndex(index)}
                    >
                      {index === primaryIndex ? "Primary Photo" : "Set as Primary"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!isValid || isUploading}>
          <Save className="h-4 w-4 mr-2" />
          {isUploading ? "Adding..." : `Add ${activeConfig.vehicleLabel}`}
        </Button>
      </div>

      {/* Image Preview Modal */}
      {selectedPhotoIndex !== null && (
        <ImagePreviewModal
          images={photos}
          currentIndex={selectedPhotoIndex}
          onClose={() => setSelectedPhotoIndex(null)}
          onPrevious={() =>
            setSelectedPhotoIndex((prev) =>
              prev !== null ? (prev > 0 ? prev - 1 : photos.length - 1) : 0
            )
          }
          onNext={() =>
            setSelectedPhotoIndex((prev) =>
              prev !== null ? (prev < photos.length - 1 ? prev + 1 : 0) : 0
            )
          }
        />
      )}
    </div>
  );
}