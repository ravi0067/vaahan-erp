import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession, errorResponse, serializeDecimals } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;

    const brands = await prisma.dealershipBrand.findMany({
      where: { tenantId, isActive: true },
      include: {
        showroomLocations: {
          where: { isActive: true },
          select: { id: true, locationName: true, address: true, phone: true }
        },
        _count: {
          select: { vehicles: true }
        }
      },
      orderBy: { brandName: 'asc' }
    });

    return NextResponse.json(serializeDecimals(brands));
  } catch (error) {
    console.error('Error fetching brands:', error);
    return errorResponse('Failed to fetch brands');
  }
}

export async function POST(request: Request) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const data = await request.json();

    const brand = await prisma.dealershipBrand.create({
      data: {
        tenantId,
        brandName: data.brandName,
        brandType: data.brandType || 'BIKE',
        logoUrl: data.logoUrl,
      },
    });

    return NextResponse.json(serializeDecimals(brand));
  } catch (error) {
    console.error('Error creating brand:', error);
    return errorResponse('Failed to create brand');
  }
}