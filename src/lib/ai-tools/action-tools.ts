/**
 * VaahanERP AI Action Tools — 13 Write/Update Tools
 * Each tool modifies REAL Prisma DB with CONFIRM permission
 * Uses Gemini Function Calling format
 */

import prisma from '@/lib/prisma';
import { ToolDefinition, ToolCategory, PermissionLevel, ToolResult } from './types';
import { registerTool } from './registry';

// Helper: format currency
function formatCurrency(amount: number | any): string {
  const num = typeof amount === 'number' ? amount : Number(amount || 0);
  return '₹' + num.toLocaleString('en-IN');
}

// Helper: format date
function formatDate(date: Date | string | null): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ═══════════════════════════════════════
// TOOL 19: create_lead
// ═══════════════════════════════════════
const createLead: ToolDefinition = {
  name: 'create_lead',
  description: 'Create a new lead/enquiry in the system. Requires customer name and mobile number. Optionally accepts interested model, source, email, location, deal health, and notes.',
  category: ToolCategory.LEADS,
  permissionLevel: PermissionLevel.CONFIRM,
  parameters: {
    customer_name: { type: 'string', description: 'Customer full name', required: true },
    mobile: { type: 'string', description: '10-digit mobile number', required: true },
    interested_model: { type: 'string', description: 'Vehicle model interested in (e.g., Honda Activa 6G)' },
    source: { type: 'string', description: 'Lead source (Walk-in, Website, Referral, Phone, Social Media)' },
    email: { type: 'string', description: 'Customer email' },
    location: { type: 'string', description: 'Customer location/city' },
    deal_health: { type: 'string', description: 'Deal health', enum: ['HOT', 'WARM', 'COLD'] },
    notes: { type: 'string', description: 'Additional notes' }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    // Validate mobile
    const mobile = params.mobile?.replace(/\D/g, '');
    if (!mobile || mobile.length !== 10) {
      return { success: false, message: '❌ Invalid mobile number. Please provide a 10-digit number.' };
    }

    // Check for duplicate
    const existing = await prisma.lead.findFirst({
      where: { tenantId, mobile }
    });
    if (existing) {
      return {
        success: false,
        message: `⚠️ Lead already exists!\n\n👤 ${existing.customerName} — 📱 ${existing.mobile}\n🏍️ ${existing.interestedModel || 'N/A'} | ${existing.status} | ${existing.dealHealth}\n📅 Created: ${formatDate(existing.createdAt)}\n\nDuplicate lead nahi banaya. Existing lead update karna hai?`
      };
    }

    const lead = await prisma.lead.create({
      data: {
        tenantId,
        customerName: params.customer_name,
        mobile,
        email: params.email || null,
        interestedModel: params.interested_model || null,
        source: params.source || 'Walk-in',
        location: params.location || null,
        dealHealth: params.deal_health || 'WARM',
        notes: params.notes || null,
        status: 'NEW'
      }
    });

    return {
      success: true,
      message: `✅ Lead Created Successfully!\n\n👤 ${lead.customerName}\n📱 ${lead.mobile}\n🏍️ ${lead.interestedModel || 'Not specified'}\n📣 Source: ${lead.source || 'Walk-in'}\n🔥 Health: ${lead.dealHealth}\n📊 Status: NEW\n📅 ${formatDate(lead.createdAt)}\n\n💡 Kisi sales exec ko assign karoon?`,
      data: { leadId: lead.id }
    };
  }
};

