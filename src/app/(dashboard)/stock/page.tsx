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
import { Plus, Search, Package } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
type StockStatus = "Available" | "Booked" | "Sold";

interface StockItem {
  id: string;
  model: string;
  variant: string;
  color: string;
  engineNo: string;
  chassisNo: string;
  price: number;
  status: StockStatus;
  purchaseDate: string;
}

// ── Mock data ──────────────────────────────────────────────────────────────
const mockStock: StockItem[] = [
  { id: "S001", model: "Honda Activa 6G", variant: "STD", color: "Pearl White", engineNo: "ENG-A6G-001", chassisNo: "CHS-A6G-001", price: 78000, status: "Available", purchaseDate: "2024-03-01" },
  { id: "S002", model: "Honda Activa 6G", variant: "DLX", color: "Rebel Red", engineNo: "ENG-A6G-002", chassisNo: "CHS-A6G-002", price: 85000, status: "Booked", purchaseDate: "2024-03-05" },
  { id: "S003", model: "Honda SP 125", variant: "STD", color: "Matte Black", engineNo: "ENG-SP1-003", chassisNo: "CHS-SP1-003", price: 92000, status: "Available", purchaseDate: "2024-03-08" },
  { id: "S004", model: "Honda Shine", variant: "Drum", color: "Athletic Blue", engineNo: "ENG-SHN-004", chassisNo: "CHS-SHN-004", price: 82000, status: "Sold", purchaseDate: "2024-02-20" },
  { id: "S005", model: "Honda Unicorn", variant: "BS6", color: "Pearl Spartan Red", engineNo: "ENG-UNI-005", chassisNo: "CHS-UNI-005", price: 105000, status: "Available", purchaseDate: "2024-03-12" },
  { id: "S006", model: "Honda SP 125", variant: "Disc", color: "Imperial Red", engineNo: "ENG-SP1-006", chassisNo: "CHS-SP1-006", price: 96000, status: "Booked", purchaseDate: "2024-03-10" },
  { id: "S007", model: "Honda Dio", variant: "STD", color: "Vibrant Orange", engineNo: "ENG-DIO-007", chassisNo: "CHS-DIO-007", price: 72000, status: "Available", purchaseDate: "2024-03-15" },
  { id: "S008", model: "Honda CB350", variant: "DLX", color: "Matte Axis Gray", engineNo: "ENG-CB3-008", chassisNo: "CHS-CB3-008", price: 210000, status: "Available", purchaseDate: "2024-03-18" },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
const formatCurrency = (amt: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amt);

const statusStyle: Record<StockStatus, string> = {
  Available: "bg-green-100 text-green-700 border-green-300",
  Booked: "bg-amber-100 text-amber-700 border-amber-300",
  Sold: "bg-gray-100 text-gray-500 border-gray-300",
};

const models = Array.from(new Set(mockStock.map((s) => s.model)));

// ── Page ────────────────────────────────────────────────────────────────────
export default function StockPage() {
  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [filterModel, setFilterModel] = React.useState<string>("all");

  const filtered = mockStock.filter((s) => {
    if (filterStatus !== "all" && s.status !== filterStatus) return false;
    if (filterModel !== "all" && s.model !== filterModel) return false;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock / Inventory</h1>
          <p className="text-muted-foreground">Manage vehicle stock and inventory</p>
        </div>
        <Link href="/stock/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Vehicle
          </Button>
        </Link>
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
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Booked">Booked</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterModel} onValueChange={setFilterModel}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                {models.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" /> Inventory ({filtered.length} vehicles)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead className="hidden sm:table-cell">Variant</TableHead>
                <TableHead className="hidden md:table-cell">Color</TableHead>
                <TableHead className="hidden lg:table-cell">Engine No</TableHead>
                <TableHead className="hidden lg:table-cell">Chassis No</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.model}</TableCell>
                  <TableCell className="hidden sm:table-cell">{item.variant}</TableCell>
                  <TableCell className="hidden md:table-cell">{item.color}</TableCell>
                  <TableCell className="hidden lg:table-cell font-mono text-xs">{item.engineNo}</TableCell>
                  <TableCell className="hidden lg:table-cell font-mono text-xs">{item.chassisNo}</TableCell>
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
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No vehicles found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
