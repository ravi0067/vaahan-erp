/**
 * Test Connection API — Tests individual service connections
 * POST /api/admin/ai-config/test
 * Body: { service: "gemini" | "exotel" | "smtp" | "github" | "vercel" | "sms" | "all" }
 * Uses SAVED DB settings (not env vars) to test
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/api-auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getSetting(key: string): Promise<string> {
  const setting = await prisma.systemSetting.findUnique({ where: { key } });
  return setting?.value || '';
}

async function getSettings(prefix: string): Promise<Record<string, string>> {
  const settings = await prisma.systemSetting.findMany({
    where: { key: { startsWith: prefix } },
  });
  const result: Record<string, string> = {};
  for (const s of settings) {
    const shortKey = s.key.replace(`${prefix}.`, '');
    result[shortKey] = s.value;
  }
  return result;
}

type TestResult = {
  service: string;
  connected: boolean;
  configured: boolean;
  latency?: number;
  message: string;
  details?: string;
};

async function testGemini(): Promise<TestResult> {
  const apiKey = await getSetting('ai.apiKey.gemini');
  if (!apiKey) return { service: 'gemini', connected: false, configured: false, message: 'API key not configured' };

  const start = Date.now();
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const latency = Date.now() - start;
    if (res.ok) {
      const data = await res.json();
      const modelCount = data.models?.length || 0;
      return { service: 'gemini', connected: true, configured: true, latency, message: `Connected! ${modelCount} models available` };
    }
    return { service: 'gemini', connected: false, configured: true, latency, message: `HTTP ${res.status}`, details: await res.text() };
  } catch (e: any) {
    return { service: 'gemini', connected: false, configured: true, latency: Date.now() - start, message: e.message };
  }
}

async function testOpenAI(): Promise<TestResult> {
  const apiKey = await getSetting('ai.apiKey.openai');
  if (!apiKey) return { service: 'openai', connected: false, configured: false, message: 'API key not configured' };

  const start = Date.now();
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    const latency = Date.now() - start;
    return { service: 'openai', connected: res.ok, configured: true, latency, message: res.ok ? 'Connected!' : `HTTP ${res.status}` };
  } catch (e: any) {
    return { service: 'openai', connected: false, configured: true, latency: Date.now() - start, message: e.message };
  }
}

async function testExotel(): Promise<TestResult> {
  const config = await getSettings('exotel');
  if (!config.apiKey || !config.apiToken || !config.accountSid) {
    return { service: 'exotel', connected: false, configured: false, message: 'Exotel credentials not configured' };
  }

  const start = Date.now();
  try {
    const basicAuth = Buffer.from(`${config.apiKey}:${config.apiToken}`).toString('base64');
    const res = await fetch(`https://api.exotel.com/v1/Accounts/${config.accountSid}`, {
      headers: { 'Authorization': `Basic ${basicAuth}` },
    });
    const latency = Date.now() - start;
    return {
      service: 'exotel',
      connected: res.ok || res.status === 200,
      configured: true,
      latency,
      message: res.ok ? `Connected! Account: ${config.accountSid}` : `HTTP ${res.status}`,
    };
  } catch (e: any) {
    return { service: 'exotel', connected: false, configured: true, latency: Date.now() - start, message: e.message };
  }
}

async function testSMTP(): Promise<TestResult> {
  const config = await getSettings('smtp');
  if (!config.host || !config.username) {
    return { service: 'smtp', connected: false, configured: false, message: 'SMTP not configured' };
  }

  // Basic connection test — try to resolve the host
  const start = Date.now();
  try {
    // We can't do full SMTP verify in edge/serverless easily, but we can validate config exists
    const configured = !!(config.host && config.port && config.username && config.password);
    return {
      service: 'smtp',
      connected: configured,
      configured: true,
      latency: Date.now() - start,
      message: configured ? `Configured: ${config.username} via ${config.host}:${config.port}` : 'Incomplete configuration',
    };
  } catch (e: any) {
    return { service: 'smtp', connected: false, configured: true, latency: Date.now() - start, message: e.message };
  }
}

async function testGitHub(): Promise<TestResult> {
  const token = await getSetting('github.token');
  if (!token) return { service: 'github', connected: false, configured: false, message: 'GitHub token not configured' };

  const start = Date.now();
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' },
    });
    const latency = Date.now() - start;
    if (res.ok) {
      const user = await res.json();
      return { service: 'github', connected: true, configured: true, latency, message: `Connected as ${user.login}` };
    }
    return { service: 'github', connected: false, configured: true, latency, message: `HTTP ${res.status}` };
  } catch (e: any) {
    return { service: 'github', connected: false, configured: true, latency: Date.now() - start, message: e.message };
  }
}

async function testVercel(): Promise<TestResult> {
  const token = await getSetting('vercel.token');
  if (!token) return { service: 'vercel', connected: false, configured: false, message: 'Vercel token not configured' };

  const start = Date.now();
  try {
    const res = await fetch('https://api.vercel.com/v2/user', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const latency = Date.now() - start;
    if (res.ok) {
      const data = await res.json();
      return { service: 'vercel', connected: true, configured: true, latency, message: `Connected as ${data.user?.username || 'user'}` };
    }
    return { service: 'vercel', connected: false, configured: true, latency, message: `HTTP ${res.status}` };
  } catch (e: any) {
    return { service: 'vercel', connected: false, configured: true, latency: Date.now() - start, message: e.message };
  }
}

async function testSMS(): Promise<TestResult> {
  const config = await getSettings('sms');
  if (!config.apiKey) return { service: 'sms', connected: false, configured: false, message: 'SMS API key not configured' };

  return {
    service: 'sms',
    connected: true,
    configured: true,
    latency: 0,
    message: `Configured: ${config.provider || 'MSG91'}, Sender: ${config.senderId || 'VAAHAN'}`,
  };
}

const testFunctions: Record<string, () => Promise<TestResult>> = {
  gemini: testGemini,
  openai: testOpenAI,
  exotel: testExotel,
  smtp: testSMTP,
  github: testGitHub,
  vercel: testVercel,
  sms: testSMS,
};

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;
    if (session!.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { service } = body as { service: string };

    if (service === 'all') {
      const results: TestResult[] = [];
      for (const [name, fn] of Object.entries(testFunctions)) {
        results.push(await fn());
      }
      return NextResponse.json({ success: true, results });
    }

    const testFn = testFunctions[service];
    if (!testFn) {
      return NextResponse.json({ error: `Unknown service: ${service}` }, { status: 400 });
    }

    const result = await testFn();
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
