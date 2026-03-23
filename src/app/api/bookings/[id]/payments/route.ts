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
    });
    if (!booking) return errorResponse('Booking not found', 404);

    const payments = await prisma.bookingPayment.findMany({
      where: { bookingId: params.id },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(serializeDecimals(payments));
  } catch (error) {
    console.error('GET /api/bookings/[id]/payments error:', error);
    return errorResponse('Internal server error');
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const booking = await prisma.booking.findFirst({
      where: { id: params.id, tenantId: session!.user.tenantId },
    });
    if (!booking) return errorResponse('Booking not found', 404);

    const body = await req.json();
    const { amount, mode, reference, notes } = body;

    if (!amount || amount <= 0) {
      return errorResponse('Amount must be a positive number', 400);
    }
    if (!mode) {
      return errorResponse('Payment mode is required', 400);
    }

    const payment = await prisma.bookingPayment.create({
      data: {
        bookingId: params.id,
        amount,
        mode,
        reference: reference || null,
        receivedBy: session!.user.name,
        notes: notes || null,
      },
    });

    // Update booking paid/pending amounts
    const newPaid = Number(booking.paidAmount) + amount;
    const newPending = Number(booking.totalAmount) - newPaid;

    await prisma.booking.update({
      where: { id: params.id },
      data: {
        paidAmount: newPaid,
        pendingAmount: Math.max(0, newPending),
      },
    });

    return NextResponse.json(serializeDecimals(payment), { status: 201 });
  } catch (error) {
    console.error('POST /api/bookings/[id]/payments error:', error);
    return errorResponse('Internal server error');
  }
}
