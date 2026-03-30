import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again after some time.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      clientName,
      ownerName,
      email,
      password,
      phone,
      firmName,
      gstNumber,
      address,
      showroomType,
      brandName,
      brandType,
      locationName,
    } = body;

    // Validate required fields
    if (!clientName || !clientName.trim()) {
      return NextResponse.json({ error: 'Dealership name is required' }, { status: 400 });
    }
    if (!ownerName || !ownerName.trim()) {
      return NextResponse.json({ error: 'Owner name is required' }, { status: 400 });
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check email uniqueness
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please login or use a different email.' },
        { status: 409 }
      );
    }

    // Generate slug from clientName
    const baseSlug = clientName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Check slug uniqueness, append random if needed
    let slug = baseSlug;
    const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
    if (existingTenant) {
      slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: clientName.trim(),
        slug,
        plan: 'FREE',
        status: 'ACTIVE',
        dealershipType: showroomType || null,
        address: address || null,
        phone: phone || null,
        email: email.toLowerCase().trim(),
        gst: gstNumber || null,
      },
    });

    // Create Brand (default if not provided)
    const brand = await prisma.dealershipBrand.create({
      data: {
        tenantId: tenant.id,
        brandName: brandName || clientName.trim(),
        brandType: brandType || showroomType || 'BIKE',
        logoUrl: null,
      },
    });

    // Create Location
    await prisma.showroomLocation.create({
      data: {
        tenantId: tenant.id,
        brandId: brand.id,
        locationName: locationName || 'Main Showroom',
        address: address || null,
        phone: phone || null,
        managerName: ownerName.trim(),
      },
    });

    // Create Owner user
    await prisma.user.create({
      data: {
        tenantId: tenant.id,
        name: ownerName.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone || null,
        role: 'OWNER',
      },
    });

    // Log registration for admin notification
    try {
      await prisma.communicationLog.create({
        data: {
          tenantId: tenant.id,
          type: 'EMAIL',
          direction: 'INBOUND',
          contactName: ownerName.trim(),
          contactNumber: phone || email.toLowerCase().trim(),
          subject: `🆕 New Client Registration: ${clientName.trim()}`,
          content: `New client registered:\n• Dealership: ${clientName.trim()}\n• Owner: ${ownerName.trim()}\n• Email: ${email.toLowerCase().trim()}\n• Phone: ${phone || 'N/A'}\n• Firm: ${firmName || 'N/A'}\n• GST: ${gstNumber || 'N/A'}\n• Type: ${showroomType || 'BIKE'}`,
          status: 'DELIVERED',
        },
      });
    } catch {
      // Non-critical — don't fail registration if logging fails
    }

    return NextResponse.json(
      {
        success: true,
        tenantId: tenant.id,
        ownerEmail: email.toLowerCase().trim(),
        slug,
        message: 'Registration successful! You can now login with your email and password.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/register error:', error);

    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return NextResponse.json(
        { error: `This ${field} is already taken. Please use a different value.` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Registration failed. Please try again later.' },
      { status: 500 }
    );
  }
}
