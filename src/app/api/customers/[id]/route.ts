import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession, serializeDecimals, errorResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const customer = await prisma.customer.findFirst({
      where: { id: params.id, tenantId: session!.user.tenantId },
      include: {
        bookings: {
          include: {
            vehicle: true,
            payments: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) return errorResponse('Customer not found', 404);
    return NextResponse.json(serializeDecimals(customer));
  } catch (error) {
    console.error('GET /api/customers/[id] error:', error);
    return errorResponse('Internal server error');
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const existing = await prisma.customer.findFirst({ where: { id: params.id, tenantId } });
    if (!existing) return errorResponse('Customer not found', 404);

    const body = await req.json();
    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json(serializeDecimals(customer));
  } catch (error) {
    console.error('PUT /api/customers/[id] error:', error);
    return errorResponse('Internal server error');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const existing = await prisma.customer.findFirst({ where: { id: params.id, tenantId } });
    if (!existing) return errorResponse('Customer not found', 404);

    await prisma.customer.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/customers/[id] error:', error);
    return errorResponse('Internal server error');
  }
}
