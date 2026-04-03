/**
 * GET /api/leads/follow-ups — Follow-up dashboard data
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession, serializeDecimals } from "@/lib/api-auth";
import {
  getOverdueFollowUps,
  getStaleLeads,
  getFollowUpSummary,
} from "@/lib/lead-automation/follow-up-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;
    const tenantId = session!.user.tenantId;

    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view") || "summary";

    if (view === "summary") {
      const summary = await getFollowUpSummary(tenantId);
      return NextResponse.json(summary);
    }

    if (view === "overdue") {
      const overdue = await getOverdueFollowUps(tenantId);
      return NextResponse.json(serializeDecimals(overdue));
    }

    if (view === "stale") {
      const hours = parseInt(searchParams.get("hours") || "24", 10);
      const stale = await getStaleLeads(tenantId, hours);
      return NextResponse.json(serializeDecimals(stale));
    }

    return NextResponse.json({ error: "Invalid view" }, { status: 400 });
  } catch (error: any) {
    console.error("Follow-ups API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
