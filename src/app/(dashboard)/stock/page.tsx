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
import { Plus, Search, Package, LayoutGrid, List, Trash2, Download, CheckSquare, RefreshCw } from "lucide-react";
import { VehicleCard } from "./components/VehicleCard";
import { ImagePreviewModal } from "@/components/ui/image-preview-modal";
import { exportToCSV } from "@/lib/export-csv";
import { useShowroomStore } from "@/store/showroom-store";
import { showroomConfig } from "@/lib/showroom-config";
import { apiGet, apiDelete } from "@/lib/api";
import { toast } from "sonner";

type VehicleStatusLabel = "AVAILABLE" | "BOOKED" | "SOLD" | "IN_TRANSIT";

const formatCurrency = (amt: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amt);

const statusStyle: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-700 border-green-300",
  BOOKED: "bg-amber-100 text-amber-700 border-amber-300",
  SOLD: "bg-gray-100 text-gray-500 border-gray-300",
  IN_TRANSIT: "bg-blue-100 text-blue-700 border-blue-300",
};

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  variant?: string;
  color?: string;
  chassisNo: string;
  engineNo: string;
  exShowroomPrice: number;
  purchasePrice: number;
  year: number;
  fuelType?: string;
  photo?: string;
  status: VehicleStatusLabel;
  createdAt: string;
}

export default function StockPage() {
  const { showroomType } = useShowroomStore();
  const config = showroomConfig[showroomType];

  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [filterBrand, setFilterBrand] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [lightboxImages, setLightboxImages] = React.useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = React.useState(0);

  const fetchVehicles = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<Vehicle[]>('/api/vehicles');
      setVehicles(data);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const brands = Array.from(new Set(vehicles.map((s) => s.brand)));

  const filtered = vehicles.filter((s) => {
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

  const available = vehicles.filter((s) => s.status === "AVAILABLE").length;
  const booked = vehicles.filter((s) => s.status === "BOOKED").length;
  const sold = vehicles.filter((s) => s.status === "SOLD").length;

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

  const handleDeleteSelected = async () => {
    if (!confirm(`Delete ${selectedIds.size} vehicle(s)?`)) return;
    try {
      await Promise.all(Array.from(selectedIds).map(id => apiDelete(`/api/vehicles/${id}`)));
      toast.success(`${selectedIds.size} vehicle(s) deleted`);
      setSelectedIds(new Set());
      fetchVehicles();
    } catch {
      toast.error('Failed to delete vehicles');
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}><CardContent className="p-4"><div className="h-12 bg-muted animate-pulse rounded" /></CardContent></Card>
          ))}
        </div>
        <Card><CardContent className="p-6"><div className="h-64 bg-muted animate-pulse rounded" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{config.stockLabel}</h1>
          <p className="text-muted-foreground">Manage {config.vehicleLabel.toLowerCase()} stock and inventory</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchVehicles} className="gap-1">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
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
              { key: "brand", label: "Brand" },
              { key: "model", label: "Model" },
              { key: "variant", label: "Variant" },
              { key: "color", label: "Color" },
              { key: "engineNo", label: "Engine No" },
              { key: "chassisNo", label: "Chassis No" },
              { key: "exShowroomPrice", label: "Price" },
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
                placeholder="Search by chassis / engine no / model..."
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
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="BOOKED">Booked</SelectItem>
                <SelectItem value="SOLD">Sold</SelectItem>
                <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
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
            <Button size="sm" variant="outline" className="h-7 text-xs text-red-600" onClick={handleDeleteSelected}>
              <Trash2 className="h-3 w-3 mr-1" /> Delete
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
              const selected = filtered.filter(v => selectedIds.has(v.id));
              exportToCSV(selected as unknown as Record<string, unknown>[], "selected-stock", [
                { key: "brand", label: "Brand" },
                { key: "model", label: "Model" },
                { key: "chassisNo", label: "Chassis No" },
                { key: "exShowroomPrice", label: "Price" },
                { key: "status", label: "Status" },
              ]);
            }}>
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
              variant={item.variant || ""}
              color={item.color || ""}
              price={item.exShowroomPrice}
              status={item.status === "AVAILABLE" ? "Available" : item.status === "BOOKED" ? "Booked" : "Sold"}
              engineNo={item.engineNo}
              chassisNo={item.chassisNo}
              photo={item.photo}
              fuelType={item.fuelType || ""}
              specs={{}}
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
                  <TableHead>Brand</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead className="hidden sm:table-cell">Chassis No</TableHead>
                  <TableHead className="hidden md:table-cell">Color</TableHead>
                  <TableHead className="hidden md:table-cell">Year</TableHead>
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
                    <TableCell>{item.brand}</TableCell>
                    <TableCell className="font-medium">{item.model}</TableCell>
                    <TableCell className="hidden sm:table-cell font-mono text-xs">{item.chassisNo}</TableCell>
                    <TableCell className="hidden md:table-cell">{item.color || '—'}</TableCell>
                    <TableCell className="hidden md:table-cell">{item.year}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(item.exShowroomPrice)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyle[item.status] || ""}>
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
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
