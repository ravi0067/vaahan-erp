import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession, serializeDecimals, errorResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    if (session!.user.role !== 'SUPER_ADMIN') {
      return errorResponse('Access denied. Super Admin only.', 403);
    }

    const tenants = await prisma.tenant.findMany({
      include: {
        _count: { select: { users: true, vehicles: true, bookings: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(serializeDecimals(tenants));
  } catch (error) {
    console.error('GET /api/tenants error:', error);
    return errorResponse('Internal server error');
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    if (session!.user.role !== 'SUPER_ADMIN') {
      return errorResponse('Access denied. Super Admin only.', 403);
    }

    const body = await req.json();
    const { name, slug, plan } = body;

    if (!name || !slug) {
      return errorResponse('Name and slug are required', 400);
    }

    const existing = await prisma.tenant.findUnique({ where: { slug } });
    if (existing) {
      return errorResponse('Tenant with this slug already exists', 409);
    }

    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        plan: plan || 'FREE',
        status: 'ACTIVE',
      },
    });

    return NextResponse.json(serializeDecimals(tenant), { status: 201 });
  } catch (error) {
    console.error('POST /api/tenants error:', error);
    return errorResponse('Internal server error');
  }
}