// ═══════════════════════════════════════
// TOOL 20: update_lead_status
// ═══════════════════════════════════════
const updateLeadStatus: ToolDefinition = {
  name: 'update_lead_status',
  description: 'Update a lead\'s status or deal health. Search by name, mobile, or ID.',
  category: ToolCategory.LEADS,
  permissionLevel: PermissionLevel.CONFIRM,
  parameters: {
    search: { type: 'string', description: 'Lead name, mobile, or ID', required: true },
    status: { type: 'string', description: 'New status', enum: ['NEW', 'CONTACTED', 'FOLLOWUP', 'CONVERTED', 'LOST'] },
    deal_health: { type: 'string', description: 'New deal health', enum: ['HOT', 'WARM', 'COLD'] },
    follow_up_date: { type: 'string', description: 'Next follow-up date (YYYY-MM-DD)' },
    notes: { type: 'string', description: 'Update notes' }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const lead = await prisma.lead.findFirst({
      where: {
        tenantId,
        OR: [
          { id: params.search },
          { mobile: params.search?.replace(/\D/g, '') },
          { customerName: { contains: params.search, mode: 'insensitive' } }
        ]
      }
    });

    if (!lead) {
      return { success: false, message: `❌ Lead "${params.search}" not found.` };
    }

    const updateData: any = {};
    const changes: string[] = [];

    if (params.status && params.status !== lead.status) {
      updateData.status = params.status;
      changes.push(`Status: ${lead.status} → ${params.status}`);
    }
    if (params.deal_health && params.deal_health !== lead.dealHealth) {
      updateData.dealHealth = params.deal_health;
      changes.push(`Health: ${lead.dealHealth} → ${params.deal_health}`);
    }
    if (params.follow_up_date) {
      updateData.followUpDate = new Date(params.follow_up_date);
      changes.push(`Follow-up: ${formatDate(params.follow_up_date)}`);
    }
    if (params.notes) {
      updateData.notes = lead.notes ? `${lead.notes}\n[${formatDate(new Date())}] ${params.notes}` : params.notes;
      changes.push(`Notes updated`);
    }

    if (changes.length === 0) {
      return { success: false, message: '⚠️ Koi change specify nahi kiya. Status, deal_health, ya follow_up_date batao.' };
    }

    await prisma.lead.update({
      where: { id: lead.id },
      data: updateData
    });

    return {
      success: true,
      message: `✅ Lead Updated!\n\n👤 ${lead.customerName} — 📱 ${lead.mobile}\n\n📝 Changes:\n${changes.map(c => '  • ' + c).join('\n')}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 21: assign_lead
// ═══════════════════════════════════════
const assignLead: ToolDefinition = {
  name: 'assign_lead',
  description: 'Assign a lead to a sales executive. Search lead by name/mobile, specify exec by name.',
  category: ToolCategory.LEADS,
  permissionLevel: PermissionLevel.CONFIRM,
  parameters: {
    lead_search: { type: 'string', description: 'Lead name or mobile', required: true },
    exec_name: { type: 'string', description: 'Sales executive name', required: true }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    // Find lead
    const lead = await prisma.lead.findFirst({
      where: {
        tenantId,
        OR: [
          { id: params.lead_search },
          { mobile: params.lead_search?.replace(/\D/g, '') },
          { customerName: { contains: params.lead_search, mode: 'insensitive' } }
        ]
      }
    });
    if (!lead) {
      return { success: false, message: `❌ Lead "${params.lead_search}" not found.` };
    }

    // Find exec
    const exec = await prisma.user.findFirst({
      where: {
        tenantId,
        name: { contains: params.exec_name, mode: 'insensitive' },
        role: { in: ['SALES_EXEC', 'MANAGER', 'OWNER'] },
        isActive: true
      }
    });
    if (!exec) {
      // List available execs
      const execs = await prisma.user.findMany({
        where: { tenantId, role: { in: ['SALES_EXEC', 'MANAGER'] }, isActive: true },
        select: { name: true, role: true }
      });
      const execList = execs.map(e => `  • ${e.name} (${e.role})`).join('\n') || '  No sales executives found';
      return { success: false, message: `❌ "${params.exec_name}" not found.\n\n📋 Available executives:\n${execList}` };
    }

    await prisma.lead.update({
      where: { id: lead.id },
      data: { assignedToId: exec.id, status: lead.status === 'NEW' ? 'CONTACTED' : lead.status }
    });

    return {
      success: true,
      message: `✅ Lead Assigned!\n\n👤 ${lead.customerName} → 👨‍💼 ${exec.name}\n🏍️ ${lead.interestedModel || 'N/A'}\n📊 Status: ${lead.status === 'NEW' ? 'CONTACTED' : lead.status}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 22: create_booking
// ═══════════════════════════════════════
const createBooking: ToolDefinition = {
  name: 'create_booking',
  description: 'Create a new vehicle booking. Requires customer name/mobile and vehicle model. Creates customer if not exists.',
  category: ToolCategory.SALES,
  permissionLevel: PermissionLevel.CONFIRM,
  parameters: {
    customer_name: { type: 'string', description: 'Customer name', required: true },
    customer_mobile: { type: 'string', description: 'Customer 10-digit mobile', required: true },
    vehicle_model: { type: 'string', description: 'Vehicle model to book (e.g., Honda Activa)', required: true },
    total_amount: { type: 'number', description: 'Total booking amount' },
    advance_amount: { type: 'number', description: 'Advance payment amount' },
    payment_mode: { type: 'string', description: 'Payment mode', enum: ['CASH', 'UPI', 'NEFT', 'BANK_TRANSFER', 'LOAN'] },
    finance_provider: { type: 'string', description: 'Finance provider name (if loan)' }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const mobile = params.customer_mobile?.replace(/\D/g, '');
    if (!mobile || mobile.length !== 10) {
      return { success: false, message: '❌ Invalid mobile. 10-digit number chahiye.' };
    }

    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: { tenantId, mobile }
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: { tenantId, name: params.customer_name, mobile }
      });
    }

    // Find available vehicle
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        tenantId,
        model: { contains: params.vehicle_model, mode: 'insensitive' },
        status: 'AVAILABLE'
      }
    });

    const totalAmount = params.total_amount || (vehicle ? Number(vehicle.price) : 0);
    const advanceAmount = params.advance_amount || 0;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        tenantId,
        customerId: customer.id,
        vehicleId: vehicle?.id || null,
        totalAmount,
        paidAmount: advanceAmount,
        pendingAmount: totalAmount - advanceAmount,
        financeProvider: params.finance_provider || null,
        status: 'DRAFT'
      }
    });

    // Mark vehicle as booked
    if (vehicle) {
      await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: { status: 'BOOKED' }
      });
    }

    // Record advance payment if any
    if (advanceAmount > 0 && params.payment_mode) {
      await prisma.bookingPayment.create({
        data: {
          bookingId: booking.id,
          amount: advanceAmount,
          mode: params.payment_mode || 'CASH'
        }
      });
    }

    // Convert lead if exists
    const lead = await prisma.lead.findFirst({ where: { tenantId, mobile } });
    if (lead) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { status: 'CONVERTED', convertedToBookingId: booking.id }
      });
    }

    return {
      success: true,
      message: `✅ Booking Created!\n\n📋 ${booking.bookingNumber}\n👤 ${customer.name} — 📱 ${customer.mobile}\n🏍️ ${vehicle ? `${vehicle.model} ${vehicle.variant || ''} (${vehicle.color || ''})` : params.vehicle_model + ' (vehicle not in stock)'}\n💰 Total: ${formatCurrency(totalAmount)}\n  ✅ Advance: ${formatCurrency(advanceAmount)}${params.payment_mode ? ' (' + params.payment_mode + ')' : ''}\n  ⏳ Pending: ${formatCurrency(totalAmount - advanceAmount)}\n${params.finance_provider ? '🏦 Finance: ' + params.finance_provider : ''}\n📊 Status: DRAFT\n${lead ? '🔄 Lead auto-converted!' : ''}`,
      data: { bookingId: booking.id, bookingNumber: booking.bookingNumber }
    };
  }
};

