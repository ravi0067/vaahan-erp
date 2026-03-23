import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession, errorResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalRevenue,
      todaySales,
      activeBookings,
      hotLeads,
      pendingDeliveries,
      todayDaybook,
      totalVehicles,
      availableVehicles,
      totalCustomers,
      totalLeads,
    ] = await Promise.all([
      prisma.bookingPayment.aggregate({
        where: { booking: { tenantId } },
        _sum: { amount: true },
      }),
      prisma.booking.count({
        where: { tenantId, status: 'DELIVERED', updatedAt: { gte: today, lt: tomorrow } },
      }),
      prisma.booking.count({
        where: { tenantId, status: { in: ['DRAFT', 'CONFIRMED', 'RTO_PENDING', 'READY'] } },
      }),
      prisma.lead.count({
        where: { tenantId, dealHealth: 'HOT', status: { not: 'CONVERTED' } },
      }),
      prisma.booking.count({
        where: { tenantId, status: 'READY' },
      }),
      prisma.daybookEntry.findFirst({
        where: { tenantId, date: { gte: today, lt: tomorrow } },
      }),
      prisma.vehicle.count({ where: { tenantId } }),
      prisma.vehicle.count({ where: { tenantId, status: 'AVAILABLE' } }),
      prisma.customer.count({ where: { tenantId } }),
      prisma.lead.count({ where: { tenantId } }),
    ]);

    return NextResponse.json({
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      todaySales,
      activeBookings,
      hotLeads,
      pendingDeliveries,
      cashInHand: todayDaybook ? Number(todayDaybook.closingBalance) : 0,
      totalVehicles,
      availableVehicles,
      totalCustomers,
      totalLeads,
    });
  } catch (error) {
    console.error('GET /api/dashboard/stats error:', error);
    return errorResponse('Internal server error');
  }
}
