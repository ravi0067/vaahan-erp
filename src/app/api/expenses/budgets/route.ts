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
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : new Date().getMonth() + 1;
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();

    const budgets = await prisma.expenseBudget.findMany({
      where: { tenantId, month, year },
    });

    return NextResponse.json(serializeDecimals(budgets));
  } catch (error) {
    console.error('GET /api/expenses/budgets error:', error);
    return errorResponse('Internal server error');
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const body = await req.json();
    const { category, department, monthlyLimit, month, year } = body;

    if (!category || !monthlyLimit || !month || !year) {
      return errorResponse('Category, monthly limit, month, and year are required', 400);
    }

    const budget = await prisma.expenseBudget.upsert({
      where: {
        tenantId_category_department_month_year: {
          tenantId,
          category,
          department: department || '',
          month,
          year,
        },
      },
      update: { monthlyLimit },
      create: {
        tenantId,
        category,
        department: department || '',
        monthlyLimit,
        month,
        year,
      },
    });

    return NextResponse.json(serializeDecimals(budget), { status: 201 });
  } catch (error) {
    console.error('POST /api/expenses/budgets error:', error);
    return errorResponse('Internal server error');
  }
}