// ═══════════════════════════════════════
// TOOL 23: update_booking_status
// ═══════════════════════════════════════
const updateBookingStatus: ToolDefinition = {
  name: 'update_booking_status',
  description: 'Update a booking status. Search by booking number.',
  category: ToolCategory.SALES,
  permissionLevel: PermissionLevel.CONFIRM,
  parameters: {
    booking_number: { type: 'string', description: 'Booking number or ID', required: true },
    status: { type: 'string', description: 'New status', required: true, enum: ['DRAFT', 'CONFIRMED', 'RTO_PENDING', 'READY', 'DELIVERED', 'CANCELLED'] }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const booking = await prisma.booking.findFirst({
      where: { tenantId, OR: [{ bookingNumber: params.booking_number }, { id: params.booking_number }] },
      include: { customer: true, vehicle: true }
    });

    if (!booking) {
      return { success: false, message: `❌ Booking "${params.booking_number}" not found.` };
    }

    const oldStatus = booking.status;
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: params.status }
    });

    // If delivered, mark vehicle as SOLD
    if (params.status === 'DELIVERED' && booking.vehicleId) {
      await prisma.vehicle.update({
        where: { id: booking.vehicleId },
        data: { status: 'SOLD' }
      });
    }

    // If cancelled, release vehicle
    if (params.status === 'CANCELLED' && booking.vehicleId) {
      await prisma.vehicle.update({
        where: { id: booking.vehicleId },
        data: { status: 'AVAILABLE' }
      });
    }

    return {
      success: true,
      message: `✅ Booking Updated!\n\n📋 ${booking.bookingNumber}\n👤 ${booking.customer?.name || 'N/A'}\n🏍️ ${booking.vehicle?.model || 'N/A'}\n📊 Status: ${oldStatus} → ${params.status}${params.status === 'DELIVERED' ? '\n🎉 Vehicle marked as SOLD!' : ''}${params.status === 'CANCELLED' ? '\n🔄 Vehicle released back to stock' : ''}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 24: add_payment
// ═══════════════════════════════════════
const addPayment: ToolDefinition = {
  name: 'add_payment',
  description: 'Record a payment against a booking. Requires booking number, amount, and payment mode.',
  category: ToolCategory.SALES,
  permissionLevel: PermissionLevel.CONFIRM,
  parameters: {
    booking_number: { type: 'string', description: 'Booking number', required: true },
    amount: { type: 'number', description: 'Payment amount', required: true },
    mode: { type: 'string', description: 'Payment mode', required: true, enum: ['CASH', 'UPI', 'NEFT', 'BANK_TRANSFER', 'LOAN'] },
    reference: { type: 'string', description: 'Transaction reference/UTR number' },
    notes: { type: 'string', description: 'Payment notes' }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const booking = await prisma.booking.findFirst({
      where: { tenantId, OR: [{ bookingNumber: params.booking_number }, { id: params.booking_number }] },
      include: { customer: true }
    });

    if (!booking) {
      return { success: false, message: `❌ Booking "${params.booking_number}" not found.` };
    }

    if (params.amount <= 0) {
      return { success: false, message: '❌ Amount must be greater than 0.' };
    }

    // Create payment
    await prisma.bookingPayment.create({
      data: {
        bookingId: booking.id,
        amount: params.amount,
        mode: params.mode,
        reference: params.reference || null,
        notes: params.notes || null
      }
    });

    // Update booking amounts
    const newPaid = Number(booking.paidAmount) + params.amount;
    const newPending = Number(booking.totalAmount) - newPaid;

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paidAmount: newPaid,
        pendingAmount: Math.max(0, newPending)
      }
    });

    // Also record as cash transaction inflow
    await prisma.cashTransaction.create({
      data: {
        tenantId,
        type: 'INFLOW',
        category: 'Vehicle Payment',
        description: `Payment for ${booking.bookingNumber} — ${booking.customer?.name || 'Customer'}`,
        amount: params.amount,
        mode: params.mode,
        reference: params.reference || null
      }
    });

    return {
      success: true,
      message: `✅ Payment Recorded!\n\n📋 ${booking.bookingNumber}\n👤 ${booking.customer?.name || 'N/A'}\n💰 Amount: ${formatCurrency(params.amount)} (${params.mode})\n${params.reference ? '🔗 Ref: ' + params.reference : ''}\n\n📊 Updated Totals:\n  Total: ${formatCurrency(Number(booking.totalAmount))}\n  ✅ Paid: ${formatCurrency(newPaid)}\n  ⏳ Pending: ${formatCurrency(Math.max(0, newPending))}${newPending <= 0 ? '\n\n🎉 FULL PAYMENT RECEIVED!' : ''}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 25: add_vehicle
// ═══════════════════════════════════════
const addVehicle: ToolDefinition = {
  name: 'add_vehicle',
  description: 'Add a new vehicle to inventory/stock.',
  category: ToolCategory.INVENTORY,
  permissionLevel: PermissionLevel.CONFIRM,
  parameters: {
    model: { type: 'string', description: 'Vehicle model (e.g., Honda Activa 6G)', required: true },
    variant: { type: 'string', description: 'Variant (e.g., STD, DLX)' },
    color: { type: 'string', description: 'Vehicle color' },
    engine_no: { type: 'string', description: 'Engine number' },
    chassis_no: { type: 'string', description: 'Chassis number (unique)' },
    price: { type: 'number', description: 'Ex-showroom price', required: true }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    // Check duplicate chassis
    if (params.chassis_no) {
      const existing = await prisma.vehicle.findUnique({ where: { chassisNo: params.chassis_no } });
      if (existing) {
        return { success: false, message: `❌ Chassis ${params.chassis_no} already exists in system!` };
      }
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        tenantId,
        model: params.model,
        variant: params.variant || null,
        color: params.color || null,
        engineNo: params.engine_no || null,
        chassisNo: params.chassis_no || null,
        price: params.price,
        status: 'AVAILABLE'
      }
    });

    return {
      success: true,
      message: `✅ Vehicle Added to Stock!\n\n🏍️ ${vehicle.model} ${vehicle.variant || ''}\n🎨 Color: ${vehicle.color || 'N/A'}\n🔧 Engine: ${vehicle.engineNo || 'N/A'}\n🔩 Chassis: ${vehicle.chassisNo || 'N/A'}\n💰 Price: ${formatCurrency(Number(vehicle.price))}\n📊 Status: AVAILABLE`,
      data: { vehicleId: vehicle.id }
    };
  }
};

