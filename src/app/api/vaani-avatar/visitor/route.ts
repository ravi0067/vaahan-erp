/**
 * Vaani Avatar Visitor API — CRM Lead + Visitor tracking
 * POST /api/vaani-avatar/visitor — Create/update visitor + auto CRM lead
 * GET  /api/vaani-avatar/visitor?phone=xxx — Lookup returning visitor
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Default tenant for avatar (first active tenant or configured one)
async function getDefaultTenantId(): Promise<string | null> {
  const setting = await prisma.systemSetting.findUnique({ where: { key: "avatar.defaultTenantId" } });
  if (setting?.value) return setting.value;
  const tenant = await prisma.tenant.findFirst({ where: { status: "ACTIVE" }, orderBy: { createdAt: "asc" } });
  return tenant?.id || null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, photoBase64, queries, language, sessionMessages } = body;

    const tenantId = body.tenantId || await getDefaultTenantId();
    if (!tenantId) return NextResponse.json({ error: "No tenant configured" }, { status: 400 });

    // Check if visitor exists by phone
    let visitor = phone ? await prisma.avatarVisitor.findFirst({
      where: { tenantId, phone },
      orderBy: { lastSeen: "desc" },
    }) : null;

    if (visitor) {
      // Returning customer! Update visit count
      visitor = await prisma.avatarVisitor.update({
        where: { id: visitor.id },
        data: {
          lastSeen: new Date(),
          visitCount: { increment: 1 },
          name: name || visitor.name,
          photoUrl: photoBase64 || visitor.photoUrl,
        },
      });
    } else {
      // New visitor
      visitor = await prisma.avatarVisitor.create({
        data: {
          tenantId,
          name: name || null,
          phone: phone || null,
          photoUrl: photoBase64 || null,
          firstSeen: new Date(),
          lastSeen: new Date(),
          visitCount: 1,
        },
      });

      // Auto-create CRM lead if we have name or phone
      if (name || phone) {
        try {
          const lead = await prisma.lead.create({
            data: {
              tenantId,
              customerName: name || "Avatar Visitor",
              mobile: phone || "N/A",
              source: "VAANI_AVATAR",
              status: "NEW",
              dealHealth: "WARM",
              notes: `Auto-created by Vaani Avatar.\nQueries: ${JSON.stringify(queries || []).substring(0, 500)}`,
            },
          });
          // Link lead to visitor
          await prisma.avatarVisitor.update({
            where: { id: visitor.id },
            data: { leadId: lead.id },
          });
        } catch (e) {
          console.error("Lead creation error:", e);
        }
      }
    }

    // Create session record
    const session = await prisma.avatarSession.create({
      data: {
        tenantId,
        visitorId: visitor.id,
        messages: sessionMessages || [],
        queries: queries || [],
        language: language || "hinglish",
        source: "avatar_tv",
      },
    });

    // Check if returning visitor has previous data
    let previousInfo = null;
    if (visitor.visitCount > 1) {
      const prevSessions = await prisma.avatarSession.findMany({
        where: { visitorId: visitor.id, id: { not: session.id } },
        orderBy: { startedAt: "desc" },
        take: 3,
      });
      previousInfo = {
        name: visitor.name,
        visitCount: visitor.visitCount,
        firstSeen: visitor.firstSeen,
        previousQueries: prevSessions.flatMap((s: any) => {
          const q = s.queries;
          return Array.isArray(q) ? q : [];
        }).slice(0, 5),
      };
    }

    return NextResponse.json({
      success: true,
      visitor: {
        id: visitor.id,
        name: visitor.name,
        visitCount: visitor.visitCount,
        isReturning: visitor.visitCount > 1,
      },
      previousInfo,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error("Visitor API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get("phone");
    if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });

    const tenantId = await getDefaultTenantId();
    if (!tenantId) return NextResponse.json({ visitor: null });

    const visitor = await prisma.avatarVisitor.findFirst({
      where: { tenantId, phone },
      orderBy: { lastSeen: "desc" },
    });

    if (!visitor) return NextResponse.json({ visitor: null });

    const recentSessions = await prisma.avatarSession.findMany({
      where: { visitorId: visitor.id },
      orderBy: { startedAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      visitor: {
        id: visitor.id,
        name: visitor.name,
        phone: visitor.phone,
        visitCount: visitor.visitCount,
        firstSeen: visitor.firstSeen,
        lastSeen: visitor.lastSeen,
      },
      recentQueries: recentSessions.flatMap((s: any) => {
        const q = s.queries;
        return Array.isArray(q) ? q : [];
      }).slice(0, 10),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
