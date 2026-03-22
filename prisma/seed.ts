/**
 * VaahanERP Seed Script
 *
 * Creates demo data for development/testing:
 * 1. Super Admin tenant + user
 * 2. Demo dealership "Vaahan Motors"
 * 3. Demo users for each role
 * 4. Sample vehicles (10 bikes)
 * 5. Sample leads (15)
 * 6. Sample bookings (5)
 * 7. Sample customers (10)
 * 8. Default permissions
 * 9. Default expense heads
 *
 * Usage: npx prisma db seed
 */

// Note: This seed script is a template. It requires @prisma/client
// and a matching schema. For now it serves as documentation and
// can be adapted once the database is connected.

interface SeedUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  tenantId: string;
}

interface SeedVehicle {
  model: string;
  variant: string;
  color: string;
  engineNo: string;
  chassisNo: string;
  price: number;
  status: string;
}

interface SeedLead {
  name: string;
  phone: string;
  model: string;
  status: string;
  source: string;
}

interface SeedBooking {
  customerId: string;
  vehicleId: string;
  amount: number;
  status: string;
}

interface SeedCustomer {
  name: string;
  phone: string;
  email: string;
  address: string;
}

// ── Tenants ───────────────────────────────────────────────────────────────

const tenants = [
  { id: "tenant-platform", name: "VaahanERP Platform", plan: "SUPER_ADMIN" },
  { id: "tenant-vaahan-motors", name: "Vaahan Motors", plan: "PRO" },
];

// ── Users ────────────────────────────────────────────────────────────────

const users: SeedUser[] = [
  { id: "user-super-admin", name: "Super Admin", email: "superadmin@vaahan.com", password: "admin123", role: "SUPER_ADMIN", tenantId: "tenant-platform" },
  { id: "user-owner", name: "Ravi Kumar", email: "owner@vaahan.com", password: "owner123", role: "OWNER", tenantId: "tenant-vaahan-motors" },
  { id: "user-manager", name: "Amit Singh", email: "manager@vaahan.com", password: "manager123", role: "MANAGER", tenantId: "tenant-vaahan-motors" },
  { id: "user-sales", name: "Priya Sharma", email: "sales@vaahan.com", password: "sales123", role: "SALES_EXEC", tenantId: "tenant-vaahan-motors" },
  { id: "user-accountant", name: "Suresh Gupta", email: "accounts@vaahan.com", password: "accounts123", role: "ACCOUNTANT", tenantId: "tenant-vaahan-motors" },
  { id: "user-mechanic", name: "Deepak Yadav", email: "mechanic@vaahan.com", password: "mechanic123", role: "MECHANIC", tenantId: "tenant-vaahan-motors" },
  { id: "user-viewer", name: "Viewer User", email: "viewer@vaahan.com", password: "viewer123", role: "VIEWER", tenantId: "tenant-vaahan-motors" },
];

// ── Vehicles ─────────────────────────────────────────────────────────────

const vehicles: SeedVehicle[] = [
  { model: "Hero Splendor Plus", variant: "Drum Self", color: "Black with Silver", engineNo: "HA12E-2401001", chassisNo: "MBLJA12AMH-A00001", price: 76500, status: "Available" },
  { model: "Honda Activa 6G", variant: "STD", color: "Pearl White", engineNo: "JF81E-2401002", chassisNo: "ME4JF814-L00001", price: 78000, status: "Available" },
  { model: "Bajaj Pulsar 150", variant: "Twin Disc", color: "Neon Blue", engineNo: "DTSIE-2401003", chassisNo: "MD2DHDH2ZP-00001", price: 112000, status: "Booked" },
  { model: "TVS Apache RTR 160", variant: "4V", color: "Racing Red", engineNo: "RT160-2401004", chassisNo: "MD634KD21P-00001", price: 118000, status: "Available" },
  { model: "Royal Enfield Classic 350", variant: "Chrome", color: "Chrome Bronze", engineNo: "RE350-2401005", chassisNo: "ME3KB1AE0P-00001", price: 198000, status: "Available" },
  { model: "Honda SP 125", variant: "Disc", color: "Matte Black", engineNo: "JF80E-2401006", chassisNo: "ME4JF80-L00006", price: 92000, status: "Sold" },
  { model: "Hero HF Deluxe", variant: "i3S", color: "Heavy Grey", engineNo: "HA11F-2401007", chassisNo: "MBLJAD11-A00007", price: 62000, status: "Available" },
  { model: "Honda Shine", variant: "Drum", color: "Athletic Blue", engineNo: "JF81E-2401008", chassisNo: "ME4JF81-L00008", price: 82000, status: "Available" },
  { model: "Bajaj CT 110", variant: "KS", color: "Matte Olive Green", engineNo: "CT110-2401009", chassisNo: "MD2DGDG2-00009", price: 58000, status: "Available" },
  { model: "TVS Jupiter", variant: "Classic", color: "Titanium Grey", engineNo: "TVJ11-2401010", chassisNo: "MD634JJ22-00010", price: 75000, status: "Booked" },
];

// ── Customers ────────────────────────────────────────────────────────────