// ═══════════════════════════════════════
// TOOL 26: create_job_card
// ═══════════════════════════════════════
const createJobCard: ToolDefinition = {
  name: 'create_job_card',
  description: 'Open a new service job card for a vehicle.',
  category: ToolCategory.INVENTORY,
  permissionLevel: PermissionLevel.CONFIRM,
  parameters: {
    vehicle_reg_no: { type: 'string', description: 'Vehicle registration number', required: true },
    customer_name: { type: 'string', description: 'Customer name', required: true },
    customer_mobile: { type: 'string', description: 'Customer mobile', required: true },
    complaints: { type: 'string', description: 'Customer complaints/issues' },
    diagnosis: { type: 'string', description: 'Initial diagnosis' }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const mobile = params.customer_mobile?.replace(/\D/g, '');

    const jobCard = await prisma.jobCard.create({
      data: {
        tenantId,
        vehicleRegNo: params.vehicle_reg_no.toUpperCase(),
        customerName: params.customer_name,
        customerMobile: mobile || params.customer_mobile,
        complaints: params.complaints || null,
        diagnosis: params.diagnosis || null,
        status: 'OPEN'
      }
    });

    return {
      success: true,
      message: `✅ Job Card Created!\n\n🔧 Job: ${jobCard.id.slice(-8).toUpperCase()}\n🏍️ Vehicle: ${jobCard.vehicleRegNo}\n👤 ${jobCard.customerName} — 📱 ${jobCard.customerMobile}\n📝 Complaints: ${jobCard.complaints || 'Not specified'}\n📊 Status: OPEN`,
      data: { jobCardId: jobCard.id }
    };
  }
};

