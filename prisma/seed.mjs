import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding VaahanERP database...');

  // Platform tenant
  const platformTenant = await prisma.tenant.upsert({
    where: { slug: 'vaahan-platform' },
    update: {},
    create: { id: 'tenant-platform', name: 'VaahanERP Platform', slug: 'vaahan-platform', plan: 'ENTERPRISE', status: 'ACTIVE' },
  });
  console.log('✅ Platform tenant created:', platformTenant.id);

  // Demo tenant
  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'vaahan-motors' },
    update: {},
    create: { id: 'tenant-vaahan-motors', name: 'Vaahan Motors', slug: 'vaahan-motors', plan: 'PROFESSIONAL', status: 'ACTIVE' },
  });
  console.log('✅ Demo tenant created:', demoTenant.id);

  // Users (matching demo users in auth.ts)
  const users = [
    { id: 'user-super-admin', tenantId: 'tenant-platform', name: 'Super Admin', email: 'superadmin@vaahan.com', password: 'super123', role: 'SUPER_ADMIN' },
    { id: 'user-owner', tenantId: 'tenant-vaahan-motors', name: 'Ravi Kumar', email: 'owner@vaahan.com', password: 'owner123', role: 'OWNER' },
    { id: 'user-manager', tenantId: 'tenant-vaahan-motors', name: 'Amit Singh', email: 'manager@vaahan.com', password: 'manager123', role: 'MANAGER' },
    { id: 'user-sales', tenantId: 'tenant-vaahan-motors', name: 'Priya Sharma', email: 'sales@vaahan.com', password: 'sales123', role: 'SALES_EXEC' },
    { id: 'user-accountant', tenantId: 'tenant-vaahan-motors', name: 'Suresh Gupta', email: 'accountant@vaahan.com', password: 'accountant123', role: 'ACCOUNTANT' },
    { id: 'user-mechanic', tenantId: 'tenant-vaahan-motors', name: 'Deepak Yadav', email: 'mechanic@vaahan.com', password: 'mechanic123', role: 'MECHANIC' },
    { id: 'user-legacy-admin', tenantId: 'tenant-vaahan-motors', name: 'Admin User', email: 'admin@vaahan.com', password: 'admin123', role: 'OWNER' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, password: u.password, role: u.role },
      create: u,
    });
    console.log(`✅ User created: ${u.email} (${u.role})`);
  }

  console.log('🌱 Seeding complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
