import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession, serializeDecimals, errorResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const tenantId = session!.user.tenantId;
    const lead = await prisma.lead.findFirst({
      where: { id: params.id, tenantId },
    });

    if (!lead) return errorResponse('Lead not found', 404);
    if (lead.status === 'CONVERTED') return errorResponse('Lead already converted', 400);

    const body = await req.json().catch(() => ({}));

    // Create or find customer
    let customer = await prisma.customer.findFirst({
      where: { mobile: lead.mobile, tenantId },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          tenantId,
          name: lead.customerName,
          mobile: lead.mobile,
          email: lead.email || null,
          address: lead.location || null,
        },
      });
    }

    // Auto-generate booking number
    const year = new Date().getFullYear();
    const count = await prisma.booking.count({ where: { tenantId } });
    const bookingNumber = `VHN-${year}-${String(count + 1).padStart(3, '0')}`;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        tenantId,
        bookingNumber,
        customerId: customer.id,
        vehicleId: body.vehicleId || null,
        salesExecId: lead.assignedToId || session!.user.id,
        status: 'DRAFT',
        step: 1,
        totalAmount: body.totalAmount || 0,
        paidAmount: 0,
        pendingAmount: body.totalAmount || 0,
      },
      include: { customer: true, vehicle: true },
    });

    // Update lead status
    await prisma.lead.update({
      where: { id: params.id },
      data: {
        status: 'CONVERTED',
        convertedToBookingId: booking.id,
      },
    });

    return NextResponse.json(serializeDecimals({ booking, customer }), { status: 201 });
  } catch (error) {
    console.error('POST /api/leads/[id]/convert error:', error);
    return errorResponse('Internal server error');
  }
}
