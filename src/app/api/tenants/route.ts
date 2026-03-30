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

    // Validate slug format
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    const existing = await prisma.tenant.findUnique({ where: { slug: cleanSlug } });
    if (existing) {
      return errorResponse('Tenant with this slug already exists', 409);
    }

    // Check email uniqueness for owner user
    const ownerEmail = emailId || `${cleanSlug}@vaahan.app`;
    const existingUser = await prisma.user.findUnique({ where: { email: ownerEmail } });
    if (existingUser) {
      return errorResponse(`User with email "${ownerEmail}" already exists. Use a different email.`, 409);
    }

    // Create tenant with all business details
    const tenant = await prisma.tenant.create({
      data: {
        name: clientName,
        slug: cleanSlug,
        plan: plan || 'FREE',
        status: 'ACTIVE',
        dealershipType: showroomType || null,
        address: address || null,
        phone: phone || null,
        email: emailId || null,
        gst: gstNumber || null,
      },
    });

    // Create brands and locations for the tenant
    for (const brand of brands) {
      const createdBrand = await prisma.dealershipBrand.create({
        data: {
          tenantId: tenant.id,
          brandName: brand.brandName || 'Default Brand',
          brandType: brand.brandType || 'BIKE',
          logoUrl: brand.logoUrl || null,
        },
      });

      // Create locations for this brand
      if (brand.locations && brand.locations.length > 0) {
        for (const location of brand.locations) {
          // Handle both string and object formats
          const locName = typeof location === 'string' ? location : location.locationName;
          const locAddress = typeof location === 'string' ? (address || '') : (location.address || address || '');
          const locPhone = typeof location === 'string' ? null : (location.phone || null);
          const locManager = typeof location === 'string' ? null : (location.managerName || null);
          
          await prisma.showroomLocation.create({
            data: {
              tenantId: tenant.id,
              brandId: createdBrand.id,
              locationName: locName || 'Main Showroom',
              address: locAddress || null,
              phone: locPhone,
              managerName: locManager,
            },
          });
        }
      }
    }

    // Create default owner user
    const bcrypt = await import('bcryptjs');
    const ownerPassword = body.password || body.ownerPassword || `${cleanSlug}@2026`;
    const hashedPassword = await bcrypt.hash(ownerPassword, 10);
    
    await prisma.user.create({
      data: {
        tenantId: tenant.id,
        name: ownerName,
        email: ownerEmail,
        password: hashedPassword,
        phone: phone || null,
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
  } catch (error: any) {
    console.error('POST /api/tenants error:', error);
    
    // Prisma unique constraint errors
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return errorResponse(`Duplicate ${field}. This value already exists.`, 409);
    }
    
    // Prisma validation errors
    if (error.code === 'P2003') {
      return errorResponse(`Invalid reference: ${error.meta?.field_name || 'unknown field'}`, 400);
    }

    return errorResponse(error.message || 'Internal server error');
  }
}
