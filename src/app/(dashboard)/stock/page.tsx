"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Package, LayoutGrid, List, Trash2, Download, CheckSquare } from "lucide-react";
import { VehicleCard } from "./components/VehicleCard";
import { ImagePreviewModal } from "@/components/ui/image-preview-modal";
import { exportToCSV } from "@/lib/export-csv";
import { useShowroomStore } from "@/store/showroom-store";
import { showroomConfig, mockVehiclesByType, type MockVehicle } from "@/lib/showroom-config";

type StockStatus = "Available" | "Booked" | "Sold";

const formatCurrency = (amt: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amt);

const statusStyle: Record<StockStatus, string> = {
  Available: "bg-green-100 text-green-700 border-green-300",
  Booked: "bg-amber-100 text-amber-700 border-amber-300",
  Sold: "bg-gray-100 text-gray-500 border-gray-300",
};

export default function StockPage() {
  const { showroomType } = useShowroomStore();
  const config = showroomConfig[showroomType];
  const mockStock = mockVehiclesByType[showroomType];

  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [filterBrand, setFilterBrand] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [lightboxImages, setLightboxImages] = React.useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = React.useState(0);

  const brands = Array.from(new Set(mockStock.map((s) => s.brand)));

  const filtered = mockStock.filter((s) => {
    if (filterStatus !== "all" && s.status !== filterStatus) return false;
    if (filterBrand !== "all" && s.brand !== filterBrand) return false;
    if (
      search &&
      !s.chassisNo.toLowerCase().includes(search.toLowerCase()) &&
      !s.engineNo.toLowerCase().includes(search.toLowerCase()) &&
      !s.model.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const available = mockStock.filter((s) => s.status === "Available").length;
  const booked = mockStock.filter((s) => s.status === "Booked").length;
  const sold = mockStock.filter((s) => s.status === "Sold").length;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((s) => s.id)));
    }
  };

  const openPhotoPreview = (photo: string) => {
    if (!photo) return;
    const allPhotos = filtered.map((s) => s.photo).filter(Boolean) as string[];
    const idx = allPhotos.indexOf(photo);
    setLightboxImages(allPhotos);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  };

  // Get spec display value
  const getSpec = (item: MockVehicle, key: string): string => {
    const val = item.specs[key];
    return val !== undefined ? String(val) : "—";
  };

  // Dynamic table columns based on showroom type
  const renderTableHeaders = () => {
    switch (showroomType) {
      case "BIKE":
        return (
          <>
            <TableHead className="hidden sm:table-cell">CC</TableHead>
            <TableHead className="hidden md:table-cell">Color</TableHead>
            <TableHead className="hidden md:table-cell">Fuel</TableHead>
            <TableHead className="hidden lg:table-cell">Mileage</TableHead>
          </>
        );
      case "CAR":
        return (
          <>
            <TableHead className="hidden sm:table-cell">Body Type</TableHead>
            <TableHead className="hidden md:table-cell">Fuel</TableHead>
            <TableHead className="hidden md:table-cell">Transmission</TableHead>
            <TableHead className="hidden lg:table-cell">Seating</TableHead>
          </>
        );
      case "EV":
        return (
          <>
            <TableHead className="hidden sm:table-cell">Category</TableHead>
            <TableHead className="hidden md:table-cell">Battery</TableHead>
            <TableHead className="hidden md:table-cell">Range</TableHead>
            <TableHead className="hidden lg:table-cell">Charge Time</TableHead>
          </>
        );
      case "MULTI":
        return (
          <>
            <TableHead className="hidden sm:table-cell">Type</TableHead>
            <TableHead className="hidden md:table-cell">Fuel</TableHead>
          </>
        );
    }
  };

  const renderTableCells = (item: MockVehicle) => {
    switch (showroomType) {
      case "BIKE":
        return (
          <>
            <TableCell className="hidden sm:table-cell">{getSpec(item, "cc")}</TableCell>
            <TableCell className="hidden md:table-cell">{item.color}</TableCell>
            <TableCell className="hidden md:table-cell">{item.fuelType}</TableCell>
            <TableCell className="hidden lg:table-cell">{getSpec(item, "mileage")} km/l</TableCell>
          </>
        );
      case "CAR":
        return (
          <>
            <TableCell className="hidden sm:table-cell">{getSpec(item, "bodyType")}</TableCell>
            <TableCell className="hidden md:table-cell">{item.fuelType}</TableCell>
            <TableCell className="hidden md:table-cell">{getSpec(item, "transmission")}</TableCell>
            <TableCell className="hidden lg:table-cell">{getSpec(item, "seatingCapacity")}</TableCell>
          </>
        );
      case "EV":
        return (
          <>
            <TableCell className="hidden sm:table-cell">{getSpec(item, "vehicleCategory")}</TableCell>
            <TableCell className="hidden md:table-cell">{getSpec(item, "batteryCapacity")} kWh</TableCell>
            <TableCell className="hidden md:table-cell">{getSpec(item, "range")} km</TableCell>
            <TableCell className="hidden lg:table-cell">{getSpec(item, "chargingTime")} hrs</TableCell>
          </>
        );
      case "MULTI":
        return (
          <>
            <TableCell className="hidden sm:table-cell">{item.fuelType === "ELECTRIC" ? "EV" : item.fuelType}</TableCell>
            <TableCell className="hidden md:table-cell">{item.fuelType}</TableCell>
          </>
        );
    }
  };

  const getColSpan = () => {
    switch (showroomType) {
      case "BIKE": return 9;
      case "CAR": return 9;
      case "EV": return 9;
      case "MULTI": return 7;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{config.stockLabel}</h1>
          <p className="text-muted-foreground">Manage {config.vehicleLabel.toLowerCase()} stock and inventory</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="rounded-none gap-1"
            >
              <List className="h-4 w-4" /> Table
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-none gap-1"
            >
              <LayoutGrid className="h-4 w-4" /> Cards
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(filtered as unknown as Record<string, unknown>[], "stock-list", [
              { key: "id", label: "ID" },
              { key: "model", label: "Model" },
              { key: "variant", label: "Variant" },
              { key: "color", label: "Color" },
              { key: "engineNo", label: "Engine No" },
              { key: "chassisNo", label: "Chassis No" },
              { key: "price", label: "Price" },
              { key: "status", label: "Status" },
            ])}
          >
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
          <Link href="/stock/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add {config.vehicleLabel}
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 grid-cols-3">
        <Card className="border-green-200">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-green-700">Available</p>
            <p className="text-3xl font-bold text-green-700">{available}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-amber-700">Booked</p>
            <p className="text-3xl font-bold text-amber-700">{booked}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">Sold</p>
            <p className="text-3xl font-bold text-gray-500">{sold}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search by chassis / engine no / model...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Booked">Booked</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterBrand} onValueChange={setFilterBrand}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-lg px-4 py-2">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => alert("Marking as sold...")}>
              <CheckSquare className="h-3 w-3 mr-1" /> Mark as Sold
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs text-red-600" onClick={() => alert("Deleting...")}>
              <Trash2 className="h-3 w-3 mr-1" /> Delete
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => alert("Exporting...")}>
              <Download className="h-3 w-3 mr-1" /> Export Selected
            </Button>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <VehicleCard
              key={item.id}
              model={item.model}
              variant={item.variant}
              color={item.color}
              price={item.price}
              status={item.status}
              engineNo={item.engineNo}
              chassisNo={item.chassisNo}
              photo={item.photo}
              fuelType={item.fuelType}
              specs={item.specs}
              showroomType={showroomType}
              onView={() => item.photo && openPhotoPreview(item.photo)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-12">
              No {config.vehicleLabelPlural.toLowerCase()} found.
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" /> {config.stockLabel} ({filtered.length} {config.vehicleLabelPlural.toLowerCase()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead className="w-[50px]">Photo</TableHead>
                  <TableHead>Model</TableHead>
                  {renderTableHeaders()}
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id} className={selectedIds.has(item.id) ? "bg-primary/5" : ""}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell>
                      {item.photo ? (
                        <button
                          onClick={() => openPhotoPreview(item.photo!)}
                          className="w-10 h-10 rounded overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.photo} alt={item.model} className="w-full h-full object-cover" />
                        </button>
                      ) : (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
                          N/A
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{item.model}</TableCell>
                    {renderTableCells(item)}
                    <TableCell className="text-right font-semibold">{formatCurrency(item.price)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyle[item.status]}>
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={getColSpan()} className="text-center text-muted-foreground py-8">
                      No {config.vehicleLabelPlural.toLowerCase()} found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <ImagePreviewModal
        images={lightboxImages}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
