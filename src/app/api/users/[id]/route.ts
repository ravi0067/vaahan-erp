import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession, errorResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const user = await prisma.user.findFirst({
      where: { id: params.id, tenantId: session!.user.tenantId },
      select: {
        id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true,
      },
    });

    if (!user) return errorResponse('User not found', 404);
    return NextResponse.json(user);
  } catch (error) {
    console.error('GET /api/users/[id] error:', error);
    return errorResponse('Internal server error');
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const existing = await prisma.user.findFirst({ where: { id: params.id, tenantId } });
    if (!existing) return errorResponse('User not found', 404);

    const body = await req.json();
    // Don't allow changing tenantId
    delete body.tenantId;

    const user = await prisma.user.update({
      where: { id: params.id },
      data: body,
      select: {
        id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('PUT /api/users/[id] error:', error);
    return errorResponse('Internal server error');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const existing = await prisma.user.findFirst({ where: { id: params.id, tenantId } });
    if (!existing) return errorResponse('User not found', 404);

    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/users/[id] error:', error);
    return errorResponse('Internal server error');
  }
}
