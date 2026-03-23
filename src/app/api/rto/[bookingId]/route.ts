import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession, serializeDecimals, errorResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { bookingId: string } }) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const booking = await prisma.booking.findFirst({
      where: { id: params.bookingId, tenantId: session!.user.tenantId },
    });
    if (!booking) return errorResponse('Booking not found', 404);

    const rto = await prisma.rTORegistration.findUnique({
      where: { bookingId: params.bookingId },
      include: {
        booking: { include: { customer: true, vehicle: true } },
      },
    });

    if (!rto) return errorResponse('RTO registration not found', 404);
    return NextResponse.json(serializeDecimals(rto));
  } catch (error) {
    console.error('GET /api/rto/[bookingId] error:', error);
    return errorResponse('Internal server error');
  }
}

export async function POST(req: NextRequest, { params }: { params: { bookingId: string } }) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const booking = await prisma.booking.findFirst({
      where: { id: params.bookingId, tenantId: session!.user.tenantId },
    });
    if (!booking) return errorResponse('Booking not found', 404);

    const body = await req.json();
    const { registrationNumber, status, notes, insuranceExpiry } = body;

    const rto = await prisma.rTORegistration.upsert({
      where: { bookingId: params.bookingId },
      update: {
        registrationNumber: registrationNumber || undefined,
        status: status || undefined,
        notes: notes || undefined,
        insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : undefined,
        approvedDate: status === 'APPROVED' ? new Date() : undefined,
      },
      create: {
        bookingId: params.bookingId,
        registrationNumber: registrationNumber || null,
        status: status || 'APPLIED',
        notes: notes || null,
        insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null,
      },
      include: {
        booking: { include: { customer: true, vehicle: true } },
      },
    });

    // Update booking status if RTO approved
    if (status === 'APPROVED') {
      await prisma.booking.update({
        where: { id: params.bookingId },
        data: { status: 'READY' },
      });
    }

    return NextResponse.json(serializeDecimals(rto));
  } catch (error) {
    console.error('POST /api/rto/[bookingId] error:', error);
    return errorResponse('Internal server error');
  }
}
