/**
 * AI Configuration API — Save/Load system settings
 * Uses Supabase REST API (not Prisma) to avoid serverless connection issues
 * GET  /api/admin/ai-config — Load all settings
 * POST /api/admin/ai-config — Save settings (upsert)
 * SUPER_ADMIN only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function supabaseHeaders() {
  return {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };
}

// Keys that should be masked in GET response
const SENSITIVE_KEYS = [
  'ai.apiKey.gemini', 'ai.apiKey.openai', 'ai.apiKey.claude',
  'exotel.apiKey', 'exotel.apiToken',
  'smtp.password',
  'sms.apiKey',
  'github.token',
  'vercel.token',
  'payment.keySecret',
  'vaani.elevenLabsKey',
];

function maskValue(value: string): string {
  if (!value || value.length < 8) return '••••••••';
  return value.substring(0, 4) + '••••••••' + value.substring(value.length - 4);
}

export async function GET(request: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;
    if (session!.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super Admin only' }, { status: 403 });
    }

    // Fetch all settings via Supabase REST
    const res = await fetch(`${SUPABASE_URL}/rest/v1/SystemSetting?select=*`, {
      headers: supabaseHeaders(),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `DB error: ${errText}` }, { status: 500 });
    }

    const settings: { id: string; key: string; value: string; encrypted: boolean; category: string; updatedAt: string }[] = await res.json();

    // Group by category and mask sensitive values
    const grouped: Record<string, Record<string, any>> = {};

    for (const setting of settings) {
      const category = setting.category || setting.key.split('.')[0];
      if (!grouped[category]) grouped[category] = {};

      const isSensitive = SENSITIVE_KEYS.includes(setting.key);
      grouped[category][setting.key] = {
        value: isSensitive ? maskValue(setting.value) : setting.value,
        hasValue: !!setting.value,
        encrypted: setting.encrypted,
        updatedAt: setting.updatedAt,
      };
    }

    return NextResponse.json({
      success: true,
      settings: grouped,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;
    if (session!.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { settings } = body as { settings: Record<string, string> };

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings object' }, { status: 400 });
    }

    const userId = session!.user.id;
    let savedCount = 0;

    for (const [key, value] of Object.entries(settings)) {
      // Skip masked values (user didn't change them)
      if (typeof value === 'string' && value.includes('••••••••')) {
        continue;
      }

      const category = key.split('.')[0];
      const isSensitive = SENSITIVE_KEYS.includes(key);
      const now = new Date().toISOString();

      // Check if key exists
      const checkRes = await fetch(
        `${SUPABASE_URL}/rest/v1/SystemSetting?key=eq.${encodeURIComponent(key)}&select=id`,
        { headers: supabaseHeaders() }
      );
      const existing = await checkRes.json();

      if (existing && existing.length > 0) {
        // Update
        await fetch(
          `${SUPABASE_URL}/rest/v1/SystemSetting?key=eq.${encodeURIComponent(key)}`,
          {
            method: 'PATCH',
            headers: supabaseHeaders(),
            body: JSON.stringify({
              value: String(value),
              category,
              encrypted: isSensitive,
              updatedBy: userId,
              updatedAt: now,
            }),
          }
        );
      } else {
        // Insert
        await fetch(
          `${SUPABASE_URL}/rest/v1/SystemSetting`,
          {
            method: 'POST',
            headers: supabaseHeaders(),
            body: JSON.stringify({
              key,
              value: String(value),
              category,
              encrypted: isSensitive,
              updatedBy: userId,
              updatedAt: now,
            }),
          }
        );
      }

      savedCount++;
    }

    return NextResponse.json({
      success: true,
      saved: savedCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
