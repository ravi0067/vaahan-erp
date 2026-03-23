import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession, serializeDecimals, errorResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const lead = await prisma.lead.findFirst({
      where: { id: params.id, tenantId: session!.user.tenantId },
      include: { assignedTo: { select: { id: true, name: true } } },
    });

    if (!lead) return errorResponse('Lead not found', 404);
    return NextResponse.json(serializeDecimals(lead));
  } catch (error) {
    console.error('GET /api/leads/[id] error:', error);
    return errorResponse('Internal server error');
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const existing = await prisma.lead.findFirst({ where: { id: params.id, tenantId } });
    if (!existing) return errorResponse('Lead not found', 404);

    const body = await req.json();
    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: body,
      include: { assignedTo: { select: { id: true, name: true } } },
    });

    return NextResponse.json(serializeDecimals(lead));
  } catch (error) {
    console.error('PUT /api/leads/[id] error:', error);
    return errorResponse('Internal server error');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const existing = await prisma.lead.findFirst({ where: { id: params.id, tenantId } });
    if (!existing) return errorResponse('Lead not found', 404);

    await prisma.lead.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/leads/[id] error:', error);
    return errorResponse('Internal server error');
  }
}
