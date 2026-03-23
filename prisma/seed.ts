import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding VaahanERP database...');

  // Create Super Admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@vaahan.com' },
    update: {},
    create: {
      email: 'admin@vaahan.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  console.log(`✅ Super Admin created: ${superAdmin.email}`);

  // Create sample tenant (dealership)
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-motors' },
    update: {},
    create: {
      name: 'Demo Motors',
      slug: 'demo-motors',
      plan: 'PROFESSIONAL',
      status: 'ACTIVE',
      dealershipType: 'MULTI',
      address: 'Lucknow, UP, India',
      phone: '+91-9876543210',
      email: 'demo@demomotors.com',
      gst: 'DEMO123456789',
    },
  });

  console.log(`✅ Demo tenant created: ${tenant.name}`);

  // Create tenant owner
  const owner = await prisma.user.upsert({
    where: { email: 'owner@demomotors.com' },
    update: {},
    create: {
      email: 'owner@demomotors.com',
      name: 'Dealership Owner',
      password: hashedPassword,
      role: 'OWNER',
      tenantId: tenant.id,
    },
  });

  console.log(`✅ Tenant owner created: ${owner.email}`);

  // Create sample staff
  const manager = await prisma.user.create({
    data: {
      email: 'manager@demomotors.com',
      name: 'Sales Manager',
      password: hashedPassword,
      role: 'MANAGER',
      tenantId: tenant.id,
    },
  });

  const salesExec = await prisma.user.create({
    data: {
      email: 'sales@demomotors.com',
      name: 'Sales Executive',
      password: hashedPassword,
      role: 'SALES_EXEC',
      tenantId: tenant.id,
    },
  });

  console.log(`✅ Staff created: Manager & Sales Executive`);

  // Create sample vehicles
  const vehicles = [
    {
      make: 'Honda',
      model: 'City',
      variant: 'VX CVT',
      year: 2024,
      color: 'Pearl White',
      chassisNumber: 'HCITY001',
      engineNumber: 'ENG001',
      fuelType: 'PETROL',
      transmission: 'AUTOMATIC',
      price: 1450000,
      status: 'AVAILABLE',
      vehicleType: 'CAR',
    },
    {
      make: 'Hero',
      model: 'Splendor Plus',
      variant: 'Standard',
      year: 2024,
      color: 'Black Red',
      chassisNumber: 'HSPLR002',
      engineNumber: 'ENG002',
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      price: 85000,
      status: 'AVAILABLE',
      vehicleType: 'BIKE',
    },
    {
      make: 'Tata',
      model: 'Nexon EV',
      variant: 'Max',
      year: 2024,
      color: 'Kaziranga Green',
      chassisNumber: 'TNEXON003',
      engineNumber: 'EV003',
      fuelType: 'ELECTRIC',
      transmission: 'AUTOMATIC',
      price: 1799000,
      status: 'AVAILABLE',
      vehicleType: 'EV',
    },
  ];

  for (const vehicle of vehicles) {
    await prisma.vehicle.create({
      data: {
        ...vehicle,
        tenantId: tenant.id,
      },
    });
  }

  console.log(`✅ Sample vehicles created: ${vehicles.length} vehicles`);

  // Create sample brands (KTM, Triumph)
  const ktmBrand = await prisma.dealershipBrand.create({
    data: {
      tenantId: tenant.id,
      brandName: 'KTM',
      brandType: 'BIKE',
    },
  });

  const triumphBrand = await prisma.dealershipBrand.create({
    data: {
      tenantId: tenant.id,
      brandName: 'Triumph',
      brandType: 'BIKE',
    },
  });

  console.log(`✅ Sample brands created: KTM, Triumph`);

  // Create showroom locations
  await prisma.showroomLocation.createMany({
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
        locationName: 'Vibhuti Khand Triumph Branch',
        address: 'Vibhuti Khand, Gomti Nagar, Lucknow - 226010',
        phone: '+91-9554762003',
        managerName: 'Priya Sharma',
      },
    ],
  });

  console.log(`✅ Sample showroom locations created`);

  // Create sample leads
  const leads = [
    {
      customerName: 'Rahul Kumar',
      mobile: '9876543210',
      email: 'rahul@example.com',
      interestedModel: 'Honda City',
      leadSource: 'WEBSITE',
      status: 'NEW',
      dealHealth: 'HOT',
      followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days later
      assignedToId: salesExec.id,
    },
    {
      customerName: 'Priya Sharma',
      mobile: '9876543211',
      email: 'priya@example.com',
      interestedModel: 'Hero Splendor Plus',
      leadSource: 'REFERRAL',
      status: 'CONTACTED',
      dealHealth: 'WARM',
      followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day later
      assignedToId: salesExec.id,
    },
  ];

  for (const lead of leads) {
    await prisma.lead.create({
      data: {
        ...lead,
        tenantId: tenant.id,
      },
    });
  }

  console.log(`✅ Sample leads created: ${leads.length} leads`);

  // Create sample cash transactions
  await prisma.cashTransaction.create({
    data: {
      type: 'INCOME',
      amount: 50000,
      description: 'Vehicle booking advance - Honda City',
      category: 'SALES',
      date: new Date(),
      tenantId: tenant.id,
      createdById: owner.id,
    },
  });

  await prisma.cashTransaction.create({
    data: {
      type: 'EXPENSE',
      amount: 15000,
      description: 'Office rent payment',
      category: 'OFFICE',
      date: new Date(),
      tenantId: tenant.id,
      createdById: owner.id,
    },
  });

  console.log(`✅ Sample cash transactions created`);

  console.log(`🎉 Seeding completed successfully!`);
  console.log(`\n📋 Login Credentials:`);
  console.log(`Super Admin: admin@vaahan.com / admin123`);
  console.log(`Owner: owner@demomotors.com / admin123`);
  console.log(`Manager: manager@demomotors.com / admin123`);
  console.log(`Sales: sales@demomotors.com / admin123`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });