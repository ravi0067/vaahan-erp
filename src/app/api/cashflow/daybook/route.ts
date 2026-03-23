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
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const date = new Date(dateStr + 'T00:00:00.000Z');

    let daybook = await prisma.daybookEntry.findUnique({
      where: { tenantId_date: { tenantId, date } },
      include: {
        transactions: { orderBy: { createdAt: 'desc' } },
        lockedBy: { select: { id: true, name: true } },
      },
    });

    if (!daybook) {
      // Get previous day's closing balance as today's opening
      const prevDaybook = await prisma.daybookEntry.findFirst({
        where: { tenantId, date: { lt: date } },
        orderBy: { date: 'desc' },
      });

      const openingBalance = prevDaybook ? Number(prevDaybook.closingBalance) : 0;

      daybook = await prisma.daybookEntry.create({
        data: {
          tenantId,
          date,
          openingBalance,
          closingBalance: openingBalance,
          physicalCash: 0,
          difference: 0 - openingBalance,
        },
        include: {
          transactions: { orderBy: { createdAt: 'desc' } },
          lockedBy: { select: { id: true, name: true } },
        },
      });
    }

    return NextResponse.json(serializeDecimals(daybook));
  } catch (error) {
    console.error('GET /api/cashflow/daybook error:', error);
    return errorResponse('Internal server error');
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const body = await req.json();
    const { date, physicalCash } = body;

    if (!date) return errorResponse('Date is required', 400);

    const dateObj = new Date(date + 'T00:00:00.000Z');

    const daybook = await prisma.daybookEntry.upsert({
      where: { tenantId_date: { tenantId, date: dateObj } },
      update: {
        physicalCash: physicalCash || 0,
        difference: (physicalCash || 0) - Number((await prisma.daybookEntry.findUnique({ where: { tenantId_date: { tenantId, date: dateObj } } }))?.closingBalance || 0),
      },
      create: {
        tenantId,
        date: dateObj,
        openingBalance: 0,
        closingBalance: 0,
        physicalCash: physicalCash || 0,
        difference: physicalCash || 0,
      },
      include: {
        transactions: { orderBy: { createdAt: 'desc' } },
        lockedBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(serializeDecimals(daybook));
  } catch (error) {
    console.error('POST /api/cashflow/daybook error:', error);
    return errorResponse('Internal server error');
  }
}
