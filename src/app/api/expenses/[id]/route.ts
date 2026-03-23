import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession, serializeDecimals, errorResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const existing = await prisma.expense.findFirst({ where: { id: params.id, tenantId } });
    if (!existing) return errorResponse('Expense not found', 404);

    const body = await req.json();
    const expense = await prisma.expense.update({
      where: { id: params.id },
      data: body,
      include: { approvedBy: { select: { id: true, name: true } } },
    });

    return NextResponse.json(serializeDecimals(expense));
  } catch (error) {
    console.error('PUT /api/expenses/[id] error:', error);
    return errorResponse('Internal server error');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const existing = await prisma.expense.findFirst({ where: { id: params.id, tenantId } });
    if (!existing) return errorResponse('Expense not found', 404);

    await prisma.expense.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/expenses/[id] error:', error);
    return errorResponse('Internal server error');
  }
}
