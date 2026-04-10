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

  // ── Blog Posts ────────────────────────────────────────────────────────
  const blogData = [
    {
      title: "Vehicle Dealership Mein ERP Kyun Zaruri Hai?",
      slug: "vehicle-dealership-mein-erp-kyun-zaruri-hai",
      excerpt: "Vehicle dealership chalana sirf vehicles bechne se zyada hai. VaahanERP se apna pura showroom automate karo — leads se delivery tak.",
      content: `<h2>Dealership Mein Problems Kya Hain?</h2><p>Aaj ke competitive market mein vehicle dealership chalana sirf vehicles bechne se kaafi zyada complicated ho gaya hai. Leads manage karna, test drives schedule karna, finance process, RTO documentation, service reminders — yeh sab manually manage karna almost impossible hai.</p><h2>ERP Kya Karta Hai?</h2><ul><li><strong>Lead Management:</strong> Incoming leads automatically capture aur assign hoti hain</li><li><strong>Inventory Tracking:</strong> Real-time vehicle stock visibility</li><li><strong>Finance & Loans:</strong> Bank tie-ups aur EMI calculations automated</li><li><strong>Service Department:</strong> Job cards, reminders, revenue tracking</li></ul><h2>Conclusion</h2><p>Agar aap apni dealership ko next level pe le jaana chahte hain, toh ERP sirf ek option nahi — yeh ek necessity ban gayi hai.</p>`,
      coverImage: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=450&fit=crop&q=80",
      published: true, featured: true, category: "Business Tips",
      tags: "ERP, dealership management, vehicle showroom, lead CRM, automation",
    },
    {
      title: "Bike Showroom Mein Lead Management: 5 Proven Tips",
      slug: "bike-showroom-lead-management-tips",
      excerpt: "Har din showroom mein 20-30 leads aati hain. 5 proven tips se apna conversion rate 25% se 40% tak badha sakte ho.",
      content: `<h2>Lead Management Kyun Important Hai?</h2><p>Ek typical bike showroom mein roz 20-30 inquiries aati hain. Inhe manually track karna impossible hai.</p><h2>5 Proven Tips</h2><ol><li><strong>Har Lead Ko Immediately Register Karo</strong></li><li><strong>Same Day Follow-Up Rule</strong></li><li><strong>WhatsApp Integration Use Karo</strong></li><li><strong>Lost Leads Ko Re-Engage Karo</strong></li><li><strong>Data Se Seekho</strong></li></ol><p>In 5 tips ko implement karne ke baad hamare customers ne average <strong>15% conversion improvement</strong> dekha hai.</p>`,
      coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=450&fit=crop&q=80",
      published: true, featured: false, category: "Sales",
      tags: "lead management, bike showroom, conversion, CRM, follow-up",
    },
    {
      title: "Vehicle Dealership Ka Cashflow Kaise Manage Karein",
      slug: "vehicle-dealership-cashflow-management",
      excerpt: "Profitable dealership bhi cash crunch mein aa sakti hai. Digital daybook se apna cashflow 100% accurate banao.",
      content: `<h2>Cashflow Problem Kyun Hoti Hai?</h2><p>Bahut se dealership owners sochte hain ki agar business profitable hai toh cash problem nahi hogi. Lekin reality alag hai.</p><h2>Digital Daybook Ke Fayde</h2><ul><li>Real-time cashflow visibility</li><li>Bank auto-reconciliation</li><li>GST tracking automated</li><li>30-day forecast projections</li></ul>`,
      coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop&q=80",
      published: true, featured: true, category: "Finance",
      tags: "cashflow, daybook, dealership accounting, payments, finance",
    },
    {
      title: "Service Workshop Management: Job Cards Se Revenue Kaise Badhayein",
      slug: "service-workshop-job-cards-revenue",
      excerpt: "Service department sirf repair ka kaam nahi, yeh consistent revenue source hai. Digital job cards se revenue 30% badhaiye.",
      content: `<h2>Service Department Ki Importance</h2><p>Vehicle dealership mein service department year-round consistent revenue generate karta hai — total revenue ka 30-40%.</p><h2>Digital Job Cards Ke Fayde</h2><ul><li>Customer real-time updates</li><li>Mechanic accountability tracking</li><li>Auto-order parts management</li><li>Upselling recommendations</li><li>Billing accuracy 100%</li></ul>`,
      coverImage: "https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800&h=450&fit=crop&q=80",
      published: true, featured: false, category: "Service",
      tags: "service workshop, job cards, mechanic, revenue, vehicle service",
    },
    {
      title: "WhatsApp CRM: Dealership Leads Ko Convert Karne Ka Sabse Fast Tarika",
      slug: "whatsapp-crm-dealership-leads-convert",
      excerpt: "India mein 90% buyers WhatsApp use karte hain. WhatsApp CRM se response time 2 ghante se 10 minute karo aur conversion 35% badhao.",
      content: `<h2>WhatsApp India Ka #1 Communication Tool</h2><p>India mein 500 million se zyada WhatsApp users hain. 5 minute ke andar reply → 9x higher conversion chance. VaahanERP ka built-in WhatsApp integration yeh sab ek dashboard se manage karta hai.</p>`,
      coverImage: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=450&fit=crop&q=80",
      published: true, featured: false, category: "Technology",
      tags: "WhatsApp CRM, lead conversion, automation, dealership, communication",
    },
    {
      title: "RTO Documentation: Vehicle Delivery Process Streamline Kaise Karein",
      slug: "rto-documentation-vehicle-delivery-process",
      excerpt: "RTO documentation aur delivery delays se customer frustration hota hai. Digital document management se delivery process 50% fast karein.",
      content: `<h2>RTO Documentation Ka Problem</h2><p>Vehicle delivery mein sabse zyada delay RTO documentation mein hoti hai. Digital documentation se delivery time 7 days se 3 days, documentation errors 0%, customer satisfaction 85% se 95%.</p>`,
      coverImage: "https://images.unsplash.com/photo-1568599104766-6f7c7775bef8?w=800&h=450&fit=crop&q=80",
      published: true, featured: false, category: "Business Tips",
      tags: "RTO, documentation, delivery, vehicle registration, paperwork",
    },
  ];

  for (const post of blogData) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: { coverImage: post.coverImage },
      create: post,
    });
  }
  console.log(`✅ Blog Posts: ${blogData.length} posts seeded with images`);

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
