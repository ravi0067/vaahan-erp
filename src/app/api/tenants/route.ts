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
    const { 
      clientName, slug, plan, gstNumber, emailId, address, 
      firmName, ownerName, phone, showroomType, currentFY, 
      logoUrl, brands 
    } = body;

    if (!clientName || !slug || !ownerName) {
      return errorResponse('Client name, slug, and owner name are required', 400);
    }

    if (!brands || brands.length === 0) {
      return errorResponse('At least one brand is required', 400);
    }

    const existing = await prisma.tenant.findUnique({ where: { slug } });
    if (existing) {
      return errorResponse('Tenant with this slug already exists', 409);
    }

    // Create tenant with all business details
    const tenant = await prisma.tenant.create({
      data: {
        name: clientName,
        slug,
        plan: plan || 'FREE',
        status: 'ACTIVE',
        dealershipType: showroomType,
        address,
        phone,
        email: emailId,
        gst: gstNumber,
        // Store additional business info as metadata
      },
    });

    // Create brands and locations for the tenant
    for (const brand of brands) {
      const createdBrand = await prisma.dealershipBrand.create({
        data: {
          tenantId: tenant.id,
          brandName: brand.brandName,
          brandType: brand.brandType,
          logoUrl: brand.logoUrl || null,
        },
      });

      // Create locations for this brand
      if (brand.locations && brand.locations.length > 0) {
        await prisma.showroomLocation.createMany({
          data: brand.locations.map((location) => ({
            tenantId: tenant.id,
            brandId: createdBrand.id,
            locationName: location.locationName,
            address: location.address,
            phone: location.phone || null,
            managerName: location.managerName || null,
          })),
        });
      }
    }

    // Create default owner user
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await prisma.user.create({
      data: {
        tenantId: tenant.id,
        name: ownerName,
        email: emailId || `${slug}@example.com`,
        password: hashedPassword,
        role: 'OWNER',
      },
    });

    // Fetch the complete tenant with brands and locations
    const completeTenant = await prisma.tenant.findUnique({
      where: { id: tenant.id },
      include: {
        dealershipBrands: {
          include: {
            showroomLocations: true,
            _count: { select: { vehicles: true } }
          }
        },
        _count: { select: { users: true, vehicles: true, bookings: true } }
      },
    });

    return NextResponse.json(serializeDecimals(completeTenant), { status: 201 });
  } catch (error) {
    console.error('POST /api/tenants error:', error);
    return errorResponse('Internal server error');
  }
}
