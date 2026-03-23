import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession, errorResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;

    const users = await prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('GET /api/users error:', error);
    return errorResponse('Internal server error');
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const userRole = session!.user.role;

    if (!['SUPER_ADMIN', 'OWNER', 'MANAGER'].includes(userRole)) {
      return errorResponse('Insufficient permissions', 403);
    }

    const body = await req.json();
    const { name, email, password, phone, role } = body;

    if (!name || !email || !password) {
      return errorResponse('Name, email, and password are required', 400);
    }

    // Check email uniqueness
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return errorResponse('A user with this email already exists', 409);
    }

    const user = await prisma.user.create({
      data: {
        tenantId,
        name,
        email,
        password, // In production, hash this
        phone: phone || null,
        role: role || 'VIEWER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('POST /api/users error:', error);
    return errorResponse('Internal server error');
  }
}
