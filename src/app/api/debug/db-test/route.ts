import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const results: Record<string, any> = {};
  
  try {
    results.env = {
      hasDbUrl: !!process.env.DATABASE_URL,
      dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 40) || "NOT SET",
      defaultTenantId: process.env.DEFAULT_TENANT_ID || "NOT SET",
    };
  } catch (e: any) {
    results.envError = e.message;
  }

  try {
    const count = await prisma.tenant.count();
    results.tenantCount = count;
  } catch (e: any) {
    results.tenantError = e.message;
  }

  try {
    const count = await prisma.lead.count();
    results.leadCount = count;
  } catch (e: any) {
    results.leadError = e.message;
  }

  try {
    const tenant = await prisma.tenant.findFirst({ select: { id: true, name: true } });
    results.firstTenant = tenant;
  } catch (e: any) {
    results.findTenantError = e.message;
  }

  return NextResponse.json(results);
}
