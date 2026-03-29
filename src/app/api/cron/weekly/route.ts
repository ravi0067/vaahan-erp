/**
 * Cron: Weekly Report (Monday 10 AM IST = 4:30 AM UTC)
 */

import { NextRequest, NextResponse } from 'next/server';
import { runWeeklyReport } from '@/lib/automation/engine';

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
    const result = await runWeeklyReport();
    return NextResponse.json({ success: true, job: 'weekly', timestamp: new Date().toISOString(), results: result });
  } catch (error: any) {
    console.error('Weekly cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
