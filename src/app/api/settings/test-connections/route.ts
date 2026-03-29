/**
 * API: Test all service connections
 * GET /api/settings/test-connections
 * Returns status of all configured services
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;
    if (session!.user.role !== 'SUPER_ADMIN' && session!.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    const results: Record<string, { configured: boolean; connected: boolean; latency?: number; error?: string }> = {};

    // 1. Database
    const dbStart = Date.now();
    try {
      const prisma = (await import('@/lib/prisma')).default;
      await prisma.tenant.count();
      results.database = { configured: true, connected: true, latency: Date.now() - dbStart };
    } catch (e: any) {
      results.database = { configured: !!process.env.DATABASE_URL, connected: false, error: e.message };
    }

    // 2. Gemini AI
    const aiStart = Date.now();
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
        results.gemini = { configured: true, connected: res.ok, latency: Date.now() - aiStart };
        if (!res.ok) results.gemini.error = `HTTP ${res.status}`;
      } catch (e: any) {
        results.gemini = { configured: true, connected: false, error: e.message };
      }
    } else {
      results.gemini = { configured: false, connected: false, error: 'API key missing' };
    }

    // 3. Exotel (Calling + WhatsApp)
    const exStart = Date.now();
    const exSid = process.env.EXOTEL_ACCOUNT_SID;
    const exKey = process.env.EXOTEL_API_KEY;
    const exToken = process.env.EXOTEL_API_TOKEN;
    if (exSid && exKey && exToken) {
      try {
        const basicAuth = Buffer.from(`${exKey}:${exToken}`).toString('base64');
        const res = await fetch(`https://api.exotel.com/v1/Accounts/${exSid}`, {
          headers: { 'Authorization': `Basic ${basicAuth}` }
        });
        results.exotel = { configured: true, connected: res.ok, latency: Date.now() - exStart };
        if (!res.ok) results.exotel.error = `HTTP ${res.status}`;
      } catch (e: any) {
        results.exotel = { configured: true, connected: false, error: e.message };
      }
    } else {
      results.exotel = { configured: false, connected: false, error: 'Credentials missing' };
    }

    // 4. GitHub
    const ghStart = Date.now();
    const ghToken = process.env.GITHUB_TOKEN;
    if (ghToken) {
      try {
        const res = await fetch('https://api.github.com/user', {
          headers: { 'Authorization': `token ${ghToken}` }
        });
        results.github = { configured: true, connected: res.ok, latency: Date.now() - ghStart };
      } catch (e: any) {
        results.github = { configured: true, connected: false, error: e.message };
      }
    } else {
      results.github = { configured: false, connected: false };
    }

    // 5. Vercel
    const vcStart = Date.now();
    const vcToken = process.env.VERCEL_TOKEN;
    if (vcToken) {
      try {
        const res = await fetch('https://api.vercel.com/v2/user', {
          headers: { 'Authorization': `Bearer ${vcToken}` }
        });
        results.vercel = { configured: true, connected: res.ok, latency: Date.now() - vcStart };
      } catch (e: any) {
        results.vercel = { configured: true, connected: false, error: e.message };
      }
    } else {
      results.vercel = { configured: false, connected: false };
    }

    // 6. SMTP Email
    results.email = {
      configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
      connected: false,
      error: process.env.SMTP_HOST ? undefined : 'SMTP not configured'
    };

    // Summary
    const totalServices = Object.keys(results).length;
    const connectedCount = Object.values(results).filter(r => r.connected).length;
    const configuredCount = Object.values(results).filter(r => r.configured).length;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        total: totalServices,
        configured: configuredCount,
        connected: connectedCount,
        healthy: connectedCount === configuredCount
      },
      services: results
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
