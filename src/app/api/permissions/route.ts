import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession, errorResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;

    const permissions = await prisma.permission.findMany({
      where: { tenantId },
      orderBy: [{ roleType: 'asc' }, { module: 'asc' }],
    });

    return NextResponse.json(permissions);
  } catch (error) {
    console.error('GET /api/permissions error:', error);
    return errorResponse('Internal server error');
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const userRole = session!.user.role;

    if (!['SUPER_ADMIN', 'OWNER'].includes(userRole)) {
      return errorResponse('Insufficient permissions', 403);
    }

    const body = await req.json();
    const { permissions } = body;

    if (!Array.isArray(permissions)) {
      return errorResponse('Permissions array is required', 400);
    }

    // Upsert each permission
    const results = await Promise.all(
      permissions.map((perm: { roleType: string; module: string; canView: boolean; canEdit: boolean; canDelete: boolean; canExport: boolean }) =>
        prisma.permission.upsert({
          where: {
            tenantId_roleType_module: {
              tenantId,
              roleType: perm.roleType as 'OWNER' | 'MANAGER' | 'SALES_EXEC' | 'ACCOUNTANT' | 'MECHANIC' | 'VIEWER',
              module: perm.module,
            },
          },
          update: {
            canView: perm.canView,
            canEdit: perm.canEdit,
            canDelete: perm.canDelete,
            canExport: perm.canExport,
          },
          create: {
            tenantId,
            roleType: perm.roleType as 'OWNER' | 'MANAGER' | 'SALES_EXEC' | 'ACCOUNTANT' | 'MECHANIC' | 'VIEWER',
            module: perm.module,
            canView: perm.canView,
            canEdit: perm.canEdit,
            canDelete: perm.canDelete,
            canExport: perm.canExport,
          },
        })
      )
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('PUT /api/permissions error:', error);
    return errorResponse('Internal server error');
  }
}
