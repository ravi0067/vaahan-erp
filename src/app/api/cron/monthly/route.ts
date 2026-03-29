/**
 * Cron: Monthly Report (1st of month, 10 AM IST)
 */

import { NextRequest, NextResponse } from 'next/server';
import { runMonthlyReport } from '@/lib/automation/engine';

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
    const result = await runMonthlyReport();
    return NextResponse.json({ success: true, job: 'monthly', timestamp: new Date().toISOString(), results: result });
  } catch (error: any) {
    console.error('Monthly cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
