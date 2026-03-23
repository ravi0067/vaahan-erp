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
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = { tenantId };
    if (status && status !== 'all') where.status = status;
    if (search) {
      where.OR = [
        { vehicleRegNo: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerMobile: { contains: search } },
      ];
    }

    const jobs = await prisma.jobCard.findMany({
      where,
      include: { mechanic: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(serializeDecimals(jobs));
  } catch (error) {
    console.error('GET /api/service/jobs error:', error);
    return errorResponse('Internal server error');
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const body = await req.json();
    const { vehicleRegNo, customerName, customerMobile, complaints, mechanicId, labourCharge, partsCharge, partsUsed } = body;

    if (!vehicleRegNo || !customerName || !customerMobile) {
      return errorResponse('Vehicle reg no, customer name, and mobile are required', 400);
    }

    const totalBilled = (labourCharge || 0) + (partsCharge || 0);

    const job = await prisma.jobCard.create({
      data: {
        tenantId,
        vehicleRegNo,
        customerName,
        customerMobile,
        complaints: complaints || null,
        mechanicId: mechanicId || null,
        labourCharge: labourCharge || 0,
        partsCharge: partsCharge || 0,
        totalBilled,
        totalReceived: 0,
        pendingAmount: totalBilled,
        partsUsed: partsUsed || null,
        status: 'OPEN',
      },
      include: { mechanic: { select: { id: true, name: true } } },
    });

    return NextResponse.json(serializeDecimals(job), { status: 201 });
  } catch (error) {
    console.error('POST /api/service/jobs error:', error);
    return errorResponse('Internal server error');
  }
}
