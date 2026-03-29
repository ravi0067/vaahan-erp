/**
 * Central Credential Manager
 * Reads environment variables for all VaahanERP services
 * Provides clean getter functions for all API keys and credentials
 */

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

// AI Credentials
export function getGeminiApiKey(): string {
  return process.env.GEMINI_API_KEY || '';
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
