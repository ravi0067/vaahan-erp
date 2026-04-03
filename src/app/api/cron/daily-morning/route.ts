/**
 * Cron: Daily Morning Jobs (9 AM IST = 3:30 AM UTC)
 * - Follow-up reminders
 * - Insurance expiry check
 * - Email poll (all 3 mailboxes)
 * - Overdue/stale lead notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { runFollowUpReminders, runInsuranceCheck } from '@/lib/automation/engine';
import { pollAllMailboxes } from '@/lib/lead-automation/imap-poller';
import { createOverdueNotifications, createStaleLeadNotifications } from '@/lib/lead-automation/notification-service';

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

    const [followUps, insurance, emailPoll] = await Promise.all([
      runFollowUpReminders().catch((e: Error) => ({ error: e.message })),
      runInsuranceCheck().catch((e: Error) => ({ error: e.message })),
      pollAllMailboxes().catch((e: Error) => ({ total: 0, processed: 0, errors: [e.message], details: [] })),
    ]);

    // Run notification checks
    const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID || "";
    let notifications = { overdue: 0, stale: 0 };
    if (DEFAULT_TENANT_ID) {
      const [overdue, stale] = await Promise.all([
        createOverdueNotifications(DEFAULT_TENANT_ID).catch(() => 0),
        createStaleLeadNotifications(DEFAULT_TENANT_ID).catch(() => 0),
      ]);
      notifications = { overdue, stale };
    }

    const executionTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      job: 'daily-morning',
      timestamp: new Date().toISOString(),
      executionTime: `${executionTime}ms`,
      results: {
        followUpReminders: followUps,
        insuranceCheck: insurance,
        emailPoll: emailPoll,
        notifications,
      }
    });
  } catch (error: any) {
    console.error('Daily morning cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
