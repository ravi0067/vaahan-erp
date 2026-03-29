/**
 * Cron: Daily Morning Jobs (9 AM IST = 3:30 AM UTC)
 * - Follow-up reminders
 * - Insurance expiry check
 */

import { NextRequest, NextResponse } from 'next/server';
import { runFollowUpReminders, runInsuranceCheck } from '@/lib/automation/engine';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Also allow without secret for manual triggers in dev
    if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const startTime = Date.now();

    const [followUps, insurance] = await Promise.all([
      runFollowUpReminders(),
      runInsuranceCheck()
    ]);

    const executionTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      job: 'daily-morning',
      timestamp: new Date().toISOString(),
      executionTime,
      results: {
        followUpReminders: followUps,
        insuranceCheck: insurance
      }
    });
  } catch (error: any) {
    console.error('Daily morning cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
