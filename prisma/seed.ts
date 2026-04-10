import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding VaahanERP database...');

  // ── Step 1: Drop legacy lowercase tables ─────────────────────────────
  try {
    await prisma.$executeRaw`DROP TABLE IF EXISTS "customers" CASCADE`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "leads" CASCADE`;
    console.log('🗑  Dropped legacy tables: customers, leads');
  } catch (e) {
    console.log('⚠️  Legacy tables already removed or not found');
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);

  // ── Step 2: System Tenant for Super Admin ─────────────────────────────
  const systemTenant = await prisma.tenant.upsert({
    where: { slug: 'vaahan-system' },
    update: {},
    create: {
      name: 'VaahanERP System',
      slug: 'vaahan-system',
      plan: 'ENTERPRISE',
      status: 'ACTIVE',
      dealershipType: 'SYSTEM',
      email: 'system@vaahan.com',
    },
  });

  // ── Step 3: Super Admin User ──────────────────────────────────────────
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@vaahan.com' },
    update: {},
    create: {
      email: 'admin@vaahan.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      tenantId: systemTenant.id,
    },
  });

  console.log(`✅ Super Admin: ${superAdmin.email}`);

  // ── Step 4: Demo Dealership Tenant ────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-motors' },
    update: {},
    create: {
      name: 'Demo Motors Lucknow',
      slug: 'demo-motors',
      plan: 'PROFESSIONAL',
      status: 'ACTIVE',
      dealershipType: 'MULTI',
      address: 'Gomti Nagar, Lucknow, UP - 226010',
      phone: '+91-9876543210',
      email: 'info@demomotors.com',
      gst: 'GDEMO123456789',
    },
  });

  console.log(`✅ Demo Tenant: ${tenant.name}`);

  // ── Step 5: Tenant Users ──────────────────────────────────────────────
  const owner = await prisma.user.upsert({
    where: { email: 'owner@demomotors.com' },
    update: {},
    create: {
      email: 'owner@demomotors.com',
      name: 'Dealership Owner',
      password: hashedPassword,
      role: 'OWNER',
      tenantId: tenant.id,
      phone: '+91-9876543210',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@demomotors.com' },
    update: {},
    create: {
      email: 'manager@demomotors.com',
      name: 'Arjun Singh (Sales Manager)',
      password: hashedPassword,
      role: 'MANAGER',
      tenantId: tenant.id,
      phone: '+91-9876543211',
    },
  });

  const salesExec = await prisma.user.upsert({
    where: { email: 'sales@demomotors.com' },
    update: {},
    create: {
      email: 'sales@demomotors.com',
      name: 'Pooja Verma (Sales Exec)',
      password: hashedPassword,
      role: 'SALES_EXEC',
      tenantId: tenant.id,
      phone: '+91-9876543212',
    },
  });

  const accountant = await prisma.user.upsert({
    where: { email: 'accounts@demomotors.com' },
    update: {},
    create: {
      email: 'accounts@demomotors.com',
      name: 'Suresh Gupta (Accountant)',
      password: hashedPassword,
      role: 'ACCOUNTANT',
      tenantId: tenant.id,
    },
  });

  console.log(`✅ Users created: Owner, Manager, Sales Exec, Accountant`);

  // ── Step 6: Dealership Brands ─────────────────────────────────────────
  const ktmBrand = await prisma.dealershipBrand.upsert({
    where: { id: 'brand-ktm-demo' },
    update: {},
    create: {
      id: 'brand-ktm-demo',
      tenantId: tenant.id,
      brandName: 'KTM',
      brandType: 'BIKE',
    },
  });

  const triumphBrand = await prisma.dealershipBrand.upsert({
    where: { id: 'brand-triumph-demo' },
    update: {},
    create: {
      id: 'brand-triumph-demo',
      tenantId: tenant.id,
      brandName: 'Triumph',
      brandType: 'BIKE',
    },
  });

  console.log(`✅ Brands: KTM, Triumph`);

  // ── Step 7: Showroom Locations ────────────────────────────────────────
  await prisma.showroomLocation.createMany({
    skipDuplicates: true,
    data: [
      {
        tenantId: tenant.id,
        brandId: ktmBrand.id,
        locationName: 'Chinhat KTM Branch',
        address: 'Chinhat, Gomti Nagar, Lucknow - 226028',
        phone: '+91-9554762001',
        managerName: 'Amit Kumar',
      },
      {
        tenantId: tenant.id,
        brandId: ktmBrand.id,
        locationName: 'Ring Road KTM Branch',
        address: 'Ring Road, Lucknow - 226025',
        phone: '+91-9554762002',
        managerName: 'Rajesh Singh',
      },
      {
        tenantId: tenant.id,
        brandId: triumphBrand.id,
        locationName: 'Vibhuti Khand Triumph',
        address: 'Vibhuti Khand, Gomti Nagar, Lucknow - 226010',
        phone: '+91-9554762003',
        managerName: 'Priya Sharma',
      },
    ],
  });

  console.log(`✅ Showroom locations: 3 branches`);

  // ── Step 8: Vehicles (using correct schema fields) ────────────────────
  const vehicles = await prisma.$transaction([
    prisma.vehicle.create({
      data: {
        tenantId: tenant.id,
        brandId: ktmBrand.id,
        model: 'KTM Duke 390',
        variant: 'Standard',
        color: 'Orange',
        chassisNo: 'KTM390001DEMO',
        engineNo: 'ENG-KTM-001',
        price: 295000,
        status: 'AVAILABLE',
      },
    }),
    prisma.vehicle.create({
      data: {
        tenantId: tenant.id,
        brandId: ktmBrand.id,
        model: 'KTM RC 390',
        variant: 'Track Edition',
        color: 'White Black',
        chassisNo: 'KTMRC390002DEMO',
        engineNo: 'ENG-KTM-002',
        price: 325000,
        status: 'AVAILABLE',
      },
    }),
    prisma.vehicle.create({
      data: {
        tenantId: tenant.id,
        brandId: triumphBrand.id,
        model: 'Triumph Speed 400',
        variant: 'Standard',
        color: 'Carnival Red',
        chassisNo: 'TRI400003DEMO',
        engineNo: 'ENG-TRI-003',
        price: 229900,
        status: 'AVAILABLE',
      },
    }),
    prisma.vehicle.create({
      data: {
        tenantId: tenant.id,
        brandId: triumphBrand.id,
        model: 'Triumph Scrambler 400X',
        variant: 'X',
        color: 'Caspian Blue',
        chassisNo: 'TRISC400004DEMO',
        engineNo: 'ENG-TRI-004',
        price: 264900,
        status: 'BOOKED',
      },
    }),
  ]);

  console.log(`✅ Vehicles: ${vehicles.length} units added`);

  // ── Step 9: Sample Customers ──────────────────────────────────────────
  const customer1 = await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      name: 'Rahul Kumar',
      mobile: '9876543220',
      email: 'rahul.kumar@example.com',
      address: 'Indira Nagar, Lucknow',
      aadharNo: '1234-5678-9012',
      panNo: 'ABCDE1234F',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      name: 'Priya Sharma',
      mobile: '9876543221',
      email: 'priya.sharma@example.com',
      address: 'Aliganj, Lucknow',
    },
  });

  console.log(`✅ Customers: 2 added`);

  // ── Step 10: Sample Leads ─────────────────────────────────────────────
  await prisma.lead.createMany({
    data: [
      {
        tenantId: tenant.id,
        customerName: 'Vikram Tiwari',
        mobile: '9876543230',
        email: 'vikram@example.com',
        interestedModel: 'KTM Duke 390',
        source: 'WEBSITE',
        status: 'NEW',
        dealHealth: 'HOT',
        followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        assignedToId: salesExec.id,
        location: 'Gomti Nagar, Lucknow',
      },
      {
        tenantId: tenant.id,
        customerName: 'Anjali Mishra',
        mobile: '9876543231',
        email: 'anjali@example.com',
        interestedModel: 'Triumph Speed 400',
        source: 'REFERRAL',
        status: 'CONTACTED',
        dealHealth: 'WARM',
        followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        assignedToId: salesExec.id,
        location: 'Hazratganj, Lucknow',
      },
      {
        tenantId: tenant.id,
        customerName: 'Sanjay Yadav',
        mobile: '9876543232',
        interestedModel: 'KTM RC 390',
        source: 'WALK_IN',
        status: 'FOLLOWUP',
        dealHealth: 'WARM',
        assignedToId: manager.id,
        notes: 'Interested in finance option',
      },
      {
        tenantId: tenant.id,
        customerName: 'Neha Dubey',
        mobile: '9876543233',
        interestedModel: 'Triumph Scrambler 400X',
        source: 'INSTAGRAM',
        status: 'NEW',
        dealHealth: 'HOT',
        assignedToId: salesExec.id,
      },
    ],
  });

  console.log(`✅ Leads: 4 sample leads added`);

  // ── Step 11: Cash Transactions (INFLOW/OUTFLOW) ───────────────────────
  await prisma.cashTransaction.createMany({
    data: [
      {
        tenantId: tenant.id,
        type: 'INFLOW',
        amount: 50000,
        description: 'KTM Duke 390 — Booking Advance',
        category: 'SALES',
        mode: 'UPI',
      },
      {
        tenantId: tenant.id,
        type: 'INFLOW',
        amount: 22990,
        description: 'Service Job Card JC-001 — Payment',
        category: 'SERVICE',
        mode: 'CASH',
      },
      {
        tenantId: tenant.id,
        type: 'OUTFLOW',
        amount: 15000,
        description: 'Showroom rent — April 2026',
        category: 'RENT',
        mode: 'NEFT',
      },
      {
        tenantId: tenant.id,
        type: 'OUTFLOW',
        amount: 8500,
        description: 'Staff salaries advance',
        category: 'SALARY',
        mode: 'BANK_TRANSFER',
      },
    ],
  });

  console.log(`✅ Cash Transactions: 4 entries (2 inflow, 2 outflow)`);

  // ── Step 12: Sample Expense ───────────────────────────────────────────
  await prisma.expense.createMany({
    data: [
      {
        tenantId: tenant.id,
        amount: 3500,
        category: 'MARKETING',
        description: 'Instagram ads — April campaign',
        department: 'SALES',
      },
      {
        tenantId: tenant.id,
        amount: 1200,
        category: 'UTILITIES',
        description: 'Internet bill April',
        department: 'ADMIN',
      },
    ],
  });

  console.log(`✅ Expenses: 2 entries added`);

  // ── Step 13: Sample Job Card ──────────────────────────────────────────
  await prisma.jobCard.create({
    data: {
      tenantId: tenant.id,
      vehicleRegNo: 'UP32AB1234',
      customerName: 'Rohit Srivastava',
      customerMobile: '9876543250',
      complaints: 'Chain noise, front brake adjustment needed',
      diagnosis: 'Chain slack + brake pad worn',
      partsUsed: [
        { part: 'Chain Kit', qty: 1, price: 850 },
        { part: 'Brake Pads', qty: 2, price: 450 },
      ],
      labourCharge: 500,
      partsCharge: 1750,
      totalBilled: 2250,
      totalReceived: 2250,
      pendingAmount: 0,
      status: 'COMPLETED',
    },
  });

  console.log(`✅ Job Card: 1 sample service job added`);

  // ── Summary ───────────────────────────────────────────────────────────
  console.log(`\n${'='.repeat(55)}`);
  console.log(`🎉 Seeding completed!`);
  console.log(`${'='.repeat(55)}`);
  console.log(`\n🔑 Login Credentials (Password: admin123)`);
  console.log(`   Super Admin  →  admin@vaahan.com`);
  console.log(`   Owner        →  owner@demomotors.com`);
  console.log(`   Manager      →  manager@demomotors.com`);
  console.log(`   Sales Exec   →  sales@demomotors.com`);
  console.log(`   Accountant   →  accounts@demomotors.com`);
  console.log(`\n🏢 Demo Tenant ID: ${tenant.id}`);
  console.log(`   (Set this as DEFAULT_TENANT_ID in .env.local)`);
  console.log(`${'='.repeat(55)}\n`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e.message);
    await prisma.$disconnect();
    process.exit(1);
  });
