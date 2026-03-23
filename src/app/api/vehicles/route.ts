import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession, serializeDecimals, errorResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = { tenantId };
    if (status && status !== 'all') where.status = status;
    if (search) {
      where.OR = [
        { model: { contains: search, mode: 'insensitive' } },
        { chassisNo: { contains: search, mode: 'insensitive' } },
        { engineNo: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(serializeDecimals(vehicles));
  } catch (error) {
    console.error('GET /api/vehicles error:', error);
    return errorResponse('Internal server error');
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const body = await req.json();

    const { brand, model, variant, color, chassisNo, engineNo, exShowroomPrice, purchasePrice, year, fuelType, photo } = body;

    if (!brand || !model || !chassisNo || !engineNo) {
      return errorResponse('Brand, model, chassis no, and engine no are required', 400);
    }

    const existing = await prisma.vehicle.findFirst({ where: { chassisNo, tenantId } });
    if (existing) {
      return errorResponse('Vehicle with this chassis number already exists', 409);
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        tenantId,
        brand,
        model,
        variant: variant || null,
        color: color || null,
        chassisNo,
        engineNo,
        exShowroomPrice: exShowroomPrice || 0,
        purchasePrice: purchasePrice || 0,
        year: year || new Date().getFullYear(),
        fuelType: fuelType || null,
        photo: photo || null,
        status: 'AVAILABLE',
      },
    });

    return NextResponse.json(serializeDecimals(vehicle), { status: 201 });
  } catch (error) {
    console.error('POST /api/vehicles error:', error);
    return errorResponse('Internal server error');
  }
}
