/**
 * Cron: System Health Check (Every 6 hours)
 * Also serves as a manual health check endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { runSystemHealthCheck } from '@/lib/automation/engine';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  // Health check doesn't need auth — useful for monitoring
  try {
    const result = await runSystemHealthCheck();
    const statusCode = result.status === 'healthy' ? 200 : 503;
    return NextResponse.json({
      success: true,
      job: 'health-check',
      timestamp: new Date().toISOString(),
      ...result
    }, { status: statusCode });
  } catch (error: any) {
    console.error('Health check error:', error);
    return NextResponse.json({ status: 'down', error: error.message }, { status: 500 });
  }
}
