import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession, serializeDecimals, errorResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const booking = await prisma.booking.findFirst({
      where: { id: params.id, tenantId: session!.user.tenantId },
      include: {
        customer: true,
        vehicle: true,
        salesExec: { select: { id: true, name: true } },
        payments: { orderBy: { date: 'desc' } },
        documents: { orderBy: { uploadedAt: 'desc' } },
        rtoRegistration: true,
      },
    });

    if (!booking) return errorResponse('Booking not found', 404);
    return NextResponse.json(serializeDecimals(booking));
  } catch (error) {
    console.error('GET /api/bookings/[id] error:', error);
    return errorResponse('Internal server error');
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const existing = await prisma.booking.findFirst({ where: { id: params.id, tenantId } });
    if (!existing) return errorResponse('Booking not found', 404);

    const body = await req.json();
    const { status, step, totalAmount, vehicleId, financeProvider, loanAmount, loanStatus } = body;

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (step !== undefined) updateData.step = step;
    if (totalAmount !== undefined) {
      updateData.totalAmount = totalAmount;
      updateData.pendingAmount = totalAmount - Number(existing.paidAmount);
    }
    if (vehicleId !== undefined) updateData.vehicleId = vehicleId;
    if (financeProvider !== undefined) updateData.financeProvider = financeProvider;
    if (loanAmount !== undefined) updateData.loanAmount = loanAmount;
    if (loanStatus !== undefined) updateData.loanStatus = loanStatus;

    // If vehicle changed, update old and new vehicle statuses
    if (vehicleId && vehicleId !== existing.vehicleId) {
      if (existing.vehicleId) {
        await prisma.vehicle.update({ where: { id: existing.vehicleId }, data: { status: 'AVAILABLE' } });
      }
      await prisma.vehicle.update({ where: { id: vehicleId }, data: { status: 'BOOKED' } });
    }

    // If delivered, mark vehicle as sold
    if (status === 'DELIVERED' && existing.vehicleId) {
      await prisma.vehicle.update({ where: { id: existing.vehicleId }, data: { status: 'SOLD' } });
    }

    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: updateData,
      include: { customer: true, vehicle: true, payments: true },
    });

    return NextResponse.json(serializeDecimals(booking));
  } catch (error) {
    console.error('PUT /api/bookings/[id] error:', error);
    return errorResponse('Internal server error');
  }
}
