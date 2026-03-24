import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding VaahanERP database...\n');

  // ── 1. PLATFORM TENANT (Super Admin) ────────────────────────────────
  const platform = await prisma.tenant.upsert({
    where: { slug: 'vaahan-platform' },
    update: {},
    create: {
      id: 'tenant-platform',
      name: 'VaahanERP Platform',
      slug: 'vaahan-platform',
      plan: 'ENTERPRISE',
      status: 'ACTIVE',
      dealershipType: 'MULTI',
    },
  });
  console.log('✅ Platform tenant:', platform.id);

  // Super Admin user
  await prisma.user.upsert({
    where: { email: 'superadmin@vaahan.com' },
    update: {},
    create: {
      id: 'user-super-admin',
      tenantId: platform.id,
      name: 'Ravi (Super Admin)',
      email: 'superadmin@vaahan.com',
      password: 'super123',
      phone: '9554762008',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ Super Admin: superadmin@vaahan.com / super123');

  // ── 2. BIKE DEALERSHIP ──────────────────────────────────────────────
  const bikeTenant = await prisma.tenant.upsert({
    where: { slug: 'shri-bajrang-motors' },
    update: {},
    create: {
      name: 'Shri Bajrang Motors',
      slug: 'shri-bajrang-motors',
      plan: 'PROFESSIONAL',
      status: 'ACTIVE',
      dealershipType: 'BIKE',
      address: 'Chinhat, Lucknow, UP - 226028',
      phone: '9876543210',
      email: 'owner@bajrangmotors.com',
      gst: '09ABCDE1234F1Z5',
    },
  });
  console.log('✅ Bike Dealership:', bikeTenant.name);

  const bikeOwner = await prisma.user.upsert({
    where: { email: 'owner@bajrangmotors.com' },
    update: {},
    create: {
      tenantId: bikeTenant.id,
      name: 'Rajesh Bajrang',
      email: 'owner@bajrangmotors.com',
      password: 'owner123',
      phone: '9876543210',
      role: 'OWNER',
    },
  });

  const bikeSales = await prisma.user.upsert({
    where: { email: 'sales@bajrangmotors.com' },
    update: {},
    create: {
      tenantId: bikeTenant.id,
      name: 'Amit Sharma',
      email: 'sales@bajrangmotors.com',
      password: 'sales123',
      phone: '9876543211',
      role: 'SALES_EXEC',
    },
  });

  const bikeMechanic = await prisma.user.upsert({
    where: { email: 'mechanic@bajrangmotors.com' },
    update: {},
    create: {
      tenantId: bikeTenant.id,
      name: 'Deepak Yadav',
      email: 'mechanic@bajrangmotors.com',
      password: 'mechanic123',
      phone: '9876543212',
      role: 'MECHANIC',
    },
  });
  console.log('  Users: owner, sales, mechanic');

  // Bike Brands + Locations
  const heroBrand = await prisma.dealershipBrand.create({
    data: { tenantId: bikeTenant.id, brandName: 'Hero', brandType: 'BIKE' },
  });
  await prisma.showroomLocation.createMany({
    data: [
      { tenantId: bikeTenant.id, brandId: heroBrand.id, locationName: 'Chinhat Branch', address: 'Chinhat, Lucknow', city: 'Lucknow', state: 'UP', phone: '9876543210' },
      { tenantId: bikeTenant.id, brandId: heroBrand.id, locationName: 'Gomti Nagar Branch', address: 'Gomti Nagar, Lucknow', city: 'Lucknow', state: 'UP', phone: '9876543213' },
    ],
  });

  const bajajBrand = await prisma.dealershipBrand.create({
    data: { tenantId: bikeTenant.id, brandName: 'Bajaj', brandType: 'BIKE' },
  });
  await prisma.showroomLocation.create({
    data: { tenantId: bikeTenant.id, brandId: bajajBrand.id, locationName: 'Alambagh Branch', address: 'Alambagh, Lucknow', city: 'Lucknow', state: 'UP' },
  });
  console.log('  Brands: Hero (2 locations), Bajaj (1 location)');

  // Bike Vehicles
  const bikeVehicles = await Promise.all([
    prisma.vehicle.create({ data: { tenantId: bikeTenant.id, model: 'Hero Splendor+', variant: 'Kick', color: 'Black', engineNo: 'HSPLK001', chassisNo: 'CHSPLK001', price: 78000, status: 'AVAILABLE', brandId: heroBrand.id } }),
    prisma.vehicle.create({ data: { tenantId: bikeTenant.id, model: 'Hero Splendor+', variant: 'Self', color: 'Red', engineNo: 'HSPLS002', chassisNo: 'CHSPLS002', price: 82000, status: 'AVAILABLE', brandId: heroBrand.id } }),
    prisma.vehicle.create({ data: { tenantId: bikeTenant.id, model: 'Hero HF Deluxe', variant: 'Kick', color: 'Silver', engineNo: 'HHFD003', chassisNo: 'CHHFD003', price: 65000, status: 'AVAILABLE', brandId: heroBrand.id } }),
    prisma.vehicle.create({ data: { tenantId: bikeTenant.id, model: 'Hero Glamour', variant: 'Disc', color: 'Blue', engineNo: 'HGLM004', chassisNo: 'CHGLM004', price: 95000, status: 'BOOKED', brandId: heroBrand.id } }),
    prisma.vehicle.create({ data: { tenantId: bikeTenant.id, model: 'Hero Xtreme 160R', variant: 'Connected', color: 'Matte Black', engineNo: 'HXTR005', chassisNo: 'CHXTR005', price: 135000, status: 'AVAILABLE', brandId: heroBrand.id } }),
    prisma.vehicle.create({ data: { tenantId: bikeTenant.id, model: 'Bajaj Pulsar 150', variant: 'Disc', color: 'Red', engineNo: 'BPLS006', chassisNo: 'CBPLS006', price: 112000, status: 'SOLD', brandId: bajajBrand.id } }),
    prisma.vehicle.create({ data: { tenantId: bikeTenant.id, model: 'Bajaj Pulsar NS200', variant: 'ABS', color: 'White', engineNo: 'BPNS007', chassisNo: 'CBPNS007', price: 145000, status: 'AVAILABLE', brandId: bajajBrand.id } }),
    prisma.vehicle.create({ data: { tenantId: bikeTenant.id, model: 'Bajaj Platina 110', variant: 'H Gear', color: 'Black', engineNo: 'BPLT008', chassisNo: 'CBPLT008', price: 72000, status: 'AVAILABLE', brandId: bajajBrand.id } }),
  ]);
  console.log('  Vehicles: 8 bikes');

  // Bike Customers
  const bikeCustomers = await Promise.all([
    prisma.customer.create({ data: { tenantId: bikeTenant.id, name: 'Suresh Kumar', mobile: '9111111001', email: 'suresh@email.com', address: 'Aliganj, Lucknow' } }),
    prisma.customer.create({ data: { tenantId: bikeTenant.id, name: 'Mohd Irfan', mobile: '9111111002', address: 'Aminabad, Lucknow' } }),
    prisma.customer.create({ data: { tenantId: bikeTenant.id, name: 'Priya Verma', mobile: '9111111003', email: 'priya@email.com', address: 'Gomti Nagar, Lucknow' } }),
    prisma.customer.create({ data: { tenantId: bikeTenant.id, name: 'Ramu Kaka', mobile: '9111111004', address: 'Chinhat, Lucknow' } }),
    prisma.customer.create({ data: { tenantId: bikeTenant.id, name: 'Ankit Mishra', mobile: '9111111005', email: 'ankit@email.com', address: 'Hazratganj, Lucknow' } }),
  ]);
  console.log('  Customers: 5');

  // Bike Bookings
  const bikeBooking1 = await prisma.booking.create({
    data: {
      tenantId: bikeTenant.id, customerId: bikeCustomers[0].id, vehicleId: bikeVehicles[3].id,
      salesExecId: bikeSales.id, status: 'CONFIRMED', step: 3,
      totalAmount: 95000, paidAmount: 20000, pendingAmount: 75000,
    },
  });
  await prisma.bookingPayment.create({
    data: { bookingId: bikeBooking1.id, amount: 20000, mode: 'CASH', reference: 'Advance booking', receivedBy: bikeSales.name },
  });

  const bikeBooking2 = await prisma.booking.create({
    data: {
      tenantId: bikeTenant.id, customerId: bikeCustomers[1].id, vehicleId: bikeVehicles[5].id,
      salesExecId: bikeSales.id, status: 'DELIVERED', step: 5,
      totalAmount: 112000, paidAmount: 112000, pendingAmount: 0,
    },
  });
  await prisma.bookingPayment.createMany({
    data: [
      { bookingId: bikeBooking2.id, amount: 50000, mode: 'CASH', reference: 'Advance', receivedBy: bikeSales.name },
      { bookingId: bikeBooking2.id, amount: 62000, mode: 'UPI', reference: 'Final payment', receivedBy: bikeSales.name },
    ],
  });

  const bikeBooking3 = await prisma.booking.create({
    data: {
      tenantId: bikeTenant.id, customerId: bikeCustomers[2].id,
      salesExecId: bikeSales.id, status: 'DRAFT', step: 1,
      totalAmount: 135000, paidAmount: 5000, pendingAmount: 130000,
    },
  });
  await prisma.bookingPayment.create({
    data: { bookingId: bikeBooking3.id, amount: 5000, mode: 'UPI', reference: 'Token amount' },
  });
  console.log('  Bookings: 3');

  // Bike Leads
  await prisma.lead.createMany({
    data: [
      { tenantId: bikeTenant.id, customerName: 'Vikas Tiwari', mobile: '9222222001', interestedModel: 'Hero Xtreme 160R', source: 'Walk-in', status: 'NEW', dealHealth: 'HOT', assignedToId: bikeSales.id, notes: 'Budget 1.5L, wants connected variant' },
      { tenantId: bikeTenant.id, customerName: 'Rakesh Pal', mobile: '9222222002', interestedModel: 'Bajaj Pulsar NS200', source: 'Phone', status: 'CONTACTED', dealHealth: 'WARM', assignedToId: bikeSales.id, notes: 'Comparing with Apache' },
      { tenantId: bikeTenant.id, customerName: 'Sita Devi', mobile: '9222222003', interestedModel: 'Hero Splendor+', source: 'Referral', status: 'FOLLOWUP', dealHealth: 'HOT', assignedToId: bikeSales.id, notes: 'Son ka bike chahiye' },
      { tenantId: bikeTenant.id, customerName: 'Govind Singh', mobile: '9222222004', interestedModel: 'Hero HF Deluxe', source: 'Walk-in', status: 'NEW', dealHealth: 'COLD', notes: 'Just enquiry' },
      { tenantId: bikeTenant.id, customerName: 'Alok Pandey', mobile: '9222222005', interestedModel: 'Bajaj Platina 110', source: 'Online', status: 'CONTACTED', dealHealth: 'WARM', assignedToId: bikeSales.id },
      { tenantId: bikeTenant.id, customerName: 'Farhan Ali', mobile: '9222222006', interestedModel: 'Hero Glamour', source: 'Walk-in', status: 'CONVERTED', dealHealth: 'HOT', assignedToId: bikeSales.id, convertedToBookingId: bikeBooking1.id },
    ],
  });
  console.log('  Leads: 6');

  // Bike Expenses
  await prisma.expense.createMany({
    data: [
      { tenantId: bikeTenant.id, amount: 15000, category: 'Rent', description: 'Monthly rent - Chinhat branch', date: new Date('2026-03-01') },
      { tenantId: bikeTenant.id, amount: 3500, category: 'Electricity', description: 'March electricity bill', date: new Date('2026-03-05') },
      { tenantId: bikeTenant.id, amount: 8000, category: 'Salary', description: 'Helper salary', date: new Date('2026-03-01') },
      { tenantId: bikeTenant.id, amount: 2000, category: 'Maintenance', description: 'AC repair', date: new Date('2026-03-10') },
      { tenantId: bikeTenant.id, amount: 5000, category: 'Marketing', description: 'Pamphlet printing', date: new Date('2026-03-15') },
    ],
  });
  console.log('  Expenses: 5');

  // Bike Job Cards
  await prisma.jobCard.createMany({
    data: [
      { tenantId: bikeTenant.id, vehicleRegNo: 'UP32AB1234', customerName: 'Ramesh Kumar', customerMobile: '9333333001', complaints: 'Engine noise, oil leak', diagnosis: 'Piston ring worn', labourCharge: 500, partsCharge: 1200, totalBilled: 1700, totalReceived: 1700, pendingAmount: 0, status: 'COMPLETED', mechanicId: bikeMechanic.id },
      { tenantId: bikeTenant.id, vehicleRegNo: 'UP32CD5678', customerName: 'Shyam Lal', customerMobile: '9333333002', complaints: 'Brake not working', diagnosis: 'Brake pad replacement', labourCharge: 300, partsCharge: 800, totalBilled: 1100, totalReceived: 500, pendingAmount: 600, status: 'IN_PROGRESS', mechanicId: bikeMechanic.id },
      { tenantId: bikeTenant.id, vehicleRegNo: 'UP32EF9012', customerName: 'Geeta Devi', customerMobile: '9333333003', complaints: 'First free service', status: 'OPEN', mechanicId: bikeMechanic.id },
    ],
  });
  console.log('  Job Cards: 3');

  // ── 3. CAR DEALERSHIP ───────────────────────────────────────────────
  const carTenant = await prisma.tenant.upsert({
    where: { slug: 'sharma-cars' },
    update: {},
    create: {
      name: 'Sharma Cars',
      slug: 'sharma-cars',
      plan: 'PROFESSIONAL',
      status: 'ACTIVE',
      dealershipType: 'CAR',
      address: 'Kanpur Road, Lucknow, UP - 226012',
      phone: '9988776655',
      email: 'owner@sharmacars.com',
      gst: '09XYZAB5678C2D3',
    },
  });
  console.log('\n✅ Car Dealership:', carTenant.name);

  const carOwner = await prisma.user.upsert({
    where: { email: 'owner@sharmacars.com' },
    update: {},
    create: {
      tenantId: carTenant.id, name: 'Vinod Sharma',
      email: 'owner@sharmacars.com', password: 'owner123',
      phone: '9988776655', role: 'OWNER',
    },
  });

  const carSales = await prisma.user.upsert({
    where: { email: 'sales@sharmacars.com' },
    update: {},
    create: {
      tenantId: carTenant.id, name: 'Rohit Gupta',
      email: 'sales@sharmacars.com', password: 'sales123',
      phone: '9988776656', role: 'SALES_EXEC',
    },
  });
  console.log('  Users: owner, sales');

  // Car Brands
  const marutiBrand = await prisma.dealershipBrand.create({
    data: { tenantId: carTenant.id, brandName: 'Maruti Suzuki', brandType: 'CAR' },
  });
  await prisma.showroomLocation.create({
    data: { tenantId: carTenant.id, brandId: marutiBrand.id, locationName: 'Kanpur Road Showroom', address: 'Kanpur Road, Lucknow', city: 'Lucknow', state: 'UP', phone: '9988776655' },
  });

  const hyundaiBrand = await prisma.dealershipBrand.create({
    data: { tenantId: carTenant.id, brandName: 'Hyundai', brandType: 'CAR' },
  });
  await prisma.showroomLocation.create({
    data: { tenantId: carTenant.id, brandId: hyundaiBrand.id, locationName: 'Faizabad Road Showroom', address: 'Faizabad Road, Lucknow', city: 'Lucknow', state: 'UP', phone: '9988776657' },
  });
  console.log('  Brands: Maruti Suzuki, Hyundai');

  // Car Vehicles
  const carVehicles = await Promise.all([
    prisma.vehicle.create({ data: { tenantId: carTenant.id, model: 'Maruti Swift', variant: 'VXI', color: 'Pearl White', engineNo: 'MSWFT001', chassisNo: 'CMSWFT001', price: 720000, status: 'AVAILABLE', brandId: marutiBrand.id } }),
    prisma.vehicle.create({ data: { tenantId: carTenant.id, model: 'Maruti Baleno', variant: 'Alpha', color: 'Nexa Blue', engineNo: 'MBLEN002', chassisNo: 'CMBLEN002', price: 980000, status: 'AVAILABLE', brandId: marutiBrand.id } }),
    prisma.vehicle.create({ data: { tenantId: carTenant.id, model: 'Maruti Ertiga', variant: 'VXI CNG', color: 'Silver', engineNo: 'MERTG003', chassisNo: 'CMERTG003', price: 1050000, status: 'BOOKED', brandId: marutiBrand.id } }),
    prisma.vehicle.create({ data: { tenantId: carTenant.id, model: 'Hyundai Creta', variant: 'SX(O)', color: 'Phantom Black', engineNo: 'HCRET004', chassisNo: 'CHCRET004', price: 1750000, status: 'AVAILABLE', brandId: hyundaiBrand.id } }),
    prisma.vehicle.create({ data: { tenantId: carTenant.id, model: 'Hyundai Venue', variant: 'S(O)', color: 'Fiery Red', engineNo: 'HVENU005', chassisNo: 'CHVENU005', price: 1100000, status: 'SOLD', brandId: hyundaiBrand.id } }),
    prisma.vehicle.create({ data: { tenantId: carTenant.id, model: 'Hyundai i20', variant: 'Asta', color: 'Titan Grey', engineNo: 'HI20006', chassisNo: 'CHI20006', price: 1050000, status: 'AVAILABLE', brandId: hyundaiBrand.id } }),
  ]);
  console.log('  Vehicles: 6 cars');

  // Car Customers
  const carCustomers = await Promise.all([
    prisma.customer.create({ data: { tenantId: carTenant.id, name: 'Dr. Arun Mishra', mobile: '9444444001', email: 'arun@email.com', address: 'Gomti Nagar, Lucknow', panNo: 'ABCPM1234F' } }),
    prisma.customer.create({ data: { tenantId: carTenant.id, name: 'Neeta Singh', mobile: '9444444002', address: 'Indira Nagar, Lucknow' } }),
    prisma.customer.create({ data: { tenantId: carTenant.id, name: 'Pankaj Agarwal', mobile: '9444444003', email: 'pankaj@email.com', address: 'Aliganj, Lucknow', panNo: 'DEFPA5678G' } }),
  ]);

  // Car Bookings
  const carBooking1 = await prisma.booking.create({
    data: {
      tenantId: carTenant.id, customerId: carCustomers[0].id, vehicleId: carVehicles[2].id,
      salesExecId: carSales.id, status: 'CONFIRMED', step: 3,
      totalAmount: 1050000, paidAmount: 200000, pendingAmount: 850000,
      financeProvider: 'SBI', loanAmount: 800000, loanStatus: 'APPROVED',
    },
  });
  await prisma.bookingPayment.create({
    data: { bookingId: carBooking1.id, amount: 200000, mode: 'NEFT', reference: 'SBI NEFT advance' },
  });

  const carBooking2 = await prisma.booking.create({
    data: {
      tenantId: carTenant.id, customerId: carCustomers[1].id, vehicleId: carVehicles[4].id,
      salesExecId: carSales.id, status: 'DELIVERED', step: 5,
      totalAmount: 1100000, paidAmount: 1100000, pendingAmount: 0,
    },
  });
  await prisma.bookingPayment.createMany({
    data: [
      { bookingId: carBooking2.id, amount: 300000, mode: 'CASH' },
      { bookingId: carBooking2.id, amount: 800000, mode: 'LOAN', reference: 'HDFC Car Loan' },
    ],
  });
  console.log('  Bookings: 2');

  // Car Leads
  await prisma.lead.createMany({
    data: [
      { tenantId: carTenant.id, customerName: 'Manoj Tripathi', mobile: '9555555001', interestedModel: 'Hyundai Creta', source: 'Walk-in', status: 'NEW', dealHealth: 'HOT', assignedToId: carSales.id, notes: 'Want SX(O) diesel, budget 18L' },
      { tenantId: carTenant.id, customerName: 'Sunita Rani', mobile: '9555555002', interestedModel: 'Maruti Swift', source: 'Online', status: 'CONTACTED', dealHealth: 'WARM', assignedToId: carSales.id },
      { tenantId: carTenant.id, customerName: 'Ajay Dwivedi', mobile: '9555555003', interestedModel: 'Maruti Ertiga', source: 'Referral', status: 'FOLLOWUP', dealHealth: 'HOT', assignedToId: carSales.id, notes: 'Family car, CNG preference' },
    ],
  });
  console.log('  Leads: 3');

  // Car Expenses
  await prisma.expense.createMany({
    data: [
      { tenantId: carTenant.id, amount: 50000, category: 'Rent', description: 'Monthly showroom rent', date: new Date('2026-03-01') },
      { tenantId: carTenant.id, amount: 12000, category: 'Electricity', description: 'March electricity', date: new Date('2026-03-05') },
      { tenantId: carTenant.id, amount: 25000, category: 'Marketing', description: 'Newspaper ad + hoardings', date: new Date('2026-03-10') },
    ],
  });
  console.log('  Expenses: 3');

  console.log('\n══════════════════════════════════════════');
  console.log('🎉 SEEDING COMPLETE!');
  console.log('══════════════════════════════════════════');
  console.log('\n📋 Login Credentials:');
  console.log('🔴 Super Admin:   superadmin@vaahan.com / super123');
  console.log('🏍️  Bike Owner:    owner@bajrangmotors.com / owner123');
  console.log('🏍️  Bike Sales:    sales@bajrangmotors.com / sales123');
  console.log('🏍️  Bike Mechanic: mechanic@bajrangmotors.com / mechanic123');
  console.log('🚗 Car Owner:     owner@sharmacars.com / owner123');
  console.log('🚗 Car Sales:     sales@sharmacars.com / sales123\n');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
