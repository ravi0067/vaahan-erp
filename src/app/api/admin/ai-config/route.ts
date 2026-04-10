/**
 * AI Configuration API — Save/Load system settings
 * Uses Prisma (reliable) instead of Supabase REST
 * GET  /api/admin/ai-config — Load all settings
 * POST /api/admin/ai-config — Save settings (upsert)
 * SUPER_ADMIN only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/api-auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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

    // Fetch all settings via Prisma
    const settings = await prisma.systemSetting.findMany();

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
    console.error('[AI-Config GET]', error);
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
    const errors: string[] = [];

    for (const [key, value] of Object.entries(settings)) {
      // Skip masked values (user didn't change them)
      if (typeof value === 'string' && value.includes('••••••••')) {
        continue;
      }

      const category = key.split('.')[0];
      const isSensitive = SENSITIVE_KEYS.includes(key);

      try {
        await prisma.systemSetting.upsert({
          where: { key },
          update: {
            value: String(value),
            category,
            encrypted: isSensitive,
            updatedBy: userId,
          },
          create: {
            key,
            value: String(value),
            category,
            encrypted: isSensitive,
            updatedBy: userId,
          },
        });
        savedCount++;
      } catch (err: any) {
        console.error(`[AI-Config] Failed to save key "${key}":`, err.message);
        errors.push(key);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        saved: savedCount,
        failed: errors.length,
        failedKeys: errors,
        error: `${errors.length} settings failed to save`,
      }, { status: 207 });
    }

    return NextResponse.json({
      success: true,
      saved: savedCount,
    });
  } catch (error: any) {
    console.error('[AI-Config POST]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
