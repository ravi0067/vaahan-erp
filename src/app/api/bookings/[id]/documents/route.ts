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

    const documents = await prisma.bookingDocument.findMany({
      where: { bookingId: params.id },
      orderBy: { uploadedAt: 'desc' },
    });

    return NextResponse.json(serializeDecimals(documents));
  } catch (error) {
    console.error('GET /api/bookings/[id]/documents error:', error);
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
    const { type, fileUrl, fileName } = body;

    if (!type || !fileUrl) {
      return errorResponse('Document type and file URL are required', 400);
    }

    const document = await prisma.bookingDocument.create({
      data: {
        bookingId: params.id,
        type,
        fileUrl,
        fileName: fileName || null,
      },
    });

    return NextResponse.json(serializeDecimals(document), { status: 201 });
  } catch (error) {
    console.error('POST /api/bookings/[id]/documents error:', error);
    return errorResponse('Internal server error');
  }
}
