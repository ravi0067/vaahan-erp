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
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where: Record<string, unknown> = { tenantId };
    if (status && status !== 'all') where.status = status;
    if (from || to) {
      where.createdAt = {};
      if (from) (where.createdAt as Record<string, unknown>).gte = new Date(from);
      if (to) (where.createdAt as Record<string, unknown>).lte = new Date(to);
    }
    if (search) {
      where.OR = [
        { bookingNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { mobile: { contains: search } } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where: where as any,
      include: {
        customer: true,
        vehicle: true,
        salesExec: { select: { id: true, name: true } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(serializeDecimals(bookings));
  } catch (error) {
    console.error('GET /api/bookings error:', error);
    return errorResponse('Internal server error');
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const body = await req.json();
    const { customerId, vehicleId, totalAmount, financeProvider, loanAmount } = body;

    if (!customerId) {
      return errorResponse('Customer is required', 400);
    }

    // Auto-generate booking number
    const year = new Date().getFullYear();
    const count = await prisma.booking.count({ where: { tenantId } });
    const bookingNumber = `VHN-${year}-${String(count + 1).padStart(3, '0')}`;

    const booking = await prisma.booking.create({
      data: {
        tenantId,
        bookingNumber,
        customerId,
        vehicleId: vehicleId || null,
        salesExecId: session!.user.id,
        status: 'DRAFT',
        step: 1,
        totalAmount: totalAmount || 0,
        paidAmount: 0,
        pendingAmount: totalAmount || 0,
        financeProvider: financeProvider || null,
        loanAmount: loanAmount || null,
      },
      include: { customer: true, vehicle: true },
    });

    // Mark vehicle as booked if selected
    if (vehicleId) {
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'BOOKED' },
      });
    }

    return NextResponse.json(serializeDecimals(booking), { status: 201 });
  } catch (error) {
    console.error('POST /api/bookings error:', error);
    return errorResponse('Internal server error');
  }
}
