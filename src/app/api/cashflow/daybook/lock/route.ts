import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession, serializeDecimals, errorResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const body = await req.json();
    const { date } = body;

    if (!date) return errorResponse('Date is required', 400);

    const dateObj = new Date(date + 'T00:00:00.000Z');

    const daybook = await prisma.daybookEntry.findUnique({
      where: { tenantId_date: { tenantId, date: dateObj } },
    });

    if (!daybook) return errorResponse('Daybook entry not found', 404);
    if (daybook.isLocked) return errorResponse('Daybook is already locked', 400);

    // Validate difference is 0
    if (Number(daybook.difference) !== 0) {
      return errorResponse('Cannot lock daybook: physical cash does not match closing balance', 400);
    }

    const locked = await prisma.daybookEntry.update({
      where: { tenantId_date: { tenantId, date: dateObj } },
      data: {
        isLocked: true,
        lockedById: session!.user.id,
        lockedAt: new Date(),
      },
      include: {
        transactions: { orderBy: { createdAt: 'desc' } },
        lockedBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(serializeDecimals(locked));
  } catch (error) {
    console.error('POST /api/cashflow/daybook/lock error:', error);
    return errorResponse('Internal server error');
  }
}