const customers: SeedCustomer[] = [
  { name: "Rahul Verma", phone: "9876543210", email: "rahul.v@email.com", address: "12 MG Road, Lucknow" },
  { name: "Sneha Patel", phone: "9876543211", email: "sneha.p@email.com", address: "45 Station Road, Kanpur" },
  { name: "Ajay Kumar", phone: "9876543212", email: "ajay.k@email.com", address: "78 Civil Lines, Lucknow" },
  { name: "Meera Sharma", phone: "9876543213", email: "meera.s@email.com", address: "23 Hazratganj, Lucknow" },
  { name: "Karan Singh", phone: "9876543214", email: "karan.s@email.com", address: "56 Gomti Nagar, Lucknow" },
  { name: "Pooja Gupta", phone: "9876543215", email: "pooja.g@email.com", address: "89 Aliganj, Lucknow" },
  { name: "Deepak Yadav", phone: "9876543216", email: "deepak.y@email.com", address: "34 Indira Nagar, Lucknow" },
  { name: "Anita Roy", phone: "9876543217", email: "anita.r@email.com", address: "67 Mahanagar, Lucknow" },
  { name: "Vijay Mishra", phone: "9876543218", email: "vijay.m@email.com", address: "90 Alambagh, Lucknow" },
  { name: "Sunita Devi", phone: "9876543219", email: "sunita.d@email.com", address: "11 Charbagh, Lucknow" },
];

// ── Leads ────────────────────────────────────────────────────────────────

const leads: SeedLead[] = [
  { name: "Arjun Mehta", phone: "9988776601", model: "Royal Enfield Classic 350", status: "Hot", source: "Walk-in" },
  { name: "Priya Raj", phone: "9988776602", model: "Honda Activa 6G", status: "Warm", source: "Online" },
  { name: "Sanjay Tiwari", phone: "9988776603", model: "Honda SP 125", status: "Hot", source: "Referral" },
  { name: "Neha Gupta", phone: "9988776604", model: "Honda Shine", status: "Warm", source: "Walk-in" },
  { name: "Rohit Joshi", phone: "9988776605", model: "Honda Unicorn", status: "Hot", source: "Phone" },
  { name: "Kavita Prasad", phone: "9988776606", model: "TVS Jupiter", status: "Cold", source: "Online" },
  { name: "Manish Kumar", phone: "9988776607", model: "Bajaj Pulsar 150", status: "Hot", source: "Walk-in" },
  { name: "Rekha Sharma", phone: "9988776608", model: "Honda Activa 6G", status: "Warm", source: "Referral" },
  { name: "Anil Verma", phone: "9988776609", model: "Hero Splendor Plus", status: "Cold", source: "Online" },
  { name: "Sapna Singh", phone: "9988776610", model: "Honda SP 125", status: "Hot", source: "Walk-in" },
  { name: "Rahul Dev", phone: "9988776611", model: "TVS Apache RTR 160", status: "Warm", source: "Phone" },
  { name: "Geeta Kumari", phone: "9988776612", model: "Honda Shine", status: "Cold", source: "Online" },
  { name: "Pankaj Mishra", phone: "9988776613", model: "Royal Enfield Classic 350", status: "Hot", source: "Referral" },
  { name: "Shobha Rani", phone: "9988776614", model: "Honda Activa 6G", status: "Warm", source: "Walk-in" },
  { name: "Dinesh Gupta", phone: "9988776615", model: "Bajaj CT 110", status: "Cold", source: "Phone" },
];

// ── Bookings ─────────────────────────────────────────────────────────────

const bookings: SeedBooking[] = [
  { customerId: "cust-001", vehicleId: "veh-001", amount: 85000, status: "Confirmed" },
  { customerId: "cust-002", vehicleId: "veh-003", amount: 112000, status: "Pending Payment" },
  { customerId: "cust-003", vehicleId: "veh-005", amount: 198000, status: "Delivered" },
  { customerId: "cust-004", vehicleId: "veh-010", amount: 75000, status: "Ready for Delivery" },
  { customerId: "cust-005", vehicleId: "veh-006", amount: 92000, status: "Delivered" },
];

// ── Default Expense Heads ────────────────────────────────────────────────

const expenseHeads = [
  "Rent",
  "Electricity",
  "Staff Salary",
  "Petrol/Transport",
  "Stationery",
  "Marketing/Advertising",
  "Maintenance",
  "Insurance",
  "Telephone/Internet",
  "Miscellaneous",
];

// ── Role Permissions ─────────────────────────────────────────────────────

const rolePermissions: Record<string, string[]> = {
  SUPER_ADMIN: ["*"],
  OWNER: ["*"],
  MANAGER: ["dashboard", "leads", "stock", "bookings", "sales", "service", "cashflow", "expenses", "reports", "customers", "rto"],
  SALES_EXEC: ["dashboard", "leads", "stock", "bookings", "sales", "customers"],
  ACCOUNTANT: ["dashboard", "cashflow", "expenses", "reports", "customers"],
  MECHANIC: ["dashboard", "service"],
  VIEWER: ["dashboard", "reports"],
};

// ── Main Seed Function ───────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting VaahanERP seed...\n");

  console.log("📦 Tenants:", tenants.length);
  tenants.forEach((t) => console.log(`   - ${t.name} (${t.plan})`));

  console.log("\n👥 Users:", users.length);
  users.forEach((u) => console.log(`   - ${u.name} <${u.email}> [${u.role}]`));

  console.log("\n🏍️ Vehicles:", vehicles.length);
  vehicles.forEach((v) => console.log(`   - ${v.model} ${v.variant} — ${v.status}`));

  console.log("\n👤 Customers:", customers.length);
  console.log("\n📋 Leads:", leads.length);
  console.log("📝 Bookings:", bookings.length);
  console.log("💰 Expense Heads:", expenseHeads.length);
  console.log("🔐 Role Permissions:", Object.keys(rolePermissions).length, "roles");

  console.log("\n✅ Seed data ready!");
  console.log("ℹ️  Connect a real database and uncomment Prisma calls to persist.");
  console.log("\n📧 Demo Login Credentials:");
  users.forEach((u) => {
    console.log(`   ${u.role.padEnd(14)} → ${u.email} / ${u.password}`);
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  });
