/**
 * Vaani Avatar — Fetch dealership inventory for AI context
 * GET /api/vaani-avatar/inventory?tenantId=xxx
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      // Return empty — avatar will use generic fallback
      return NextResponse.json({ brands: [], vehicles: [], firmName: null });
    }

    // Fetch tenant info (firm name)
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, email: true, address: true },
    });

    // Fetch all brands for this dealership
    const brands = await prisma.dealershipBrand.findMany({
      where: { tenantId },
      select: {
        id: true,
        brandName: true,
        brandType: true,
        showroomLocations: {
          select: { locationName: true, city: true, phone: true },
        },
      },
    });

    // Fetch available vehicles (only AVAILABLE status)
    const vehicles = await prisma.vehicle.findMany({
      where: {
        tenantId,
        status: "AVAILABLE",
      },
      select: {
        id: true,
        model: true,
        variant: true,
        color: true,
        price: true,
        brand: {
          select: { brandName: true, brandType: true },
        },
      },
      orderBy: { price: "asc" },
      take: 50, // Limit for AI context
    });

    // Build summary for AI
    const brandNames = brands.map(b => b.brandName);
    const vehicleSummary = vehicles.map(v => ({
      brand: v.brand?.brandName || "Unknown",
      model: v.model,
      variant: v.variant || "",
      color: v.color || "",
      price: Number(v.price),
    }));

    // Group by brand for AI context
    const inventoryByBrand: Record<string, any[]> = {};
    vehicleSummary.forEach(v => {
      if (!inventoryByBrand[v.brand]) inventoryByBrand[v.brand] = [];
      inventoryByBrand[v.brand].push(v);
    });

    return NextResponse.json({
      firmName: tenant?.name || null,
      city: tenant?.address || null,
      brands: brandNames,
      inventoryByBrand,
      totalAvailable: vehicles.length,
      showroomLocations: brands.flatMap(b =>
        b.showroomLocations.map(l => ({
          brand: b.brandName,
          name: l.locationName,
          city: l.city,
          phone: l.phone,
        }))
      ),
    });
  } catch (error: any) {
    console.error("Avatar inventory fetch error:", error);
    return NextResponse.json({
      brands: [],
      vehicles: [],
      firmName: null,
      error: error.message,
    });
  }
}
