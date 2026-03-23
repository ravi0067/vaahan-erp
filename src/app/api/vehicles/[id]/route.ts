import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession, serializeDecimals, errorResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const vehicle = await prisma.vehicle.findFirst({
      where: { id: params.id, tenantId: session!.user.tenantId },
    });

    if (!vehicle) return errorResponse('Vehicle not found', 404);
    return NextResponse.json(serializeDecimals(vehicle));
  } catch (error) {
    console.error('GET /api/vehicles/[id] error:', error);
    return errorResponse('Internal server error');
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const existing = await prisma.vehicle.findFirst({ where: { id: params.id, tenantId } });
    if (!existing) return errorResponse('Vehicle not found', 404);

    const body = await req.json();
    const vehicle = await prisma.vehicle.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json(serializeDecimals(vehicle));
  } catch (error) {
    console.error('PUT /api/vehicles/[id] error:', error);
    return errorResponse('Internal server error');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const existing = await prisma.vehicle.findFirst({ where: { id: params.id, tenantId } });
    if (!existing) return errorResponse('Vehicle not found', 404);

    await prisma.vehicle.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/vehicles/[id] error:', error);
    return errorResponse('Internal server error');
  }
}
