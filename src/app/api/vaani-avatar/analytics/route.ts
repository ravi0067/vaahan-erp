/**
 * Vaani Avatar Analytics API
 * GET /api/vaani-avatar/analytics — Dashboard stats
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const tenantId = session.user.tenantId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalVisitors,
      todayVisitors,
      weekVisitors,
      totalSessions,
      todaySessions,
      returningVisitors,
      recentSessions,
      topQueries,
      languageStats,
    ] = await Promise.all([
      prisma.avatarVisitor.count({ where: { tenantId } }),
      prisma.avatarVisitor.count({ where: { tenantId, lastSeen: { gte: today } } }),
      prisma.avatarVisitor.count({ where: { tenantId, lastSeen: { gte: weekAgo } } }),
      prisma.avatarSession.count({ where: { tenantId } }),
      prisma.avatarSession.count({ where: { tenantId, startedAt: { gte: today } } }),
      prisma.avatarVisitor.count({ where: { tenantId, visitCount: { gt: 1 } } }),
      prisma.avatarSession.findMany({
        where: { tenantId },
        orderBy: { startedAt: "desc" },
        take: 20,
        include: { visitor: { select: { name: true, phone: true, visitCount: true } } },
      }),
      // Top queries from last 30 days
      prisma.avatarSession.findMany({
        where: { tenantId, startedAt: { gte: monthAgo } },
        select: { queries: true },
      }),
      // Language distribution
      prisma.avatarSession.groupBy({
        by: ["language"],
        where: { tenantId },
        _count: true,
      }),
    ]);

    // Extract and count top queries
    const queryCounts: Record<string, number> = {};
    for (const s of topQueries as any[]) {
      const queries = Array.isArray(s.queries) ? s.queries : [];
      for (const q of queries) {
        const key = (typeof q === "string" ? q : q?.text || "").toLowerCase().trim();
        if (key.length > 3) queryCounts[key] = (queryCounts[key] || 0) + 1;
      }
    }
    const topQueriesSorted = Object.entries(queryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));

    return NextResponse.json({
      overview: {
        totalVisitors,
        todayVisitors,
        weekVisitors,
        totalSessions,
        todaySessions,
        returningVisitors,
        returningRate: totalVisitors > 0 ? Math.round((returningVisitors / totalVisitors) * 100) : 0,
      },
      recentSessions: recentSessions.map((s: any) => ({
        id: s.id,
        visitor: s.visitor?.name || "Unknown",
        phone: s.visitor?.phone,
        visitCount: s.visitor?.visitCount || 1,
        language: s.language,
        startedAt: s.startedAt,
        messageCount: Array.isArray(s.messages) ? s.messages.length : 0,
      })),
      topQueries: topQueriesSorted,
      languages: languageStats.map((l: any) => ({ language: l.language, count: l._count })),
    });
  } catch (error: any) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
