/**
 * AI Configuration API — Save/Load system settings from DB
 * GET  /api/admin/ai-config — Load all settings
 * POST /api/admin/ai-config — Save settings (upsert)
 * SUPER_ADMIN only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/api-auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Category groupings for frontend
const CATEGORIES: Record<string, string[]> = {
  ai: ['ai.provider', 'ai.model', 'ai.apiKey.gemini', 'ai.apiKey.openai', 'ai.apiKey.claude', 'ai.maxTokens', 'ai.temperature', 'ai.enabled'],
  exotel: ['exotel.apiKey', 'exotel.apiToken', 'exotel.accountSid', 'exotel.callerId', 'exotel.whatsappNumber', 'exotel.callingEnabled', 'exotel.whatsappEnabled'],
  smtp: ['smtp.host', 'smtp.port', 'smtp.username', 'smtp.password', 'smtp.fromName', 'smtp.fromEmail', 'smtp.enabled'],
  sms: ['sms.provider', 'sms.apiKey', 'sms.senderId', 'sms.enabled'],
  github: ['github.token', 'github.repo'],
  vercel: ['vercel.token', 'vercel.projectId'],
  payment: ['payment.provider', 'payment.keyId', 'payment.keySecret', 'payment.testMode', 'payment.webhookUrl'],
  vaani: ['vaani.voiceEnabled', 'vaani.language', 'vaani.personality', 'vaani.welcomeMessage', 'vaani.autoGreet', 'vaani.ttsProvider', 'vaani.elevenLabsKey'],
  automation: ['automation.dailyReport', 'automation.dailyReportTime', 'automation.followupReminder', 'automation.insuranceCheck', 'automation.daybookCheck', 'automation.weeklyReport', 'automation.monthlyReport', 'automation.reportChannel'],
};

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

    const settings = await prisma.systemSetting.findMany();
    
    // Group by category and mask sensitive values
    const grouped: Record<string, Record<string, any>> = {};
    const raw: Record<string, string> = {};
    
    for (const setting of settings) {
      raw[setting.key] = setting.value;
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
      categories: Object.keys(CATEGORIES),
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
    const results: { key: string; status: string }[] = [];

    for (const [key, value] of Object.entries(settings)) {
      // Skip masked values (user didn't change them)
      if (typeof value === 'string' && value.includes('••••••••')) {
        continue;
      }
      
      const category = key.split('.')[0];
      const isSensitive = SENSITIVE_KEYS.includes(key);

      await prisma.systemSetting.upsert({
        where: { key },
        create: {
          key,
          value: String(value),
          category,
          encrypted: isSensitive,
          updatedBy: userId,
        },
        update: {
          value: String(value),
          category,
          encrypted: isSensitive,
          updatedBy: userId,
        },
      });

      results.push({ key, status: 'saved' });
    }

    return NextResponse.json({
      success: true,
      saved: results.length,
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
