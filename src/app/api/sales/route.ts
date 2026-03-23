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
    const period = searchParams.get('period') || 'month';
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let dateFilter: Record<string, unknown> = {};
    const now = new Date();

    if (from && to) {
      dateFilter = { gte: new Date(from), lte: new Date(to) };
    } else {
      switch (period) {
        case 'today': {
          const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          dateFilter = { gte: start };
          break;
        }
        case 'week': {
          const start = new Date(now);
          start.setDate(start.getDate() - 7);
          dateFilter = { gte: start };
          break;
        }
        case 'month': {
          const start = new Date(now.getFullYear(), now.getMonth(), 1);
          dateFilter = { gte: start };
          break;
        }
      }
    }

    const bookings = await prisma.booking.findMany({
      where: {
        tenantId,
        status: 'DELIVERED',
        ...(Object.keys(dateFilter).length > 0 ? { updatedAt: dateFilter } : {}),
      },
      include: {
        customer: true,
        vehicle: true,
        payments: true,
        salesExec: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.paidAmount), 0);
    const totalSales = bookings.length;

    return NextResponse.json(serializeDecimals({
      bookings,
      totalRevenue,
      totalSales,
    }));
  } catch (error) {
    console.error('GET /api/sales error:', error);
    return errorResponse('Internal server error');
  }
}
