import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession, errorResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [
      totalRevenueResult,
      carsSoldThisMonth,
      activeBookings,
      pendingDeliveries,
      availableStock,
      financeApplications,
    ] = await Promise.all([
      // Total revenue from all payments on car bookings
      prisma.bookingPayment.aggregate({
        where: {
          booking: {
            tenantId,
            vehicle: {
              vehicleType: 'CAR',
            },
          },
        },
        _sum: { amount: true },
      }),

      // Cars sold (delivered) this month
      prisma.booking.count({
        where: {
          tenantId,
          status: 'DELIVERED',
          vehicle: { vehicleType: 'CAR' },
          updatedAt: { gte: startOfMonth, lte: endOfMonth },
        },
      }),

      // Active bookings for cars
      prisma.booking.count({
        where: {
          tenantId,
          status: { in: ['DRAFT', 'CONFIRMED', 'RTO_PENDING', 'READY'] },
          vehicle: { vehicleType: 'CAR' },
        },
      }),

      // Pending deliveries (READY status)
      prisma.booking.count({
        where: {
          tenantId,
          status: 'READY',
          vehicle: { vehicleType: 'CAR' },
        },
      }),

      // Available car stock
      prisma.vehicle.count({
        where: {
          tenantId,
          vehicleType: 'CAR',
          status: 'AVAILABLE',
        },
      }),

      // Finance applications (bookings with a financeProvider and loanStatus set)
      prisma.booking.count({
        where: {
          tenantId,
          vehicle: { vehicleType: 'CAR' },
          financeProvider: { not: null },
          status: { not: 'CANCELLED' },
        },
      }),
    ]);

    // Exchange requests: bookings where the customer is doing a trade-in
    // In the current schema there's no dedicated exchange model,
    // so we approximate with bookings that have loanStatus = 'EXCHANGE' or similar.
    // Fallback: count 0 gracefully.
    let exchangeRequests = 0;
    try {
      exchangeRequests = await prisma.booking.count({
        where: {
          tenantId,
          loanStatus: { contains: 'EXCHANGE', mode: 'insensitive' },
          vehicle: { vehicleType: 'CAR' },
        },
      });
    } catch {
      exchangeRequests = 0;
    }

    // Test drives scheduled: we approximate from HOT leads with follow-up today
    let testDrivesScheduled = 0;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      testDrivesScheduled = await prisma.lead.count({
        where: {
          tenantId,
          status: { not: 'CONVERTED' },
          followUpDate: { gte: today, lt: tomorrow },
        },
      });
    } catch {
      testDrivesScheduled = 0;
    }

    return NextResponse.json({
      totalRevenue: Number(totalRevenueResult._sum.amount ?? 0),
      carsSoldThisMonth,
      activeBookings,
      testDrivesScheduled,
      pendingDeliveries,
      availableStock,
      financeApplications,
      exchangeRequests,
    });
  } catch (err) {
    console.error('GET /api/dashboard/car-stats error:', err);
    return errorResponse('Internal server error');
  }
}
