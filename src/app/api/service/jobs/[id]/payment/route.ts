import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession, serializeDecimals, errorResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const job = await prisma.jobCard.findFirst({ where: { id: params.id, tenantId } });
    if (!job) return errorResponse('Job card not found', 404);

    const body = await req.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return errorResponse('Amount must be a positive number', 400);
    }

    const newReceived = Number(job.totalReceived) + amount;
    const newPending = Number(job.totalBilled) - newReceived;

    const updated = await prisma.jobCard.update({
      where: { id: params.id },
      data: {
        totalReceived: newReceived,
        pendingAmount: Math.max(0, newPending),
        status: newPending <= 0 ? 'INVOICED' : job.status,
      },
      include: { mechanic: { select: { id: true, name: true } } },
    });

    return NextResponse.json(serializeDecimals(updated));
  } catch (error) {
    console.error('POST /api/service/jobs/[id]/payment error:', error);
    return errorResponse('Internal server error');
  }
}
