import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession, serializeDecimals, errorResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const job = await prisma.jobCard.findFirst({
      where: { id: params.id, tenantId: session!.user.tenantId },
      include: { mechanic: { select: { id: true, name: true } } },
    });

    if (!job) return errorResponse('Job card not found', 404);
    return NextResponse.json(serializeDecimals(job));
  } catch (error) {
    console.error('GET /api/service/jobs/[id] error:', error);
    return errorResponse('Internal server error');
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const existing = await prisma.jobCard.findFirst({ where: { id: params.id, tenantId } });
    if (!existing) return errorResponse('Job card not found', 404);

    const body = await req.json();

    // Recalculate totals if charges updated
    if (body.labourCharge !== undefined || body.partsCharge !== undefined) {
      const labour = body.labourCharge ?? Number(existing.labourCharge);
      const parts = body.partsCharge ?? Number(existing.partsCharge);
      body.totalBilled = labour + parts;
      body.pendingAmount = body.totalBilled - Number(existing.totalReceived);
    }

    const job = await prisma.jobCard.update({
      where: { id: params.id },
      data: body,
      include: { mechanic: { select: { id: true, name: true } } },
    });

    return NextResponse.json(serializeDecimals(job));
  } catch (error) {
    console.error('PUT /api/service/jobs/[id] error:', error);
    return errorResponse('Internal server error');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const existing = await prisma.jobCard.findFirst({ where: { id: params.id, tenantId } });
    if (!existing) return errorResponse('Job card not found', 404);

    await prisma.jobCard.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/service/jobs/[id] error:', error);
    return errorResponse('Internal server error');
  }
}
