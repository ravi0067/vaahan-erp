/**
 * Cron: Lead Follow-Up Automation
 * Checks overdue leads, stale leads, sends reminders
 * Schedule: Every 4 hours
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOverdueFollowUps, getStaleLeads } from "@/lib/lead-automation/follow-up-engine";
import { sendEmail } from "@/lib/lead-automation/email-service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    if (process.env.NODE_ENV === "production" && process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const startTime = Date.now();
    const results: any[] = [];

    // Get all tenants
    const tenants = await prisma.tenant.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, email: true },
    });

    for (const tenant of tenants) {
      // 1. Check overdue follow-ups
      const overdue = await getOverdueFollowUps(tenant.id);
      
      // 2. Check stale leads (no action in 24h)
      const stale = await getStaleLeads(tenant.id, 24);

      if (overdue.length > 0 || stale.length > 0) {
        // Send summary email to tenant admin
        const overdueList = overdue
          .slice(0, 5)
          .map(l => `• ${l.customerName} (${l.mobile}) — ${l.daysPastDue} din overdue`)
          .join("\n");
        
        const staleList = stale
          .slice(0, 5)
          .map(l => `• ${l.customerName} (${l.mobile}) — ${l.hoursStale}h se pending`)
          .join("\n");

        const emailHtml = `
          <div style="font-family: Arial; max-width: 500px; padding: 20px;">
            <h2 style="color: #7c3aed;">📊 Lead Follow-Up Report — ${tenant.name}</h2>
            
            ${overdue.length > 0 ? `
              <h3 style="color: #dc2626;">⏰ Overdue Follow-Ups (${overdue.length})</h3>
              <pre style="background: #fef2f2; padding: 10px; border-radius: 8px; font-size: 13px;">${overdueList}</pre>
            ` : ""}
            
            ${stale.length > 0 ? `
              <h3 style="color: #f59e0b;">😴 Stale Leads (${stale.length})</h3>
              <pre style="background: #fffbeb; padding: 10px; border-radius: 8px; font-size: 13px;">${staleList}</pre>
            ` : ""}
            
            <p style="margin-top: 15px;">
              <a href="https://www.vaahanerp.com/leads/crm" style="background: #7c3aed; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
                Open Lead CRM →
              </a>
            </p>
          </div>`;

        // Send to admin
        if (tenant.email) {
          await sendEmail({
            from: "admin",
            to: tenant.email,
            subject: `📊 ${overdue.length} Overdue + ${stale.length} Stale Leads — Action Required`,
            html: emailHtml,
          }).catch(() => {});
        }

        results.push({
          tenant: tenant.name,
          overdue: overdue.length,
          stale: stale.length,
          notified: !!tenant.email,
        });
      }
    }

    return NextResponse.json({
      success: true,
      tenantsChecked: tenants.length,
      results,
      durationMs: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error("Lead follow-up cron error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
