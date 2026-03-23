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
    const month = searchParams.get('month');
    const category = searchParams.get('category');
    const department = searchParams.get('department');

    const where: Record<string, unknown> = { tenantId };
    if (category && category !== 'all') where.category = category;
    if (department && department !== 'all') where.department = department;
    if (month) {
      const [y, m] = month.split('-').map(Number);
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 1);
      where.date = { gte: start, lt: end };
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: { approvedBy: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(serializeDecimals(expenses));
  } catch (error) {
    console.error('GET /api/expenses error:', error);
    return errorResponse('Internal server error');
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const body = await req.json();
    const { amount, category, description, department, location, receiptUrl } = body;

    if (!amount || amount <= 0 || !category) {
      return errorResponse('Positive amount and category are required', 400);
    }

    // Check budget limit
    const now = new Date();
    const budget = await prisma.expenseBudget.findFirst({
      where: {
        tenantId,
        category,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        ...(department ? { department } : {}),
      },
    });

    if (budget) {
      const totalSpent = await prisma.expense.aggregate({
        where: {
          tenantId,
          category,
          date: {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
            lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
          },
        },
        _sum: { amount: true },
      });

      const spent = Number(totalSpent._sum.amount || 0);
      if (spent + amount > Number(budget.monthlyLimit)) {
        return errorResponse(`Budget limit exceeded! Spent: ₹${spent}, Limit: ₹${Number(budget.monthlyLimit)}, Trying to add: ₹${amount}`, 400);
      }
    }

    const expense = await prisma.expense.create({
      data: {
        tenantId,
        amount,
        category,
        description: description || null,
        department: department || null,
        location: location || null,
        receiptUrl: receiptUrl || null,
        approvedById: session!.user.id,
      },
      include: { approvedBy: { select: { id: true, name: true } } },
    });

    return NextResponse.json(serializeDecimals(expense), { status: 201 });
  } catch (error) {
    console.error('POST /api/expenses error:', error);
    return errorResponse('Internal server error');
  }
}
