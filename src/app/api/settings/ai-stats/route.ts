/**
 * API: AI Tool Statistics
 * GET /api/settings/ai-stats
 * Returns AI usage stats, tool registry info, rate limit status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/api-auth';
import { toolRegistry } from '@/lib/ai-tools/registry';
import { registerAllDataTools } from '@/lib/ai-tools/data-tools';
import { registerAllActionTools } from '@/lib/ai-tools/action-tools';
import { registerAllCommunicationTools } from '@/lib/ai-tools/communication-tools';
import { registerAllDevopsTools } from '@/lib/ai-tools/devops-tools';
import { getAuditStats, getAuditLoggerStats } from '@/lib/ai-tools/audit-logger';
import { getRateLimiterStats } from '@/lib/ai-tools/rate-limiter';
import { getServiceStatuses } from '@/lib/credentials';

export const dynamic = 'force-dynamic';

// Ensure tools registered
let initialized = false;
function ensureInit() {
  if (!initialized) {
    registerAllDataTools();
    registerAllActionTools();
    registerAllCommunicationTools();
    registerAllDevopsTools();
    initialized = true;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    ensureInit();

    const tenantId = session!.user.tenantId;
    const userRole = session!.user.role;

    // Tool registry stats
    const registryStats = toolRegistry.getRegistryStats();

    // Audit stats (last 24 hours)
    const auditStats = getAuditStats(tenantId, 24);
    const auditLoggerStats = getAuditLoggerStats();

    // Rate limiter stats
    const rateLimiterStats = getRateLimiterStats();

    // Service statuses
    const services = getServiceStatuses();

    // Communication stats from DB
    const prisma = (await import('@/lib/prisma')).default;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayComms, totalComms] = await Promise.all([
      prisma.communicationLog.count({ where: { tenantId, createdAt: { gte: today } } }),
      prisma.communicationLog.count({ where: { tenantId } })
    ]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tools: {
        total: registryStats.totalTools,
        categories: registryStats.categories
      },
      audit: {
        last24h: auditStats,
        logger: auditLoggerStats
      },
      rateLimiter: rateLimiterStats,
      services,
      communications: {
        today: todayComms,
        total: totalComms
      },
      userRole
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
