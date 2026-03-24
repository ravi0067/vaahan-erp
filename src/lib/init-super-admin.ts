import prisma from "@/lib/prisma";

let initialized = false;

/**
 * Auto-creates the Super Admin tenant + user on first run.
 * This ensures the platform always has a Super Owner login
 * without needing manual seeding or onboarding.
 * 
 * Runs once per server lifecycle (cached via `initialized` flag).
 */
export async function ensureSuperAdmin() {
  if (initialized) return;

  try {
    // Check if any SUPER_ADMIN exists
    const existing = await prisma.user.findFirst({
      where: { role: "SUPER_ADMIN" },
    });

    if (existing) {
      initialized = true;
      return;
    }

    // No Super Admin exists — create platform tenant + super admin user
    console.log("🔧 No Super Admin found. Auto-creating platform admin...");

    const platformTenant = await prisma.tenant.upsert({
      where: { slug: "vaahan-platform" },
      update: {},
      create: {
        name: "VaahanERP Platform",
        slug: "vaahan-platform",
        plan: "ENTERPRISE",
        status: "ACTIVE",
        dealershipType: "MULTI",
      },
    });

    const defaultEmail = process.env.SUPER_ADMIN_EMAIL || "superadmin@vaahan.com";
    const defaultPassword = process.env.SUPER_ADMIN_PASSWORD || "super123";

    await prisma.user.create({
      data: {
        tenantId: platformTenant.id,
        name: "Super Admin",
        email: defaultEmail,
        password: defaultPassword,
        phone: "",
        role: "SUPER_ADMIN",
      },
    });

    console.log(`✅ Super Admin created: ${defaultEmail}`);
    initialized = true;
  } catch (error) {
    // Don't crash the app if init fails — log and continue
    console.error("⚠️ Super Admin auto-init error:", error);
    initialized = true; // Don't retry on every request
  }
}