// ═══════════════════════════════════════
// TOOL 27: update_job_card
// ═══════════════════════════════════════
const updateJobCard: ToolDefinition = {
  name: 'update_job_card',
  description: 'Update a service job card — change status, add diagnosis, billing.',
  category: ToolCategory.INVENTORY,
  permissionLevel: PermissionLevel.CONFIRM,
  parameters: {
    job_search: { type: 'string', description: 'Job card ID, vehicle reg no, or customer mobile', required: true },
    status: { type: 'string', description: 'New status', enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'INVOICED'] },
    diagnosis: { type: 'string', description: 'Diagnosis/findings' },
    labour_charge: { type: 'number', description: 'Labour charge amount' },
    parts_charge: { type: 'number', description: 'Parts charge amount' },
    amount_received: { type: 'number', description: 'Amount received from customer' }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const job = await prisma.jobCard.findFirst({
      where: {
        tenantId,
        OR: [
          { id: params.job_search },
          { vehicleRegNo: { contains: params.job_search, mode: 'insensitive' } },
          { customerMobile: params.job_search?.replace(/\D/g, '') }
        ]
      }
    });

    if (!job) {
      return { success: false, message: `❌ Job card "${params.job_search}" not found.` };
    }

    const updateData: any = {};
    const changes: string[] = [];

    if (params.status) {
      updateData.status = params.status;
      changes.push(`Status: ${job.status} → ${params.status}`);
    }
    if (params.diagnosis) {
      updateData.diagnosis = params.diagnosis;
      changes.push(`Diagnosis: ${params.diagnosis}`);
    }
    if (params.labour_charge !== undefined) {
      updateData.labourCharge = params.labour_charge;
      changes.push(`Labour: ${formatCurrency(params.labour_charge)}`);
    }
    if (params.parts_charge !== undefined) {
      updateData.partsCharge = params.parts_charge;
      changes.push(`Parts: ${formatCurrency(params.parts_charge)}`);
    }

    // Calculate totals
    const labour = params.labour_charge !== undefined ? params.labour_charge : Number(job.labourCharge);
    const parts = params.parts_charge !== undefined ? params.parts_charge : Number(job.partsCharge);
    const totalBilled = labour + parts;
    updateData.totalBilled = totalBilled;

    if (params.amount_received !== undefined) {
      const newReceived = Number(job.totalReceived) + params.amount_received;
      updateData.totalReceived = newReceived;
      updateData.pendingAmount = Math.max(0, totalBilled - newReceived);
      changes.push(`Payment: ${formatCurrency(params.amount_received)} received`);
    } else {
      updateData.pendingAmount = Math.max(0, totalBilled - Number(job.totalReceived));
    }

    if (changes.length === 0) {
      return { success: false, message: '⚠️ Koi change specify nahi kiya.' };
    }

    await prisma.jobCard.update({ where: { id: job.id }, data: updateData });

    return {
      success: true,
      message: `✅ Job Card Updated!\n\n🔧 ${job.vehicleRegNo} — ${job.customerName}\n\n📝 Changes:\n${changes.map(c => '  • ' + c).join('\n')}\n\n💰 Total Billed: ${formatCurrency(totalBilled)}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 28: add_expense
// ═══════════════════════════════════════
const addExpense: ToolDefinition = {
  name: 'add_expense',
  description: 'Record a business expense — salary, rent, electricity, fuel, etc.',
  category: ToolCategory.FINANCE,
  permissionLevel: PermissionLevel.CONFIRM,
  parameters: {
    amount: { type: 'number', description: 'Expense amount', required: true },
    category: { type: 'string', description: 'Category (Rent, Salary, Electricity, Fuel, Marketing, Maintenance, Office, Other)', required: true },
    description: { type: 'string', description: 'Expense description' },
    department: { type: 'string', description: 'Department (Sales, Service, Admin)' }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    if (params.amount <= 0) {
      return { success: false, message: '❌ Amount must be greater than 0.' };
    }

    const expense = await prisma.expense.create({
      data: {
        tenantId,
        amount: params.amount,
        category: params.category,
        description: params.description || null,
        department: params.department || null
      }
    });

    // Also record as cash outflow
    await prisma.cashTransaction.create({
      data: {
        tenantId,
        type: 'OUTFLOW',
        category: params.category,
        description: params.description || `Expense: ${params.category}`,
        amount: params.amount
      }
    });

    // Check budget
    const now = new Date();
    const budget = await prisma.expenseBudget.findFirst({
      where: { tenantId, category: params.category, month: now.getMonth() + 1, year: now.getFullYear() }
    });

    let budgetWarning = '';
    if (budget) {
      const monthExpenses = await prisma.expense.aggregate({
        where: {
          tenantId,
          category: params.category,
          date: { gte: new Date(now.getFullYear(), now.getMonth(), 1) }
        },
        _sum: { amount: true }
      });
      const spent = Number(monthExpenses._sum.amount || 0);
      const limit = Number(budget.monthlyLimit);
      if (spent > limit) {
        budgetWarning = `\n\n⚠️ BUDGET EXCEEDED!\n  ${params.category}: Spent ${formatCurrency(spent)} / Budget ${formatCurrency(limit)}`;
      } else if (spent > limit * 0.8) {
        budgetWarning = `\n\n⚠️ Budget Warning: ${params.category} at ${((spent / limit) * 100).toFixed(0)}%\n  Spent ${formatCurrency(spent)} / Budget ${formatCurrency(limit)}`;
      }
    }

    return {
      success: true,
      message: `✅ Expense Recorded!\n\n💸 ${formatCurrency(params.amount)} — ${params.category}\n📝 ${params.description || 'No description'}\n${params.department ? '🏢 Dept: ' + params.department : ''}${budgetWarning}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 29: create_promotion
// ═══════════════════════════════════════
const createPromotion: ToolDefinition = {
  name: 'create_promotion',
  description: 'Create a new promotion/offer for the dealership.',
  category: ToolCategory.SYSTEM,
  permissionLevel: PermissionLevel.CONFIRM,
  parameters: {
    title: { type: 'string', description: 'Promotion title (e.g., Diwali Sale)', required: true },
    description: { type: 'string', description: 'Promotion description' },
    discount_percent: { type: 'number', description: 'Discount percentage', required: true },
    valid_from: { type: 'string', description: 'Start date (YYYY-MM-DD)', required: true },
    valid_to: { type: 'string', description: 'End date (YYYY-MM-DD)', required: true },
    applicable_brands: { type: 'string', description: 'Applicable brands (comma separated)' },
    type: { type: 'string', description: 'Promotion type (Festival, Clearance, Exchange, Loyalty)' }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const promo = await prisma.promotion.create({
      data: {
        tenantId,
        title: params.title,
        description: params.description || null,
        discountPercent: params.discount_percent,
        validFrom: new Date(params.valid_from),
        validTo: new Date(params.valid_to),
        applicableBrands: params.applicable_brands || null,
        type: params.type || 'Festival',
        isActive: true
      }
    });

    return {
      success: true,
      message: `✅ Promotion Created!\n\n🎯 ${promo.title}\n💰 ${promo.discountPercent}% OFF\n📅 ${formatDate(promo.validFrom)} — ${formatDate(promo.validTo)}\n${promo.description ? '📝 ' + promo.description : ''}\n${promo.applicableBrands ? '🏍️ Brands: ' + promo.applicableBrands : ''}`,
      data: { promotionId: promo.id }
    };
  }
};

// ═══════════════════════════════════════
// TOOL 30: lock_daybook
// ═══════════════════════════════════════
const lockDaybook: ToolDefinition = {
  name: 'lock_daybook',
  description: 'Lock the daybook for a specific date to prevent further edits.',
  category: ToolCategory.FINANCE,
  permissionLevel: PermissionLevel.CONFIRM,
  parameters: {
    date: { type: 'string', description: 'Date to lock (YYYY-MM-DD), default today' },
    physical_cash: { type: 'number', description: 'Physical cash count' }
  },
  handler: async (params: any, tenantId: string, userRole: string): Promise<ToolResult> => {
    const targetDate = params.date ? new Date(params.date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Find or create daybook entry
    let daybook = await prisma.daybookEntry.findFirst({
      where: { tenantId, date: targetDate }
    });

    if (daybook?.isLocked) {
      return { success: false, message: `🔒 Daybook for ${formatDate(targetDate)} is already locked!` };
    }

    // Calculate closing balance from transactions
    const startOfDay = new Date(targetDate);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const [inflow, outflow] = await Promise.all([
      prisma.cashTransaction.aggregate({ where: { tenantId, type: 'INFLOW', createdAt: { gte: startOfDay, lte: endOfDay } }, _sum: { amount: true } }),
      prisma.cashTransaction.aggregate({ where: { tenantId, type: 'OUTFLOW', createdAt: { gte: startOfDay, lte: endOfDay } }, _sum: { amount: true } })
    ]);

    const inflowAmt = Number(inflow._sum.amount || 0);
    const outflowAmt = Number(outflow._sum.amount || 0);

    // Get previous daybook closing as opening
    const prevDaybook = await prisma.daybookEntry.findFirst({
      where: { tenantId, date: { lt: targetDate } },
      orderBy: { date: 'desc' }
    });
    const openingBalance = prevDaybook ? Number(prevDaybook.closingBalance) : 0;
    const closingBalance = openingBalance + inflowAmt - outflowAmt;
    const physicalCash = params.physical_cash !== undefined ? params.physical_cash : closingBalance;
    const difference = physicalCash - closingBalance;

    if (daybook) {
      await prisma.daybookEntry.update({
        where: { id: daybook.id },
        data: { openingBalance, closingBalance, physicalCash, difference, isLocked: true, lockedAt: new Date() }
      });
    } else {
      daybook = await prisma.daybookEntry.create({
        data: { tenantId, date: targetDate, openingBalance, closingBalance, physicalCash, difference, isLocked: true, lockedAt: new Date() }
      });
    }

    return {
      success: true,
      message: `🔒 Daybook Locked!\n\n📅 Date: ${formatDate(targetDate)}\n📥 Opening: ${formatCurrency(openingBalance)}\n💰 Inflow: ${formatCurrency(inflowAmt)} | Outflow: ${formatCurrency(outflowAmt)}\n📤 Closing: ${formatCurrency(closingBalance)}\n💵 Physical Cash: ${formatCurrency(physicalCash)}\n${difference !== 0 ? `⚠️ Difference: ${formatCurrency(difference)}` : '✅ Tallied perfectly!'}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 31: create_customer
// ═══════════════════════════════════════
const createCustomer: ToolDefinition = {
  name: 'create_customer',
  description: 'Add a new customer to the system.',
  category: ToolCategory.SALES,
  permissionLevel: PermissionLevel.CONFIRM,
  parameters: {
    name: { type: 'string', description: 'Customer full name', required: true },
    mobile: { type: 'string', description: '10-digit mobile number', required: true },
    email: { type: 'string', description: 'Email address' },
    address: { type: 'string', description: 'Full address' },
    aadhar_no: { type: 'string', description: 'Aadhar number' },
    pan_no: { type: 'string', description: 'PAN number' }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const mobile = params.mobile?.replace(/\D/g, '');
    if (!mobile || mobile.length !== 10) {
      return { success: false, message: '❌ Invalid mobile. 10-digit number chahiye.' };
    }

    // Check duplicate
    const existing = await prisma.customer.findFirst({ where: { tenantId, mobile } });
    if (existing) {
      return { success: false, message: `⚠️ Customer already exists!\n\n👤 ${existing.name} — 📱 ${existing.mobile}\n📅 Since: ${formatDate(existing.createdAt)}` };
    }

    const customer = await prisma.customer.create({
      data: {
        tenantId,
        name: params.name,
        mobile,
        email: params.email || null,
        address: params.address || null,
        aadharNo: params.aadhar_no || null,
        panNo: params.pan_no || null
      }
    });

    return {
      success: true,
      message: `✅ Customer Created!\n\n👤 ${customer.name}\n📱 ${customer.mobile}\n📧 ${customer.email || 'N/A'}\n📍 ${customer.address || 'N/A'}\n📅 ${formatDate(customer.createdAt)}`,
      data: { customerId: customer.id }
    };
  }
};

// ═══════════════════════════════════════
// TOOL 32: register_client
// ═══════════════════════════════════════
const registerClient: ToolDefinition = {
  name: 'register_client',
  description: 'Register a new client/dealership on VaahanERP. Creates tenant, brand, location, and owner user. Use this when a new dealer wants to sign up.',
  category: ToolCategory.SYSTEM,
  permissionLevel: PermissionLevel.CONFIRM,
  parameters: {
    client_name: { type: 'string', description: 'Dealership name (e.g., Shri Bajrang Motors)', required: true },
    owner_name: { type: 'string', description: 'Owner full name', required: true },
    email: { type: 'string', description: 'Owner email for login', required: true },
    password: { type: 'string', description: 'Login password (min 6 chars)', required: true },
    phone: { type: 'string', description: 'Phone number' },
    firm_name: { type: 'string', description: 'Legal firm/company name' },
    gst_number: { type: 'string', description: 'GST number' },
    address: { type: 'string', description: 'Business address' },
    showroom_type: { type: 'string', description: 'Type of showroom', enum: ['BIKE', 'CAR', 'EV', 'MULTI'] },
    brand_name: { type: 'string', description: 'Primary brand name (e.g., Honda, Hero)' },
    location_name: { type: 'string', description: 'Showroom location name' }
  },
  handler: async (params: any): Promise<ToolResult> => {
    const { client_name, owner_name, email, password, phone, firm_name, gst_number, address, showroom_type, brand_name, location_name } = params;

    if (!client_name || !owner_name || !email || !password) {
      return { success: false, message: '❌ Required: client_name, owner_name, email, password' };
    }
    if (password.length < 6) {
      return { success: false, message: '❌ Password must be at least 6 characters.' };
    }

    // Check email uniqueness
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return { success: false, message: `❌ Email "${email}" already exists. Use a different email.` };
    }

    // Generate slug
    const baseSlug = client_name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    let slug = baseSlug;
    const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
    if (existingTenant) {
      slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: client_name.trim(),
        slug,
        plan: 'FREE',
        status: 'ACTIVE',
        dealershipType: showroom_type || null,
        address: address || null,
        phone: phone || null,
        email: email.toLowerCase().trim(),
        gst: gst_number || null,
      },
    });

    // Create brand
    const brand = await prisma.dealershipBrand.create({
      data: {
        tenantId: tenant.id,
        brandName: brand_name || client_name.trim(),
        brandType: showroom_type || 'BIKE',
        logoUrl: null,
      },
    });

    // Create location
    await prisma.showroomLocation.create({
      data: {
        tenantId: tenant.id,
        brandId: brand.id,
        locationName: location_name || 'Main Showroom',
        address: address || null,
        phone: phone || null,
        managerName: owner_name.trim(),
      },
    });

    // Create owner user
    await prisma.user.create({
      data: {
        tenantId: tenant.id,
        name: owner_name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone || null,
        role: 'OWNER',
      },
    });

    return {
      success: true,
      message: `✅ Client Registered Successfully!\n\n🏢 Dealership: ${client_name}\n👤 Owner: ${owner_name}\n📧 Login Email: ${email.toLowerCase().trim()}\n🔑 Password: (as provided)\n🌐 Slug: ${slug}\n📋 Plan: FREE\n\nClient can now login at /login with their email and password.`,
      data: { tenantId: tenant.id, slug, email: email.toLowerCase().trim() }
    };
  }
};

// ═══════════════════════════════════════
// REGISTER ALL ACTION TOOLS
// ═══════════════════════════════════════
export function registerAllActionTools(): void {
  const tools = [
    createLead,         // 19
    updateLeadStatus,   // 20
    assignLead,         // 21
    createBooking,      // 22
    updateBookingStatus,// 23
    addPayment,         // 24
    addVehicle,         // 25
    createJobCard,      // 26
    updateJobCard,      // 27
    addExpense,         // 28
    createPromotion,    // 29
    lockDaybook,        // 30
    createCustomer,     // 31
    registerClient      // 32
  ];

  tools.forEach(tool => registerTool(tool));
  console.log(`✅ Registered ${tools.length} action tools`);
}
