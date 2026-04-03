/**
 * Cron: Email Poll — Checks all 3 mailboxes for new emails
 * Can be triggered manually or via external cron (Vercel hobby = 1 cron only)
 * 
 * GET /api/cron/email-poll?secret=xxx
 * 
 * Also runs follow-up notifications check
 */
import { NextRequest, NextResponse } from "next/server";
import { pollAllMailboxes } from "@/lib/lead-automation/imap-poller";
import { createOverdueNotifications, createStaleLeadNotifications } from "@/lib/lead-automation/notification-service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // Verify secret
  const secret = req.nextUrl.searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET || "vaahanerp_email_2026";
  const authHeader = req.headers.get("authorization");

  const isAuthorized = 
    secret === cronSecret ||
    authHeader === `Bearer ${cronSecret}` ||
    process.env.NODE_ENV !== "production";

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    // 1. Poll emails
    const emailResult = await pollAllMailboxes();

    // 2. Check overdue follow-ups (create notifications)
    const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID || "";
    let overdueCount = 0;
    let staleCount = 0;

    if (DEFAULT_TENANT_ID) {
      overdueCount = await createOverdueNotifications(DEFAULT_TENANT_ID).catch(() => 0);
      staleCount = await createStaleLeadNotifications(DEFAULT_TENANT_ID).catch(() => 0);
    }

    const executionTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      job: "email-poll",
      timestamp: new Date().toISOString(),
      executionTime: `${executionTime}ms`,
      email: emailResult,
      notifications: {
        overdueCreated: overdueCount,
        staleCreated: staleCount,
      },
    });
  } catch (error: any) {
    console.error("❌ Email poll cron error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      executionTime: `${Date.now() - startTime}ms`,
    }, { status: 500 });
  }
}
