/**
 * Central Credential Manager
 * Reads from DB (AI Config Dashboard) first, then falls back to .env
 * Provides clean getter functions for all API keys and credentials
 */

// In-memory cache for DB settings (refreshes every 5 min)
let settingsCache: Map<string, string> = new Map();
let lastCacheRefresh = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Fetch all settings from Supabase DB
async function refreshSettingsCache(): Promise<void> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    const res = await fetch(`${supabaseUrl}/rest/v1/SystemSetting?select=key,value`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (res.ok) {
      const settings: Array<{ key: string; value: string }> = await res.json();
      const newCache = new Map<string, string>();
      for (const s of settings) {
        if (s.value) newCache.set(s.key, s.value);
      }
      settingsCache = newCache;
      lastCacheRefresh = Date.now();
    }
  } catch (e) {
    console.error("Failed to refresh settings cache:", e);
  }
}

// Get setting from cache (DB first) → env fallback
async function getSettingAsync(dbKey: string, envKey: string): Promise<string> {
  // Refresh cache if stale
  if (Date.now() - lastCacheRefresh > CACHE_TTL) {
    await refreshSettingsCache();
  }
  return settingsCache.get(dbKey) || process.env[envKey] || "";
}

// Sync version (uses cached values, no await needed after first load)
function getSetting(dbKey: string, envKey: string): string {
  return settingsCache.get(dbKey) || process.env[envKey] || "";
}

// Supabase Credentials
export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

export function getSupabaseServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

export function getDatabaseUrl(): string {
  return process.env.DATABASE_URL || '';
}

export function getDirectDatabaseUrl(): string {
  return process.env.DIRECT_DATABASE_URL || '';
}

// AI Credentials — DB first (ai.apiKey.gemini), then .env (GEMINI_API_KEY)
export function getGeminiApiKey(): string {
  return getSetting("ai.apiKey.gemini", "GEMINI_API_KEY");
}

// Async version — ALWAYS fetches fresh from DB first (use in API routes)
export async function getGeminiApiKeyAsync(): Promise<string> {
  // Always refresh on this call to ensure we have the latest key
  await refreshSettingsCache();
  const dbKey = settingsCache.get("ai.apiKey.gemini");
  if (dbKey) return dbKey;
  // Only fallback to env if DB has nothing
  return process.env.GEMINI_API_KEY || "";
}

// Get Gemini model from DB config — default to gemini-2.5-pro
export function getGeminiModel(): string {
  return getSetting("ai.model", "") || "gemini-2.5-pro";
}

// ElevenLabs
export function getElevenLabsApiKey(): string {
  return getSetting("vaani.elevenLabsKey", "ELEVENLABS_API_KEY");
}

// Force refresh settings cache (call at app startup or after config change)
export async function ensureSettingsLoaded(): Promise<void> {
  if (Date.now() - lastCacheRefresh > CACHE_TTL) {
    await refreshSettingsCache();
  }
}

// Authentication
export function getNextAuthSecret(): string {
  return process.env.NEXTAUTH_SECRET || '';
}

export function getNextAuthUrl(): string {
  return process.env.NEXTAUTH_URL || '';
}

// Communication Services — WhatsApp via Exotel
export function getWhatsAppApiKey(): string {
  return process.env.EXOTEL_API_KEY || process.env.WHATSAPP_API_KEY || '';
}

export function getWhatsAppBusinessNumber(): string {
  return process.env.EXOTEL_WHATSAPP_NUMBER || process.env.WHATSAPP_BUSINESS_NUMBER || '';
}

export function getSmsApiKey(): string {
  return process.env.SMS_API_KEY || '';
}

export function getSmsApiSecret(): string {
  return process.env.SMS_API_SECRET || '';
}

export function getEmailApiKey(): string {
  return process.env.EMAIL_API_KEY || '';
}

export function getEmailFromAddress(): string {
  return process.env.EMAIL_FROM_ADDRESS || 'noreply@vaahan.ai';
}

// Calling Service (Exotel)
export function getExotelApiKey(): string {
  return process.env.EXOTEL_API_KEY || '';
}

export function getExotelApiToken(): string {
  return process.env.EXOTEL_API_TOKEN || '';
}

export function getExotelAccountSid(): string {
  return process.env.EXOTEL_ACCOUNT_SID || '';
}

export function getExotelCallerId(): string {
  return process.env.EXOTEL_CALLER_ID || '';
}

// Deployment Services
export function getGitHubToken(): string {
  return process.env.GITHUB_TOKEN || '';
}

export function getVercelToken(): string {
  return process.env.VERCEL_TOKEN || '';
}

export function getVercelOrgId(): string {
  return process.env.VERCEL_ORG_ID || '';
}

export function getVercelProjectId(): string {
  return process.env.VERCEL_PROJECT_ID || '';
}

// Utility function to check if service is configured
export function isServiceConfigured(service: string): boolean {
  switch (service.toLowerCase()) {
    case 'gemini':
      return !!getGeminiApiKey();
    case 'supabase':
      return !!(getSupabaseUrl() && getSupabaseServiceRoleKey());
    case 'whatsapp':
      return !!(getWhatsAppApiKey() && getWhatsAppBusinessNumber());
    case 'sms':
      return !!(getSmsApiKey() && getSmsApiSecret());
    case 'email':
      return !!getEmailApiKey();
    case 'calling':
    case 'exotel':
      return !!(getExotelApiKey() && getExotelApiToken() && getExotelAccountSid());
    case 'github':
      return !!getGitHubToken();
    case 'vercel':
      return !!(getVercelToken() && getVercelOrgId() && getVercelProjectId());
    default:
      return false;
  }
}

// Get all service statuses (useful for system health checks)
export function getServiceStatuses() {
  return {
    gemini: isServiceConfigured('gemini'),
    supabase: isServiceConfigured('supabase'),
    whatsapp: isServiceConfigured('whatsapp'),
    sms: isServiceConfigured('sms'),
    email: isServiceConfigured('email'),
    calling: isServiceConfigured('calling'),
    github: isServiceConfigured('github'),
    vercel: isServiceConfigured('vercel'),
  };
}// Trigger redeploy with all env vars
