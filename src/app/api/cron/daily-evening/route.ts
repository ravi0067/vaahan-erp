/**
 * Cron: Daily Evening Jobs (9 PM IST = 3:30 PM UTC)
 * - Daily report generation
 * - Daybook lock check (10 PM = 4:30 PM UTC)
 */

import { NextRequest, NextResponse } from 'next/server';
import { runDailyReport, runDaybookLockCheck } from '@/lib/automation/engine';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const startTime = Date.now();

    const [dailyReport, daybookCheck] = await Promise.all([
      runDailyReport(),
      runDaybookLockCheck()
    ]);

    return NextResponse.json({
      success: true,
      job: 'daily-evening',
      timestamp: new Date().toISOString(),
      executionTime: Date.now() - startTime,
      results: {
        dailyReport: { tenants: dailyReport.tenants, reportsGenerated: dailyReport.reports.length },
        daybookCheck: daybookCheck
      }
    });
  } catch (error: any) {
    console.error('Daily evening cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
