/**
 * Test Connection API — Tests individual service connections
 * Uses Supabase REST API (not Prisma) to read saved settings
 * POST /api/admin/ai-config/test
 * Body: { service: "gemini" | "exotel" | "smtp" | "github" | "vercel" | "sms" | "all" }
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
  };
}

async function getSetting(key: string): Promise<string> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/SystemSetting?key=eq.${encodeURIComponent(key)}&select=value&limit=1`,
    { headers: supabaseHeaders() }
  );
  const data = await res.json();
  return data?.[0]?.value || '';
}

async function getSettings(prefix: string): Promise<Record<string, string>> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/SystemSetting?key=like.${encodeURIComponent(prefix + '.*')}&select=key,value`,
    { headers: supabaseHeaders() }
  );
  const data = await res.json();
  const result: Record<string, string> = {};
  if (Array.isArray(data)) {
    for (const s of data) {
      const shortKey = s.key.replace(`${prefix}.`, '');
      result[shortKey] = s.value;
    }
  }
  return result;
}

type TestResult = {
  service: string;
  connected: boolean;
  configured: boolean;
  latency?: number;
  message: string;
};

async function testGemini(): Promise<TestResult> {
  // Try DB setting first, fallback to env var
  const apiKey = (await getSetting('ai.apiKey.gemini')) || process.env.GEMINI_API_KEY || '';
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
    return { service: 'gemini', connected: false, configured: true, latency, message: `HTTP ${res.status}` };
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
  // Try DB settings first, fallback to env vars
  const config = await getSettings('exotel');
  const apiKey = config.apiKey || process.env.EXOTEL_API_KEY || '';
  const apiToken = config.apiToken || process.env.EXOTEL_API_TOKEN || '';
  const accountSid = config.accountSid || process.env.EXOTEL_ACCOUNT_SID || '';

  if (!apiKey || !apiToken || !accountSid) {
    return { service: 'exotel', connected: false, configured: false, message: 'Exotel credentials not configured' };
  }

  const start = Date.now();
  try {
    const basicAuth = Buffer.from(`${apiKey}:${apiToken}`).toString('base64');
    const res = await fetch(`https://api.exotel.com/v1/Accounts/${accountSid}`, {
      headers: { 'Authorization': `Basic ${basicAuth}` },
    });
    const latency = Date.now() - start;
    return {
      service: 'exotel',
      connected: res.ok || res.status === 200,
      configured: true,
      latency,
      message: res.ok ? `Connected! Account: ${accountSid}` : `HTTP ${res.status}`,
    };
  } catch (e: any) {
    return { service: 'exotel', connected: false, configured: true, latency: Date.now() - start, message: e.message };
  }
}

async function testSMTP(): Promise<TestResult> {
  const config = await getSettings('smtp');
  const host = config.host || '';
  const username = config.username || '';

  if (!host || !username) {
    return { service: 'smtp', connected: false, configured: false, message: 'SMTP not configured — host aur username daalo' };
  }

  const configured = !!(host && config.port && username && config.password);
  return {
    service: 'smtp',
    connected: configured,
    configured: true,
    latency: 0,
    message: configured ? `Configured: ${username} via ${host}:${config.port || '587'}` : 'Incomplete — password missing',
  };
}

async function testGitHub(): Promise<TestResult> {
  const token = (await getSetting('github.token')) || process.env.GITHUB_TOKEN || '';
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
  const token = (await getSetting('vercel.token')) || process.env.VERCEL_TOKEN || '';
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
      for (const [, fn] of Object.entries(testFunctions)) {
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
