import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession, errorResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;

    // Sales trend - last 6 months
    const salesTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);

      const count = await prisma.booking.count({
        where: { tenantId, status: 'DELIVERED', updatedAt: { gte: start, lt: end } },
      });

      const revenue = await prisma.bookingPayment.aggregate({
        where: {
          booking: { tenantId },
          date: { gte: start, lt: end },
        },
        _sum: { amount: true },
      });

      salesTrend.push({
        month: start.toLocaleString('en-IN', { month: 'short', year: '2-digit' }),
        sales: count,
        revenue: Number(revenue._sum.amount || 0),
      });
    }

    // Lead pipeline
    const leadPipeline = await Promise.all(
      ['NEW', 'CONTACTED', 'FOLLOWUP', 'CONVERTED', 'LOST'].map(async (status) => ({
        status,
        count: await prisma.lead.count({ where: { tenantId, status: status as 'NEW' | 'CONTACTED' | 'FOLLOWUP' | 'CONVERTED' | 'LOST' } }),
      }))
    );

    // Vehicle status distribution
    const vehicleStatus = await Promise.all(
      ['AVAILABLE', 'BOOKED', 'SOLD', 'IN_TRANSIT'].map(async (status) => ({
        status,
        count: await prisma.vehicle.count({ where: { tenantId, status: status as 'AVAILABLE' | 'BOOKED' | 'SOLD' | 'IN_TRANSIT' } }),
      }))
    );

    return NextResponse.json({
      salesTrend,
      leadPipeline,
      vehicleStatus,
    });
  } catch (error) {
    console.error('GET /api/dashboard/charts error:', error);
    return errorResponse('Internal server error');
  }
}
