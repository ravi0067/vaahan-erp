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
    const daybookEntryId = searchParams.get('daybookEntryId');
    const date = searchParams.get('date');

    const where: Record<string, unknown> = { tenantId };
    if (daybookEntryId) where.daybookEntryId = daybookEntryId;
    if (date) {
      const dateObj = new Date(date + 'T00:00:00.000Z');
      const nextDay = new Date(dateObj);
      nextDay.setDate(nextDay.getDate() + 1);
      where.createdAt = { gte: dateObj, lt: nextDay };
    }

    const transactions = await prisma.cashTransaction.findMany({
      where: where as any,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(serializeDecimals(transactions));
  } catch (error) {
    console.error('GET /api/cashflow/transactions error:', error);
    return errorResponse('Internal server error');
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const body = await req.json();
    const { type, category, description, amount, mode, reference, date } = body;

    if (!type || !category || !amount || amount <= 0) {
      return errorResponse('Type, category, and positive amount are required', 400);
    }

    const dateStr = date || new Date().toISOString().split('T')[0];
    const dateObj = new Date(dateStr + 'T00:00:00.000Z');

    // Find or create daybook entry
    let daybook = await prisma.daybookEntry.findUnique({
      where: { tenantId_date: { tenantId, date: dateObj } },
    });

    if (daybook?.isLocked) {
      return errorResponse('Cannot add transaction: daybook is locked for this date', 400);
    }

    if (!daybook) {
      const prevDaybook = await prisma.daybookEntry.findFirst({
        where: { tenantId, date: { lt: dateObj } },
        orderBy: { date: 'desc' },
      });
      const openingBalance = prevDaybook ? Number(prevDaybook.closingBalance) : 0;

      daybook = await prisma.daybookEntry.create({
        data: {
          tenantId,
          date: dateObj,
          openingBalance,
          closingBalance: openingBalance,
          physicalCash: 0,
          difference: 0 - openingBalance,
        },
      });
    }

    const transaction = await prisma.cashTransaction.create({
      data: {
        tenantId,
        daybookEntryId: daybook.id,
        type,
        category,
        description: description || null,
        amount,
        mode: mode || null,
        reference: reference || null,
      },
    });

    // Update daybook closing balance
    const delta = type === 'INFLOW' ? amount : -amount;
    const newClosing = Number(daybook.closingBalance) + delta;

    await prisma.daybookEntry.update({
      where: { id: daybook.id },
      data: {
        closingBalance: newClosing,
        difference: Number(daybook.physicalCash) - newClosing,
      },
    });

    return NextResponse.json(serializeDecimals(transaction), { status: 201 });
  } catch (error) {
    console.error('POST /api/cashflow/transactions error:', error);
    return errorResponse('Internal server error');
  }
}
