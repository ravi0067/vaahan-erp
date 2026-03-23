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
    const search = searchParams.get('search');

    const where: Record<string, unknown> = { tenantId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where: where as any,
      include: {
        bookings: {
          select: { id: true, bookingNumber: true, status: true, totalAmount: true, paidAmount: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(serializeDecimals(customers));
  } catch (error) {
    console.error('GET /api/customers error:', error);
    return errorResponse('Internal server error');
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const body = await req.json();
    const { name, mobile, email, address, aadharNo, panNo } = body;

    if (!name || !mobile) {
      return errorResponse('Name and mobile are required', 400);
    }

    const customer = await prisma.customer.create({
      data: {
        tenantId,
        name,
        mobile,
        email: email || null,
        address: address || null,
        aadharNo: aadharNo || null,
        panNo: panNo || null,
      },
    });

    return NextResponse.json(serializeDecimals(customer), { status: 201 });
  } catch (error) {
    console.error('POST /api/customers error:', error);
    return errorResponse('Internal server error');
  }
}
