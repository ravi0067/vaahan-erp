/**
 * VaahanERP AI Data Tools — 18 Read-Only Tools
 * Each tool queries REAL Prisma DB and returns formatted data
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
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Helper: IST today start
function todayStart(): Date {
  const now = new Date();
  const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - (5.5 * 60 * 60 * 1000));
}

// ═══════════════════════════════════════
// TOOL 1: get_dashboard_stats
// ═══════════════════════════════════════
const getDashboardStats: ToolDefinition = {
  name: 'get_dashboard_stats',
  description: 'Get overall business dashboard summary for today — sales count, lead count, cash position, active service jobs, pending bookings, RTO status. Use when user asks for status, overview, summary, or dashboard.',
  category: ToolCategory.SYSTEM,
  permissionLevel: PermissionLevel.AUTO,
  parameters: {},
  handler: async (_params: any, tenantId: string): Promise<ToolResult> => {
    const today = todayStart();
    const [bookings, leads, vehicles, cashIn, cashOut, serviceJobs, pendingRTO, expenses] = await Promise.all([
      prisma.booking.count({ where: { tenantId, createdAt: { gte: today } } }),
      prisma.lead.count({ where: { tenantId, createdAt: { gte: today } } }),
      prisma.vehicle.count({ where: { tenantId, status: 'SOLD', createdAt: { gte: today } } }),
      prisma.cashTransaction.aggregate({ where: { tenantId, type: 'INFLOW', createdAt: { gte: today } }, _sum: { amount: true } }),
      prisma.cashTransaction.aggregate({ where: { tenantId, type: 'OUTFLOW', createdAt: { gte: today } }, _sum: { amount: true } }),
      prisma.jobCard.count({ where: { tenantId, status: 'IN_PROGRESS' } }),
      prisma.rTORegistration.count({ where: { booking: { tenantId }, status: { in: ['APPLIED', 'PENDING'] } } }),
      prisma.expense.aggregate({ where: { tenantId, createdAt: { gte: today } }, _sum: { amount: true } })
    ]);

    const totalLeads = await prisma.lead.count({ where: { tenantId } });
    const hotLeads = await prisma.lead.count({ where: { tenantId, dealHealth: 'HOT' } });
    const totalBookings = await prisma.booking.count({ where: { tenantId, status: { in: ['CONFIRMED', 'RTO_PENDING', 'READY'] } } });
    const availableStock = await prisma.vehicle.count({ where: { tenantId, status: 'AVAILABLE' } });

    const cashInAmt = Number(cashIn._sum.amount || 0);
    const cashOutAmt = Number(cashOut._sum.amount || 0);
    const expenseAmt = Number(expenses._sum.amount || 0);

    return {
      success: true,
      message: `📊 Dashboard Summary — ${formatDate(new Date())}

🏍️ Today's Sales: ${vehicles} vehicles sold
📋 New Bookings: ${bookings} today | ${totalBookings} active total
👥 New Leads: ${leads} today | ${totalLeads} total (${hotLeads} 🔥 HOT)
💰 Cash In: ${formatCurrency(cashInAmt)} | Cash Out: ${formatCurrency(cashOutAmt)}
💸 Expenses: ${formatCurrency(expenseAmt)} today
🔧 Service Jobs: ${serviceJobs} in progress
📄 RTO Pending: ${pendingRTO}
🏍️ Available Stock: ${availableStock} vehicles`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 2: get_sales_report
// ═══════════════════════════════════════
const getSalesReport: ToolDefinition = {
  name: 'get_sales_report',
  description: 'Get sales report with vehicle sales, booking counts, and revenue. Supports date range filter (today, this_week, this_month, or custom dates).',
  category: ToolCategory.SALES,
  permissionLevel: PermissionLevel.AUTO,
  parameters: {
    period: { type: 'string', description: 'Period: today, this_week, this_month, last_month, or custom', enum: ['today', 'this_week', 'this_month', 'last_month'] },
    start_date: { type: 'string', description: 'Custom start date (YYYY-MM-DD)' },
    end_date: { type: 'string', description: 'Custom end date (YYYY-MM-DD)' }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const { startDate, endDate } = getDateRange(params.period, params.start_date, params.end_date);

    const bookings = await prisma.booking.findMany({
      where: { tenantId, createdAt: { gte: startDate, lte: endDate } },
      include: { customer: true, vehicle: true, payments: true }
    });

    const delivered = bookings.filter(b => b.status === 'DELIVERED');
    const confirmed = bookings.filter(b => b.status === 'CONFIRMED');
    const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
    const totalPaid = bookings.reduce((sum, b) => sum + Number(b.paidAmount), 0);
    const totalPending = bookings.reduce((sum, b) => sum + Number(b.pendingAmount), 0);

    // Payment mode breakdown
    const allPayments = bookings.flatMap(b => b.payments);
    const paymentModes: Record<string, number> = {};
    allPayments.forEach(p => {
      paymentModes[p.mode] = (paymentModes[p.mode] || 0) + Number(p.amount);
    });

    const modeBreakdown = Object.entries(paymentModes).map(([mode, amt]) => `  ${mode}: ${formatCurrency(amt)}`).join('\n') || '  No payments';

    // Top models
    const modelCounts: Record<string, number> = {};
    bookings.forEach(b => {
      if (b.vehicle) {
        const model = b.vehicle.model;
        modelCounts[model] = (modelCounts[model] || 0) + 1;
      }
    });
    const topModels = Object.entries(modelCounts).sort(([, a], [, b]) => b - a).slice(0, 5)
      .map(([model, count]) => `  ${model}: ${count} units`).join('\n') || '  No vehicles';

    return {
      success: true,
      message: `📊 Sales Report (${formatDate(startDate)} — ${formatDate(endDate)})

🏍️ Total Bookings: ${bookings.length}
  ✅ Delivered: ${delivered.length}
  📋 Confirmed: ${confirmed.length}
  📝 Others: ${bookings.length - delivered.length - confirmed.length}

💰 Revenue: ${formatCurrency(totalRevenue)}
  ✅ Collected: ${formatCurrency(totalPaid)}
  ⏳ Pending: ${formatCurrency(totalPending)}

💳 Payment Modes:
${modeBreakdown}

🏆 Top Models:
${topModels}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 3: get_revenue_report
// ═══════════════════════════════════════
const getRevenueReport: ToolDefinition = {
  name: 'get_revenue_report',
  description: 'Get revenue breakdown — total income from bookings, service, and cash transactions.',
  category: ToolCategory.FINANCE,
  permissionLevel: PermissionLevel.AUTO,
  parameters: {
    period: { type: 'string', description: 'Period: today, this_week, this_month', enum: ['today', 'this_week', 'this_month', 'last_month'] }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const { startDate, endDate } = getDateRange(params.period);
    
    const [bookingRevenue, serviceRevenue, cashInflow, cashOutflow] = await Promise.all([
      prisma.booking.aggregate({ where: { tenantId, createdAt: { gte: startDate, lte: endDate } }, _sum: { totalAmount: true, paidAmount: true } }),
      prisma.jobCard.aggregate({ where: { tenantId, createdAt: { gte: startDate, lte: endDate } }, _sum: { totalBilled: true, totalReceived: true } }),
      prisma.cashTransaction.aggregate({ where: { tenantId, type: 'INFLOW', createdAt: { gte: startDate, lte: endDate } }, _sum: { amount: true } }),
      prisma.cashTransaction.aggregate({ where: { tenantId, type: 'OUTFLOW', createdAt: { gte: startDate, lte: endDate } }, _sum: { amount: true } })
    ]);

    const bTotal = Number(bookingRevenue._sum.totalAmount || 0);
    const bPaid = Number(bookingRevenue._sum.paidAmount || 0);
    const sTotal = Number(serviceRevenue._sum.totalBilled || 0);
    const sReceived = Number(serviceRevenue._sum.totalReceived || 0);
    const inflow = Number(cashInflow._sum.amount || 0);
    const outflow = Number(cashOutflow._sum.amount || 0);

    return {
      success: true,
      message: `📈 Revenue Report (${formatDate(startDate)} — ${formatDate(endDate)})

🏍️ Vehicle Sales:
  Total: ${formatCurrency(bTotal)} | Collected: ${formatCurrency(bPaid)}

🔧 Service Revenue:
  Billed: ${formatCurrency(sTotal)} | Received: ${formatCurrency(sReceived)}

💰 Cash Flow:
  Inflow: ${formatCurrency(inflow)}
  Outflow: ${formatCurrency(outflow)}
  Net: ${formatCurrency(inflow - outflow)}

📊 Total Business: ${formatCurrency(bTotal + sTotal)}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 4: get_bookings
// ═══════════════════════════════════════
const getBookings: ToolDefinition = {
  name: 'get_bookings',
  description: 'List bookings with optional status filter. Shows booking number, customer, vehicle, amount, and status.',
  category: ToolCategory.SALES,
  permissionLevel: PermissionLevel.AUTO,
  parameters: {
    status: { type: 'string', description: 'Filter by status', enum: ['DRAFT', 'CONFIRMED', 'RTO_PENDING', 'READY', 'DELIVERED', 'CANCELLED'] },
    limit: { type: 'number', description: 'Max results (default 10)' }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const where: any = { tenantId };
    if (params.status) where.status = params.status;
    
    const bookings = await prisma.booking.findMany({
      where,
      include: { customer: true, vehicle: true },
      orderBy: { createdAt: 'desc' },
      take: params.limit || 10
    });

    if (bookings.length === 0) {
      return { success: true, message: '📋 No bookings found with the given filter.' };
    }

    const list = bookings.map((b, i) => 
      `${i + 1}. ${b.bookingNumber} — ${b.customer?.name || 'N/A'}\n   🏍️ ${b.vehicle?.model || 'N/A'} | ${b.status} | ${formatCurrency(Number(b.totalAmount))}\n   💰 Paid: ${formatCurrency(Number(b.paidAmount))} | Pending: ${formatCurrency(Number(b.pendingAmount))}`
    ).join('\n\n');

    return {
      success: true,
      message: `📋 Bookings (${bookings.length} results)${params.status ? ' — ' + params.status : ''}:\n\n${list}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 5: get_booking_detail
// ═══════════════════════════════════════
const getBookingDetail: ToolDefinition = {
  name: 'get_booking_detail',
  description: 'Get full detail of a single booking by booking number or ID.',
  category: ToolCategory.SALES,
  permissionLevel: PermissionLevel.AUTO,
  parameters: {
    booking_number: { type: 'string', description: 'Booking number or ID', required: true }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const booking = await prisma.booking.findFirst({
      where: { tenantId, OR: [{ bookingNumber: params.booking_number }, { id: params.booking_number }] },
      include: { customer: true, vehicle: true, payments: true, documents: true, rtoRegistration: true }
    });

    if (!booking) {
      return { success: false, message: `❌ Booking "${params.booking_number}" not found.` };
    }

    const payments = booking.payments.map(p =>
      `  ${formatDate(p.date)} — ${p.mode}: ${formatCurrency(Number(p.amount))}${p.reference ? ' (Ref: ' + p.reference + ')' : ''}`
    ).join('\n') || '  No payments yet';

    return {
      success: true,
      message: `📋 Booking Detail — ${booking.bookingNumber}

👤 Customer: ${booking.customer?.name || 'N/A'} (📱 ${booking.customer?.mobile || 'N/A'})
🏍️ Vehicle: ${booking.vehicle?.model || 'N/A'} ${booking.vehicle?.variant || ''} ${booking.vehicle?.color || ''}
📊 Status: ${booking.status} (Step ${booking.step}/6)
💰 Total: ${formatCurrency(Number(booking.totalAmount))}
  ✅ Paid: ${formatCurrency(Number(booking.paidAmount))}
  ⏳ Pending: ${formatCurrency(Number(booking.pendingAmount))}
${booking.financeProvider ? `🏦 Finance: ${booking.financeProvider} (${booking.loanStatus || 'Pending'})` : ''}
📄 RTO: ${booking.rtoRegistration ? booking.rtoRegistration.status + (booking.rtoRegistration.registrationNumber ? ' — ' + booking.rtoRegistration.registrationNumber : '') : 'Not applied'}
📝 Documents: ${booking.documents.length} uploaded
📅 Created: ${formatDate(booking.createdAt)}

💳 Payments:
${payments}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 6: get_leads
// ═══════════════════════════════════════
const getLeads: ToolDefinition = {
  name: 'get_leads',
  description: 'List leads with optional status and deal health filter. Shows customer name, phone, interested model, status.',
  category: ToolCategory.LEADS,
  permissionLevel: PermissionLevel.AUTO,
  parameters: {
    status: { type: 'string', description: 'Filter by status', enum: ['NEW', 'CONTACTED', 'FOLLOWUP', 'CONVERTED', 'LOST'] },
    deal_health: { type: 'string', description: 'Filter by deal health', enum: ['HOT', 'WARM', 'COLD'] },
    limit: { type: 'number', description: 'Max results (default 15)' }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const where: any = { tenantId };
    if (params.status) where.status = params.status;
    if (params.deal_health) where.dealHealth = params.deal_health;

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: params.limit || 15
    });

    if (leads.length === 0) {
      return { success: true, message: '👥 No leads found with the given filter.' };
    }

    const healthEmoji: Record<string, string> = { HOT: '🔥', WARM: '🟡', COLD: '🔵' };
    const list = leads.map((l, i) =>
      `${i + 1}. ${healthEmoji[l.dealHealth] || ''} ${l.customerName} — 📱 ${l.mobile}\n   🏍️ ${l.interestedModel || 'N/A'} | ${l.status} | Source: ${l.source || 'N/A'}\n   📅 Follow-up: ${l.followUpDate ? formatDate(l.followUpDate) : 'Not set'}`
    ).join('\n\n');

    const total = await prisma.lead.count({ where: { tenantId } });
    return {
      success: true,
      message: `👥 Leads (${leads.length} of ${total})${params.status ? ' — ' + params.status : ''}${params.deal_health ? ' ' + params.deal_health : ''}:\n\n${list}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 7: get_lead_detail
// ═══════════════════════════════════════
const getLeadDetail: ToolDefinition = {
  name: 'get_lead_detail',
  description: 'Get full detail of a single lead by name, mobile number, or ID.',
  category: ToolCategory.LEADS,
  permissionLevel: PermissionLevel.AUTO,
  parameters: {
    search: { type: 'string', description: 'Lead name, mobile number, or ID', required: true }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const lead = await prisma.lead.findFirst({
      where: {
        tenantId,
        OR: [
          { id: params.search },
          { mobile: params.search },
          { customerName: { contains: params.search, mode: 'insensitive' } }
        ]
      }
    });

    if (!lead) {
      return { success: false, message: `❌ Lead "${params.search}" not found.` };
    }

    const healthEmoji: Record<string, string> = { HOT: '🔥', WARM: '🟡', COLD: '🔵' };
    return {
      success: true,
      message: `👤 Lead Detail — ${lead.customerName}

📱 Mobile: ${lead.mobile}
📧 Email: ${lead.email || 'N/A'}
🏍️ Interested: ${lead.interestedModel || 'N/A'}
📍 Location: ${lead.location || 'N/A'}
📊 Status: ${lead.status} | ${healthEmoji[lead.dealHealth] || ''} ${lead.dealHealth}
📣 Source: ${lead.source || 'N/A'}
📅 Follow-up: ${lead.followUpDate ? formatDate(lead.followUpDate) : 'Not set'}
📝 Notes: ${lead.notes || 'None'}
📅 Created: ${formatDate(lead.createdAt)}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 8: get_pending_followups
// ═══════════════════════════════════════
const getPendingFollowups: ToolDefinition = {
  name: 'get_pending_followups',
  description: 'Get leads with follow-up due today or overdue. Shows customer name, phone, interested model.',
  category: ToolCategory.LEADS,
  permissionLevel: PermissionLevel.AUTO,
  parameters: {},
  handler: async (_params: any, tenantId: string): Promise<ToolResult> => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const leads = await prisma.lead.findMany({
      where: {
        tenantId,
        followUpDate: { lte: endOfDay },
        status: { in: ['NEW', 'CONTACTED', 'FOLLOWUP'] }
      },
      orderBy: { followUpDate: 'asc' }
    });

    if (leads.length === 0) {
      return { success: true, message: '✅ No pending follow-ups! All caught up.' };
    }

    const overdue = leads.filter(l => l.followUpDate && l.followUpDate < todayStart());
    const today = leads.filter(l => l.followUpDate && l.followUpDate >= todayStart());

    const healthEmoji: Record<string, string> = { HOT: '🔥', WARM: '🟡', COLD: '🔵' };
    const formatLead = (l: any, i: number) =>
      `${i + 1}. ${healthEmoji[l.dealHealth] || ''} ${l.customerName} — 📱 ${l.mobile}\n   🏍️ ${l.interestedModel || 'N/A'} | Due: ${formatDate(l.followUpDate)}`;

    let msg = `📞 Pending Follow-ups (${leads.length} total):\n`;
    if (overdue.length > 0) {
      msg += `\n⚠️ OVERDUE (${overdue.length}):\n${overdue.map(formatLead).join('\n\n')}\n`;
    }
    if (today.length > 0) {
      msg += `\n📅 TODAY (${today.length}):\n${today.map(formatLead).join('\n\n')}`;
    }

    return { success: true, message: msg };
  }
};

// ═══════════════════════════════════════
// TOOL 9: get_cash_summary
// ═══════════════════════════════════════
const getCashSummary: ToolDefinition = {
  name: 'get_cash_summary',
  description: 'Get cash position — inflow, outflow, balance for today or a date range.',
  category: ToolCategory.FINANCE,
  permissionLevel: PermissionLevel.AUTO,
  parameters: {
    period: { type: 'string', description: 'Period', enum: ['today', 'this_week', 'this_month'] }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const { startDate, endDate } = getDateRange(params.period || 'today');

    const [inflow, outflow] = await Promise.all([
      prisma.cashTransaction.aggregate({ where: { tenantId, type: 'INFLOW', createdAt: { gte: startDate, lte: endDate } }, _sum: { amount: true } }),
      prisma.cashTransaction.aggregate({ where: { tenantId, type: 'OUTFLOW', createdAt: { gte: startDate, lte: endDate } }, _sum: { amount: true } })
    ]);

    // Get latest daybook
    const latestDaybook = await prisma.daybookEntry.findFirst({
      where: { tenantId },
      orderBy: { date: 'desc' }
    });

    const inflowAmt = Number(inflow._sum.amount || 0);
    const outflowAmt = Number(outflow._sum.amount || 0);

    return {
      success: true,
      message: `💰 Cash Summary (${params.period || 'today'})

📥 Total Inflow: ${formatCurrency(inflowAmt)}
📤 Total Outflow: ${formatCurrency(outflowAmt)}
💵 Net: ${formatCurrency(inflowAmt - outflowAmt)}

📒 Latest Daybook (${latestDaybook ? formatDate(latestDaybook.date) : 'N/A'}):
  Opening: ${latestDaybook ? formatCurrency(Number(latestDaybook.openingBalance)) : 'N/A'}
  Closing: ${latestDaybook ? formatCurrency(Number(latestDaybook.closingBalance)) : 'N/A'}
  Physical Cash: ${latestDaybook ? formatCurrency(Number(latestDaybook.physicalCash)) : 'N/A'}
  🔒 Locked: ${latestDaybook?.isLocked ? 'Yes ✅' : 'No ⚠️'}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 10: get_daybook
// ═══════════════════════════════════════
const getDaybook: ToolDefinition = {
  name: 'get_daybook',
  description: 'Get today\'s cash transactions — all inflows and outflows with details.',
  category: ToolCategory.FINANCE,
  permissionLevel: PermissionLevel.AUTO,
  parameters: {
    date: { type: 'string', description: 'Date (YYYY-MM-DD), default today' }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const targetDate = params.date ? new Date(params.date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const transactions = await prisma.cashTransaction.findMany({
      where: { tenantId, createdAt: { gte: startOfDay, lte: endOfDay } },
      orderBy: { createdAt: 'desc' }
    });

    if (transactions.length === 0) {
      return { success: true, message: `📒 No transactions found for ${formatDate(targetDate)}.` };
    }

    const inflows = transactions.filter(t => t.type === 'INFLOW');
    const outflows = transactions.filter(t => t.type === 'OUTFLOW');
    const totalIn = inflows.reduce((s, t) => s + Number(t.amount), 0);
    const totalOut = outflows.reduce((s, t) => s + Number(t.amount), 0);

    const formatTxn = (t: any) => `  ${t.type === 'INFLOW' ? '📥' : '📤'} ${formatCurrency(Number(t.amount))} — ${t.category}${t.description ? ' (' + t.description + ')' : ''}${t.mode ? ' [' + t.mode + ']' : ''}`;

    return {
      success: true,
      message: `📒 Daybook — ${formatDate(targetDate)}

📥 Inflows (${inflows.length}): ${formatCurrency(totalIn)}
${inflows.map(formatTxn).join('\n')}

📤 Outflows (${outflows.length}): ${formatCurrency(totalOut)}
${outflows.map(formatTxn).join('\n')}

💵 Net: ${formatCurrency(totalIn - totalOut)}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 11: get_expenses
// ═══════════════════════════════════════
const getExpenses: ToolDefinition = {
  name: 'get_expenses',
  description: 'Get expense list with optional date range and category filter.',
  category: ToolCategory.FINANCE,
  permissionLevel: PermissionLevel.AUTO,
  parameters: {
    period: { type: 'string', description: 'Period', enum: ['today', 'this_week', 'this_month', 'last_month'] },
    category: { type: 'string', description: 'Filter by category (e.g., Rent, Salary, Electricity)' }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const { startDate, endDate } = getDateRange(params.period || 'this_month');
    const where: any = { tenantId, date: { gte: startDate, lte: endDate } };
    if (params.category) where.category = params.category;

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 20
    });

    const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

    if (expenses.length === 0) {
      return { success: true, message: '💸 No expenses found for the given period.' };
    }

    const list = expenses.map((e, i) =>
      `${i + 1}. ${formatCurrency(Number(e.amount))} — ${e.category}\n   📝 ${e.description || 'No description'} | ${formatDate(e.date)}`
    ).join('\n\n');

    return {
      success: true,
      message: `💸 Expenses (${params.period || 'this_month'})${params.category ? ' — ' + params.category : ''}

Total: ${formatCurrency(total)} (${expenses.length} entries)

${list}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 12: get_expense_report
// ═══════════════════════════════════════
const getExpenseReport: ToolDefinition = {
  name: 'get_expense_report',
  description: 'Get category-wise expense breakdown with percentages.',
  category: ToolCategory.FINANCE,
  permissionLevel: PermissionLevel.AUTO,
  parameters: {
    period: { type: 'string', description: 'Period', enum: ['this_month', 'last_month', 'this_week'] }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const { startDate, endDate } = getDateRange(params.period || 'this_month');

    const expenses = await prisma.expense.findMany({
      where: { tenantId, date: { gte: startDate, lte: endDate } }
    });

    if (expenses.length === 0) {
      return { success: true, message: '💸 No expenses in this period.' };
    }

    const categories: Record<string, number> = {};
    let total = 0;
    expenses.forEach(e => {
      const amt = Number(e.amount);
      categories[e.category] = (categories[e.category] || 0) + amt;
      total += amt;
    });

    const sorted = Object.entries(categories).sort(([, a], [, b]) => b - a);
    const breakdown = sorted.map(([cat, amt]) => {
      const pct = ((amt / total) * 100).toFixed(1);
      return `  ${cat}: ${formatCurrency(amt)} (${pct}%)`;
    }).join('\n');

    // Budget comparison
    const budgets = await prisma.expenseBudget.findMany({ where: { tenantId } });
    let budgetInfo = '';
    if (budgets.length > 0) {
      const overBudget = budgets.filter(b => {
        const spent = categories[b.category] || 0;
        return spent > Number(b.monthlyLimit);
      });
      if (overBudget.length > 0) {
        budgetInfo = '\n\n⚠️ Over Budget:\n' + overBudget.map(b =>
          `  ${b.category}: Spent ${formatCurrency(categories[b.category] || 0)} / Budget ${formatCurrency(Number(b.monthlyLimit))}`
        ).join('\n');
      }
    }

    return {
      success: true,
      message: `📊 Expense Report — Category Breakdown (${params.period || 'this_month'})

💸 Total: ${formatCurrency(total)} (${expenses.length} entries)

${breakdown}${budgetInfo}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 13: get_inventory
// ═══════════════════════════════════════
const getInventory: ToolDefinition = {
  name: 'get_inventory',
  description: 'Get current vehicle stock/inventory — available, booked, sold, in transit.',
  category: ToolCategory.INVENTORY,
  permissionLevel: PermissionLevel.AUTO,
  parameters: {
    status: { type: 'string', description: 'Filter by status', enum: ['AVAILABLE', 'BOOKED', 'SOLD', 'IN_TRANSIT'] },
    model: { type: 'string', description: 'Filter by model name' }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const where: any = { tenantId };
    if (params.status) where.status = params.status;
    if (params.model) where.model = { contains: params.model, mode: 'insensitive' };

    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // Status counts
    const allVehicles = await prisma.vehicle.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: true
    });

    const statusCounts = allVehicles.map(v => `${v.status}: ${v._count}`).join(' | ');

    if (vehicles.length === 0) {
      return { success: true, message: `🏍️ No vehicles found.\n\n📊 Stock: ${statusCounts}` };
    }

    const list = vehicles.map((v, i) =>
      `${i + 1}. ${v.model} ${v.variant || ''} — ${v.color || 'N/A'}\n   Engine: ${v.engineNo || 'N/A'} | Chassis: ${v.chassisNo || 'N/A'}\n   💰 ${formatCurrency(Number(v.price))} | ${v.status}`
    ).join('\n\n');

    return {
      success: true,
      message: `🏍️ Inventory (${vehicles.length} shown)${params.status ? ' — ' + params.status : ''}

📊 Stock Summary: ${statusCounts}

${list}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 14: get_customers
// ═══════════════════════════════════════
const getCustomers: ToolDefinition = {
  name: 'get_customers',
  description: 'Search customers by name or mobile number.',
  category: ToolCategory.SALES,
  permissionLevel: PermissionLevel.AUTO,
  parameters: {
    search: { type: 'string', description: 'Customer name or mobile number', required: true }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const customers = await prisma.customer.findMany({
      where: {
        tenantId,
        OR: [
          { name: { contains: params.search, mode: 'insensitive' } },
          { mobile: { contains: params.search } }
        ]
      },
      take: 10
    });

    if (customers.length === 0) {
      return { success: true, message: `👤 No customers found matching "${params.search}".` };
    }

    const list = customers.map((c, i) =>
      `${i + 1}. ${c.name} — 📱 ${c.mobile}\n   📧 ${c.email || 'N/A'} | 📍 ${c.address || 'N/A'}\n   📅 Since: ${formatDate(c.createdAt)}`
    ).join('\n\n');

    return {
      success: true,
      message: `👤 Customers matching "${params.search}" (${customers.length}):\n\n${list}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 15: get_service_jobs
// ═══════════════════════════════════════
const getServiceJobs: ToolDefinition = {
  name: 'get_service_jobs',
  description: 'Get active service job cards with status, customer info, and billing.',
  category: ToolCategory.INVENTORY,
  permissionLevel: PermissionLevel.AUTO,
  parameters: {
    status: { type: 'string', description: 'Filter by status', enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'INVOICED'] }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const where: any = { tenantId };
    if (params.status) {
      where.status = params.status;
    } else {
      where.status = { in: ['OPEN', 'IN_PROGRESS'] };
    }

    const jobs = await prisma.jobCard.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 15
    });

    if (jobs.length === 0) {
      return { success: true, message: '🔧 No active service jobs found.' };
    }

    const statusEmoji: Record<string, string> = { OPEN: '🟡', IN_PROGRESS: '🔵', COMPLETED: '🟢', INVOICED: '✅' };
    const list = jobs.map((j, i) =>
      `${i + 1}. ${statusEmoji[j.status] || ''} ${j.vehicleRegNo} — ${j.customerName}\n   📱 ${j.customerMobile} | ${j.status}\n   🔧 ${j.complaints || 'N/A'}\n   💰 Billed: ${formatCurrency(Number(j.totalBilled))} | Received: ${formatCurrency(Number(j.totalReceived))} | Pending: ${formatCurrency(Number(j.pendingAmount))}`
    ).join('\n\n');

    return {
      success: true,
      message: `🔧 Service Jobs (${jobs.length})${params.status ? ' — ' + params.status : ' — Active'}:\n\n${list}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 16: get_rto_status
// ═══════════════════════════════════════
const getRtoStatus: ToolDefinition = {
  name: 'get_rto_status',
  description: 'Get pending RTO registration applications with their status.',
  category: ToolCategory.SALES,
  permissionLevel: PermissionLevel.AUTO,
  parameters: {
    status: { type: 'string', description: 'Filter by status', enum: ['APPLIED', 'PENDING', 'APPROVED'] }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const where: any = { booking: { tenantId } };
    if (params.status) {
      where.status = params.status;
    } else {
      where.status = { in: ['APPLIED', 'PENDING'] };
    }

    const rtos = await prisma.rTORegistration.findMany({
      where,
      include: { booking: { include: { customer: true, vehicle: true } } },
      orderBy: { appliedDate: 'desc' },
      take: 15
    });

    if (rtos.length === 0) {
      return { success: true, message: '📄 No pending RTO applications.' };
    }

    const statusEmoji: Record<string, string> = { APPLIED: '🟡', PENDING: '🔵', APPROVED: '🟢' };
    const list = rtos.map((r, i) =>
      `${i + 1}. ${statusEmoji[r.status] || ''} ${r.booking.customer?.name || 'N/A'} — ${r.booking.vehicle?.model || 'N/A'}\n   📋 ${r.booking.bookingNumber} | ${r.status}\n   ${r.registrationNumber ? '🔢 Reg: ' + r.registrationNumber : '📅 Applied: ' + formatDate(r.appliedDate)}${r.insuranceExpiry ? '\n   🛡️ Insurance: ' + formatDate(r.insuranceExpiry) : ''}`
    ).join('\n\n');

    return {
      success: true,
      message: `📄 RTO Applications (${rtos.length}):\n\n${list}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 17: get_promotions
// ═══════════════════════════════════════
const getPromotions: ToolDefinition = {
  name: 'get_promotions',
  description: 'Get active and upcoming promotions/offers.',
  category: ToolCategory.SYSTEM,
  permissionLevel: PermissionLevel.AUTO,
  parameters: {},
  handler: async (_params: any, tenantId: string): Promise<ToolResult> => {
    const now = new Date();
    const promotions = await prisma.promotion.findMany({
      where: { tenantId, validTo: { gte: now } },
      orderBy: { validFrom: 'asc' }
    });

    if (promotions.length === 0) {
      return { success: true, message: '🎯 No active promotions right now.' };
    }

    const active = promotions.filter(p => p.isActive && new Date(p.validFrom) <= now);
    const upcoming = promotions.filter(p => new Date(p.validFrom) > now);

    const formatPromo = (p: any, i: number) =>
      `${i + 1}. ${p.title} — ${p.discountPercent}% OFF\n   📅 ${formatDate(p.validFrom)} — ${formatDate(p.validTo)}\n   ${p.description || ''}${p.applicableBrands ? '\n   🏍️ Brands: ' + p.applicableBrands : ''}`;

    let msg = `🎯 Promotions:\n`;
    if (active.length > 0) {
      msg += `\n✅ Active (${active.length}):\n${active.map(formatPromo).join('\n\n')}\n`;
    }
    if (upcoming.length > 0) {
      msg += `\n📅 Upcoming (${upcoming.length}):\n${upcoming.map(formatPromo).join('\n\n')}`;
    }

    return { success: true, message: msg };
  }
};

// ═══════════════════════════════════════
// TOOL 18: get_insurance_expiring
// ═══════════════════════════════════════
const getInsuranceExpiring: ToolDefinition = {
  name: 'get_insurance_expiring',
  description: 'Get list of vehicles/customers whose insurance is expiring soon (within 30 days).',
  category: ToolCategory.SALES,
  permissionLevel: PermissionLevel.AUTO,
  parameters: {
    days: { type: 'number', description: 'Days ahead to check (default 30)' }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const days = params.days || 30;
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const rtos = await prisma.rTORegistration.findMany({
      where: {
        booking: { tenantId },
        insuranceExpiry: { gte: now, lte: futureDate }
      },
      include: { booking: { include: { customer: true, vehicle: true } } },
      orderBy: { insuranceExpiry: 'asc' }
    });

    if (rtos.length === 0) {
      return { success: true, message: `🛡️ No insurance expiring in the next ${days} days. All good! ✅` };
    }

    const list = rtos.map((r, i) => {
      const daysLeft = Math.ceil((new Date(r.insuranceExpiry!).getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      const urgency = daysLeft <= 7 ? '🔴' : daysLeft <= 15 ? '🟡' : '🟢';
      return `${i + 1}. ${urgency} ${r.booking.customer?.name || 'N/A'} — ${r.booking.vehicle?.model || 'N/A'}\n   📱 ${r.booking.customer?.mobile || 'N/A'}\n   🛡️ Expires: ${formatDate(r.insuranceExpiry)} (${daysLeft} days left)\n   ${r.registrationNumber ? '🔢 ' + r.registrationNumber : ''}`;
    }).join('\n\n');

    return {
      success: true,
      message: `🛡️ Insurance Expiring (${rtos.length} in next ${days} days):\n\n${list}`
    };
  }
};

// ═══════════════════════════════════════
// REGISTER ALL TOOLS
// ═══════════════════════════════════════
export function registerAllDataTools(): void {
  const tools = [
    getDashboardStats,
    getSalesReport,
    getRevenueReport,
    getBookings,
    getBookingDetail,
    getLeads,
    getLeadDetail,
    getPendingFollowups,
    getCashSummary,
    getDaybook,
    getExpenses,
    getExpenseReport,
    getInventory,
    getCustomers,
    getServiceJobs,
    getRtoStatus,
    getPromotions,
    getInsuranceExpiring
  ];

  tools.forEach(tool => registerTool(tool));
  console.log(`✅ Registered ${tools.length} data tools`);
}

// ═══════════════════════════════════════
// HELPER: Date Range Calculator
// ═══════════════════════════════════════
function getDateRange(period?: string, startStr?: string, endStr?: string): { startDate: Date; endDate: Date } {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();

  if (startStr && endStr) {
    return { startDate: new Date(startStr), endDate: new Date(endStr) };
  }

  switch (period) {
    case 'today':
      startDate = todayStart();
      endDate = now;
      break;
    case 'this_week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);
      endDate = now;
      break;
    case 'this_month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = now;
      break;
    case 'last_month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      break;
    default:
      startDate = todayStart();
      endDate = now;
  }

  return { startDate, endDate };
}
