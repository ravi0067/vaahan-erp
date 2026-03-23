import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession, serializeDecimals, errorResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;

    const registrations = await prisma.rTORegistration.findMany({
      where: {
        booking: { tenantId },
      },
      include: {
        booking: {
          include: {
            customer: true,
            vehicle: true,
          },
        },
      },
      orderBy: { appliedDate: 'desc' },
    });

    return NextResponse.json(serializeDecimals(registrations));
  } catch (error) {
    console.error('GET /api/rto error:', error);
    return errorResponse('Internal server error');
  }
}
