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
    const type = searchParams.get('type') || 'sales';
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const dateFilter: Record<string, unknown> = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);
    const hasDateFilter = Object.keys(dateFilter).length > 0;

    switch (type) {
      case 'sales': {
        const bookings = await prisma.booking.findMany({
          where: {
            tenantId,
            status: 'DELIVERED',
            ...(hasDateFilter ? { updatedAt: dateFilter } : {}),
          },
          include: { customer: true, vehicle: true, payments: true },
          orderBy: { updatedAt: 'desc' },
        });
        return NextResponse.json(serializeDecimals({ type, data: bookings }));
      }

      case 'revenue': {
        const payments = await prisma.bookingPayment.findMany({
          where: {
            booking: { tenantId },
            ...(hasDateFilter ? { date: dateFilter } : {}),
          },
          include: { booking: { include: { customer: true } } },
          orderBy: { date: 'desc' },
        });
        const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        return NextResponse.json(serializeDecimals({ type, data: payments, total }));
      }

      case 'leads': {
        const leads = await prisma.lead.findMany({
          where: {
            tenantId,
            ...(hasDateFilter ? { createdAt: dateFilter } : {}),
          },
          include: { assignedTo: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(serializeDecimals({ type, data: leads }));
      }

      case 'inventory': {
        const vehicles = await prisma.vehicle.findMany({
          where: { tenantId },
          orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(serializeDecimals({ type, data: vehicles }));
      }

      case 'expenses': {
        const expenses = await prisma.expense.findMany({
          where: {
            tenantId,
            ...(hasDateFilter ? { date: dateFilter } : {}),
          },
          orderBy: { date: 'desc' },
        });
        const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        return NextResponse.json(serializeDecimals({ type, data: expenses, total }));
      }

      case 'cashflow': {
        const daybooks = await prisma.daybookEntry.findMany({
          where: {
            tenantId,
            ...(hasDateFilter ? { date: dateFilter } : {}),
          },
          include: { transactions: true },
          orderBy: { date: 'desc' },
        });
        return NextResponse.json(serializeDecimals({ type, data: daybooks }));
      }

      case 'service': {
        const jobs = await prisma.jobCard.findMany({
          where: {
            tenantId,
            ...(hasDateFilter ? { createdAt: dateFilter } : {}),
          },
          include: { mechanic: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(serializeDecimals({ type, data: jobs }));
      }

      default:
        return errorResponse('Invalid report type', 400);
    }
  } catch (error) {
    console.error('GET /api/reports error:', error);
    return errorResponse('Internal server error');
  }
}
