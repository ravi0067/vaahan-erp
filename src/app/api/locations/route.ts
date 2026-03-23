import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession, errorResponse, serializeDecimals } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;

    const locations = await prisma.showroomLocation.findMany({
      where: { tenantId, isActive: true },
      include: {
        brand: { select: { id: true, brandName: true, brandType: true } },
        _count: {
          select: { vehicles: true }
        }
      },
      orderBy: { locationName: 'asc' }
    });

    return NextResponse.json(serializeDecimals(locations));
  } catch (error) {
    console.error('Error fetching locations:', error);
    return errorResponse('Failed to fetch locations');
  }
}

export async function POST(request: Request) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const data = await request.json();

    const location = await prisma.showroomLocation.create({
      data: {
        tenantId,
        brandId: data.brandId,
        locationName: data.locationName,
        address: data.address,
        phone: data.phone,
        managerName: data.managerName,
      },
    });

    return NextResponse.json(serializeDecimals(location));
  } catch (error) {
    console.error('Error creating location:', error);
    return errorResponse('Failed to create location');
  }
}