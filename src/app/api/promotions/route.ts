import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

function getStatus(from: Date, to: Date) {
  const now = new Date();
  if (now > to) return "Expired";
  if (now < from) return "Upcoming";
  return "Active";
}

export async function GET() {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;
    const tenantId = session!.user.tenantId;

    const promotions = await prisma.promotion.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });

    const data = promotions.map((p) => ({
      ...p,
      status: getStatus(p.validFrom, p.validTo),
    }));

    return NextResponse.json({ success: true, promotions: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;
    const tenantId = session!.user.tenantId;

    const body = await req.json();
    const { title, description, discountPercent, validFrom, validTo, applicableBrands, applicableVehicles, type } = body;

    if (!title || !validFrom || !validTo) {
      return NextResponse.json({ success: false, error: "Title and dates are required" }, { status: 400 });
    }

    const promotion = await prisma.promotion.create({
      data: {
        tenantId,
        title,
        description: description || null,
        discountPercent: discountPercent || 0,
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        applicableBrands: applicableBrands || null,
        applicableVehicles: applicableVehicles || null,
        type: type || "Festival",
      },
    });

    return NextResponse.json({
      success: true,
      promotion: { ...promotion, status: getStatus(promotion.validFrom, promotion.validTo) },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;
    const tenantId = session!.user.tenantId;

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Promotion ID is required" }, { status: 400 });
    }

    const existing = await prisma.promotion.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== tenantId) {
      return NextResponse.json({ success: false, error: "Promotion not found" }, { status: 404 });
    }

    const data: any = {};
    if (updates.title !== undefined) data.title = updates.title;
    if (updates.description !== undefined) data.description = updates.description;
    if (updates.discountPercent !== undefined) data.discountPercent = updates.discountPercent;
    if (updates.validFrom !== undefined) data.validFrom = new Date(updates.validFrom);
    if (updates.validTo !== undefined) data.validTo = new Date(updates.validTo);
    if (updates.applicableBrands !== undefined) data.applicableBrands = updates.applicableBrands;
    if (updates.applicableVehicles !== undefined) data.applicableVehicles = updates.applicableVehicles;
    if (updates.type !== undefined) data.type = updates.type;
    if (updates.isActive !== undefined) data.isActive = updates.isActive;

    const promotion = await prisma.promotion.update({ where: { id }, data });

    return NextResponse.json({ success: true, promotion });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;
    const tenantId = session!.user.tenantId;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Promotion ID is required" }, { status: 400 });
    }

    const existing = await prisma.promotion.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== tenantId) {
      return NextResponse.json({ success: false, error: "Promotion not found" }, { status: 404 });
    }

    await prisma.promotion.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Promotion deleted" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
