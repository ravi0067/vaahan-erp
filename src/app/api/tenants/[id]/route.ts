import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession, serializeDecimals, errorResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    if (session!.user.role !== 'SUPER_ADMIN') {
      return errorResponse('Access denied', 403);
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: params.id },
      include: {
        users: { select: { id: true, name: true, email: true, role: true, isActive: true } },
        _count: { select: { vehicles: true, bookings: true, customers: true, leads: true } },
      },
    });

    if (!tenant) return errorResponse('Tenant not found', 404);
    return NextResponse.json(serializeDecimals(tenant));
  } catch (error) {
    console.error('GET /api/tenants/[id] error:', error);
    return errorResponse('Internal server error');
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    if (session!.user.role !== 'SUPER_ADMIN') {
      return errorResponse('Access denied', 403);
    }

    const body = await req.json();
    const tenant = await prisma.tenant.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json(serializeDecimals(tenant));
  } catch (error) {
    console.error('PUT /api/tenants/[id] error:', error);
    return errorResponse('Internal server error');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    if (session!.user.role !== 'SUPER_ADMIN') {
      return errorResponse('Access denied', 403);
    }

    await prisma.tenant.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/tenants/[id] error:', error);
    return errorResponse('Internal server error');
  }
}
