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
    const dealHealth = searchParams.get('dealHealth');
    const assignedTo = searchParams.get('assignedTo');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = { tenantId };
    if (status && status !== 'all') where.status = status;
    if (dealHealth && dealHealth !== 'all') where.dealHealth = dealHealth;
    if (assignedTo) where.assignedToId = assignedTo;
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search } },
        { interestedModel: { contains: search, mode: 'insensitive' } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(serializeDecimals(leads));
  } catch (error) {
    console.error('GET /api/leads error:', error);
    return errorResponse('Internal server error');
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const body = await req.json();
    const { customerName, mobile, email, interestedModel, location, source, dealHealth, assignedToId, notes } = body;

    if (!customerName || !mobile) {
      return errorResponse('Customer name and mobile are required', 400);
    }

    const lead = await prisma.lead.create({
      data: {
        tenantId,
        customerName,
        mobile,
        email: email || null,
        interestedModel: interestedModel || null,
        location: location || null,
        source: source || null,
        dealHealth: dealHealth || 'WARM',
        status: 'NEW',
        assignedToId: assignedToId || session!.user.id,
        notes: notes || null,
      },
      include: { assignedTo: { select: { id: true, name: true } } },
    });

    return NextResponse.json(serializeDecimals(lead), { status: 201 });
  } catch (error) {
    console.error('POST /api/leads error:', error);
    return errorResponse('Internal server error');
  }
}
