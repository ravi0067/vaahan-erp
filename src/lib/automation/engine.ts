/**
 * VaahanERP Automation Engine
 * Handles scheduled jobs and event-triggered actions
 * Runs via Vercel Cron (/api/cron/*)
 */

import prisma from '@/lib/prisma';

// Helper: format currency
function formatCurrency(amount: number | any): string {
  const num = typeof amount === 'number' ? amount : Number(amount || 0);
  return '₹' + num.toLocaleString('en-IN');
}

function formatDate(date: Date | string | null): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Exotel WhatsApp helper
async function sendWhatsAppTemplate(
  phone: string,
  templateName: string,
  variables: string[]
): Promise<boolean> {
  const accountSid = process.env.EXOTEL_ACCOUNT_SID;
  const apiKey = process.env.EXOTEL_API_KEY;
  const apiToken = process.env.EXOTEL_API_TOKEN;
  const baseUrl = process.env.EXOTEL_BASE_URL || 'https://api.exotel.com';
  const whatsappNumber = process.env.EXOTEL_WHATSAPP_NUMBER;

  if (!accountSid || !apiKey || !apiToken) return false;

  const formattedPhone = phone.replace(/\D/g, '');
  const fullPhone = formattedPhone.length === 10 ? `91${formattedPhone}` : formattedPhone;

  try {
    const basicAuth = Buffer.from(`${apiKey}:${apiToken}`).toString('base64');
    const res = await fetch(`${baseUrl}/v2/accounts/${accountSid}/messages`, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${basicAuth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: whatsappNumber,
        to: fullPhone,
        channel: 'whatsapp',
        template: {
          name: templateName,
          components: [{ type: 'body', parameters: variables.map(v => ({ type: 'text', text: v })) }]
        }
      })
    });
    return res.ok || res.status === 201;
  } catch {
    return false;
  }
}

// Log communication
async function logComm(tenantId: string, channel: string, phone: string, purpose: string, status: string): Promise<void> {
  try {
    await prisma.communicationLog.create({
      data: { tenantId, customerName: phone, phone, channel, purpose, status, direction: 'outbound' }
    });
  } catch (e) {
    console.error('Log comm failed:', e);
  }
}

// ═══════════════════════════════════════
// JOB 1: Follow-up Reminders (Daily 9 AM IST)
// ═══════════════════════════════════════
export async function runFollowUpReminders(): Promise<{ sent: number; total: number; errors: number }> {
  console.log('🔔 Running: Follow-up Reminders');
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  // Get all tenants with active leads
  const tenants = await prisma.tenant.findMany({ where: { status: 'ACTIVE' } });
  let totalSent = 0, totalLeads = 0, totalErrors = 0;

  for (const tenant of tenants) {
    const leads = await prisma.lead.findMany({
      where: {
        tenantId: tenant.id,
        followUpDate: { lte: endOfDay },
        status: { in: ['NEW', 'CONTACTED', 'FOLLOWUP'] }
      },
      include: { assignedTo: true }
    });

    totalLeads += leads.length;
    if (leads.length === 0) continue;

    // Group by assigned sales exec
    const execLeads = new Map<string, typeof leads>();
    leads.forEach(lead => {
      const execId = lead.assignedToId || 'unassigned';
      const existing = execLeads.get(execId) || [];
      existing.push(lead);
      execLeads.set(execId, existing);
    });

    // Send reminders to each exec (via WhatsApp to owner for now)
    const owner = await prisma.user.findFirst({
      where: { tenantId: tenant.id, role: { in: ['OWNER', 'SUPER_ADMIN'] } }
    });

    if (owner) {
      // Build summary message
      const overdue = leads.filter(l => l.followUpDate && l.followUpDate < now);
      const today = leads.filter(l => l.followUpDate && l.followUpDate >= now);

      let summaryParts = [`📞 Follow-up Summary — ${leads.length} total`];
      if (overdue.length > 0) summaryParts.push(`⚠️ ${overdue.length} OVERDUE`);
      if (today.length > 0) summaryParts.push(`📅 ${today.length} Today`);

      const topLeads = leads.slice(0, 5).map(l =>
        `${l.dealHealth === 'HOT' ? '🔥' : l.dealHealth === 'WARM' ? '🟡' : '🔵'} ${l.customerName} — ${l.interestedModel || 'N/A'}`
      ).join('\n');

      // Log the automation run
      await logComm(tenant.id, 'AUTO_FOLLOWUP', owner.phone || 'system', summaryParts.join(' | '), 'SENT');
      totalSent++;
    }
  }

  console.log(`✅ Follow-up Reminders: ${totalSent} sent, ${totalLeads} leads, ${totalErrors} errors`);
  return { sent: totalSent, total: totalLeads, errors: totalErrors };
}

// ═══════════════════════════════════════
// JOB 2: Insurance Expiry Check (Daily 10 AM IST)
// ═══════════════════════════════════════
export async function runInsuranceCheck(): Promise<{ sent: number; total: number }> {
  console.log('🛡️ Running: Insurance Expiry Check');
  const now = new Date();
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const rtos = await prisma.rTORegistration.findMany({
    where: { insuranceExpiry: { gte: now, lte: thirtyDays } },
    include: { booking: { include: { customer: true, tenant: true } } }
  });

  let sent = 0;
  for (const rto of rtos) {
    const customer = rto.booking.customer;
    if (!customer?.mobile) continue;

    const daysLeft = Math.ceil((new Date(rto.insuranceExpiry!).getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    
    // Only send WhatsApp for urgent (≤7 days)
    if (daysLeft <= 7) {
      const success = await sendWhatsAppTemplate(customer.mobile, 'insurance_expiry', [
        customer.name,
        formatDate(rto.insuranceExpiry),
        process.env.NEXTAUTH_URL || 'https://vaahan-erp.vercel.app',
        'VaahanERP'
      ]);

      await logComm(rto.booking.tenantId, 'AUTO_INSURANCE', customer.mobile, `Insurance expiry: ${formatDate(rto.insuranceExpiry)}`, success ? 'SENT' : 'FAILED');
      if (success) sent++;

      await new Promise(r => setTimeout(r, 1000)); // Rate limit
    }
  }

  console.log(`✅ Insurance Check: ${sent} sent, ${rtos.length} expiring`);
  return { sent, total: rtos.length };
}

// ═══════════════════════════════════════
// JOB 3: Daily Report (Daily 9 PM IST)
// ═══════════════════════════════════════
export async function runDailyReport(): Promise<{ tenants: number; reports: string[] }> {
  console.log('📊 Running: Daily Report Generation');
  const tenants = await prisma.tenant.findMany({ where: { status: 'ACTIVE' } });
  const reports: string[] = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const tenant of tenants) {
    const [bookings, leads, cashIn, cashOut, serviceJobs, vehicles, expenses] = await Promise.all([
      prisma.booking.count({ where: { tenantId: tenant.id, createdAt: { gte: today } } }),
      prisma.lead.count({ where: { tenantId: tenant.id, createdAt: { gte: today } } }),
      prisma.cashTransaction.aggregate({ where: { tenantId: tenant.id, type: 'INFLOW', createdAt: { gte: today } }, _sum: { amount: true } }),
      prisma.cashTransaction.aggregate({ where: { tenantId: tenant.id, type: 'OUTFLOW', createdAt: { gte: today } }, _sum: { amount: true } }),
      prisma.jobCard.count({ where: { tenantId: tenant.id, status: 'IN_PROGRESS' } }),
      prisma.vehicle.count({ where: { tenantId: tenant.id, status: 'SOLD', createdAt: { gte: today } } }),
      prisma.expense.aggregate({ where: { tenantId: tenant.id, createdAt: { gte: today } }, _sum: { amount: true } })
    ]);

    const inflow = Number(cashIn._sum.amount || 0);
    const outflow = Number(cashOut._sum.amount || 0);
    const expenseAmt = Number(expenses._sum.amount || 0);

    // Check daybook lock
    const daybook = await prisma.daybookEntry.findFirst({
      where: { tenantId: tenant.id, date: today }
    });

    // Pending follow-ups
    const pendingFollowups = await prisma.lead.count({
      where: { tenantId: tenant.id, followUpDate: { lte: new Date() }, status: { in: ['NEW', 'CONTACTED', 'FOLLOWUP'] } }
    });

    // Insurance expiring this week
    const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const insuranceExpiring = await prisma.rTORegistration.count({
      where: { booking: { tenantId: tenant.id }, insuranceExpiry: { gte: new Date(), lte: sevenDays } }
    });

    const report = `📊 Daily Report — ${formatDate(new Date())} (${tenant.name})

🏍️ Vehicles Sold: ${vehicles}
📋 New Bookings: ${bookings}
👥 New Leads: ${leads}
💰 Cash In: ${formatCurrency(inflow)} | Out: ${formatCurrency(outflow)}
💸 Expenses: ${formatCurrency(expenseAmt)}
🔧 Active Service: ${serviceJobs}
⚠️ Pending Follow-ups: ${pendingFollowups}
🛡️ Insurance Expiring (7d): ${insuranceExpiring}
🔒 Daybook: ${daybook?.isLocked ? 'Locked ✅' : 'NOT LOCKED ⚠️'}
📈 Net Cash: ${formatCurrency(inflow - outflow)}`;

    reports.push(report);

    // Log
    await logComm(tenant.id, 'AUTO_DAILY_REPORT', 'system', report.substring(0, 200), 'GENERATED');
  }

  console.log(`✅ Daily Reports: ${reports.length} generated`);
  return { tenants: tenants.length, reports };
}

// ═══════════════════════════════════════
// JOB 4: Weekly Report (Every Monday 10 AM IST)
// ═══════════════════════════════════════
export async function runWeeklyReport(): Promise<{ tenants: number }> {
  console.log('📊 Running: Weekly Report');
  const tenants = await prisma.tenant.findMany({ where: { status: 'ACTIVE' } });

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  for (const tenant of tenants) {
    const [bookings, leads, leadsConverted, cashIn, cashOut, vehiclesSold] = await Promise.all([
      prisma.booking.count({ where: { tenantId: tenant.id, createdAt: { gte: weekAgo } } }),
      prisma.lead.count({ where: { tenantId: tenant.id, createdAt: { gte: weekAgo } } }),
      prisma.lead.count({ where: { tenantId: tenant.id, status: 'CONVERTED', updatedAt: { gte: weekAgo } } }),
      prisma.cashTransaction.aggregate({ where: { tenantId: tenant.id, type: 'INFLOW', createdAt: { gte: weekAgo } }, _sum: { amount: true } }),
      prisma.cashTransaction.aggregate({ where: { tenantId: tenant.id, type: 'OUTFLOW', createdAt: { gte: weekAgo } }, _sum: { amount: true } }),
      prisma.vehicle.count({ where: { tenantId: tenant.id, status: 'SOLD', createdAt: { gte: weekAgo } } })
    ]);

    const conversionRate = leads > 0 ? ((leadsConverted / leads) * 100).toFixed(1) : '0';

    await logComm(tenant.id, 'AUTO_WEEKLY_REPORT', 'system',
      `Weekly: ${vehiclesSold} sold, ${bookings} bookings, ${leads} leads, ${conversionRate}% conversion, ${formatCurrency(Number(cashIn._sum.amount || 0))} inflow`,
      'GENERATED'
    );
  }

  console.log(`✅ Weekly Reports: ${tenants.length} generated`);
  return { tenants: tenants.length };
}

// ═══════════════════════════════════════
// JOB 5: Monthly Report (1st of month 10 AM)
// ═══════════════════════════════════════
export async function runMonthlyReport(): Promise<{ tenants: number }> {
  console.log('📊 Running: Monthly Report');
  const tenants = await prisma.tenant.findMany({ where: { status: 'ACTIVE' } });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  for (const tenant of tenants) {
    const [bookings, revenue, expenses, leadsTotal, leadsConverted, vehiclesSold] = await Promise.all([
      prisma.booking.count({ where: { tenantId: tenant.id, createdAt: { gte: monthStart, lte: monthEnd } } }),
      prisma.cashTransaction.aggregate({ where: { tenantId: tenant.id, type: 'INFLOW', createdAt: { gte: monthStart, lte: monthEnd } }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { tenantId: tenant.id, date: { gte: monthStart, lte: monthEnd } }, _sum: { amount: true } }),
      prisma.lead.count({ where: { tenantId: tenant.id, createdAt: { gte: monthStart, lte: monthEnd } } }),
      prisma.lead.count({ where: { tenantId: tenant.id, status: 'CONVERTED', updatedAt: { gte: monthStart, lte: monthEnd } } }),
      prisma.vehicle.count({ where: { tenantId: tenant.id, status: 'SOLD', createdAt: { gte: monthStart, lte: monthEnd } } })
    ]);

    const revenueAmt = Number(revenue._sum.amount || 0);
    const expenseAmt = Number(expenses._sum.amount || 0);

    await logComm(tenant.id, 'AUTO_MONTHLY_REPORT', 'system',
      `Monthly: ${vehiclesSold} sold, Revenue ${formatCurrency(revenueAmt)}, Expenses ${formatCurrency(expenseAmt)}, Profit ${formatCurrency(revenueAmt - expenseAmt)}, ${leadsConverted}/${leadsTotal} leads converted`,
      'GENERATED'
    );
  }

  return { tenants: tenants.length };
}

// ═══════════════════════════════════════
// JOB 6: System Health Check (Every 6 hours)
// ═══════════════════════════════════════
export async function runSystemHealthCheck(): Promise<{ status: string; checks: Record<string, boolean> }> {
  console.log('🏥 Running: System Health Check');
  const checks: Record<string, boolean> = {};

  // DB check
  try {
    await prisma.tenant.count();
    checks.database = true;
  } catch {
    checks.database = false;
  }

  // Gemini API check
  try {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      checks.gemini = res.ok;
    } else {
      checks.gemini = false;
    }
  } catch {
    checks.gemini = false;
  }

  // Exotel check
  try {
    const sid = process.env.EXOTEL_ACCOUNT_SID;
    const apiKey = process.env.EXOTEL_API_KEY;
    const apiToken = process.env.EXOTEL_API_TOKEN;
    if (sid && apiKey && apiToken) {
      const basicAuth = Buffer.from(`${apiKey}:${apiToken}`).toString('base64');
      const res = await fetch(`https://api.exotel.com/v1/Accounts/${sid}`, {
        headers: { 'Authorization': `Basic ${basicAuth}` }
      });
      checks.exotel = res.ok;
    } else {
      checks.exotel = false;
    }
  } catch {
    checks.exotel = false;
  }

  // Site check
  try {
    const url = process.env.NEXTAUTH_URL || 'https://vaahan-erp.vercel.app';
    const res = await fetch(url, { method: 'HEAD' });
    checks.website = res.ok;
  } catch {
    checks.website = false;
  }

  const allHealthy = Object.values(checks).every(v => v);
  const status = allHealthy ? 'healthy' : 'degraded';

  console.log(`✅ Health Check: ${status}`, checks);
  return { status, checks };
}

// ═══════════════════════════════════════
// JOB 7: Daybook Lock Check (Daily 10 PM IST)
// ═══════════════════════════════════════
export async function runDaybookLockCheck(): Promise<{ unlocked: number }> {
  console.log('📒 Running: Daybook Lock Check');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tenants = await prisma.tenant.findMany({ where: { status: 'ACTIVE' } });
  let unlockedCount = 0;

  for (const tenant of tenants) {
    const daybook = await prisma.daybookEntry.findFirst({
      where: { tenantId: tenant.id, date: today }
    });

    if (!daybook || !daybook.isLocked) {
      unlockedCount++;
      await logComm(tenant.id, 'AUTO_DAYBOOK_CHECK', 'system',
        `Daybook for ${formatDate(today)} is NOT LOCKED`,
        'ALERT'
      );
    }
  }

  console.log(`✅ Daybook Check: ${unlockedCount} unlocked`);
  return { unlocked: unlockedCount };
}

// ═══════════════════════════════════════
// EVENT TRIGGERS
// ═══════════════════════════════════════

/**
 * EVENT 1: New Lead Created → Notify assigned exec
 */
export async function onLeadCreated(leadId: string): Promise<void> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { assignedTo: true }
  });
  if (!lead) return;

  if (lead.assignedTo?.phone) {
    await logComm(lead.tenantId, 'EVENT_NEW_LEAD', lead.assignedTo.phone,
      `New lead: ${lead.customerName} — ${lead.interestedModel || 'N/A'}`,
      'TRIGGERED'
    );
  }
}

/**
 * EVENT 2: Payment Received → Notify customer + owner
 */
export async function onPaymentReceived(bookingId: string, amount: number): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { customer: true, tenant: true }
  });
  if (!booking?.customer?.mobile) return;

  await logComm(booking.tenantId, 'EVENT_PAYMENT', booking.customer.mobile,
    `Payment ${formatCurrency(amount)} received for ${booking.bookingNumber}`,
    'TRIGGERED'
  );
}

/**
 * EVENT 3: Booking Status Changed → Notify customer
 */
export async function onBookingStatusChanged(bookingId: string, newStatus: string): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { customer: true, vehicle: true }
  });
  if (!booking?.customer?.mobile) return;

  if (newStatus === 'CONFIRMED' || newStatus === 'READY' || newStatus === 'DELIVERED') {
    const templateMap: Record<string, string> = {
      'CONFIRMED': 'booking_confirmation',
      'READY': 'booking_confirmation',
      'DELIVERED': 'booking_confirmation'
    };

    const vehicleName = booking.vehicle ? `${booking.vehicle.model} ${booking.vehicle.variant || ''}` : 'Vehicle';
    await sendWhatsAppTemplate(booking.customer.mobile, templateMap[newStatus] || 'booking_confirmation', [
      booking.customer.name,
      vehicleName,
      formatDate(new Date()),
      'VaahanERP'
    ]);

    await logComm(booking.tenantId, 'EVENT_BOOKING_STATUS', booking.customer.mobile,
      `Booking ${booking.bookingNumber} → ${newStatus}`,
      'SENT'
    );
  }
}

/**
 * EVENT 4: Service Complete → Notify customer
 */
export async function onServiceComplete(jobCardId: string): Promise<void> {
  const job = await prisma.jobCard.findUnique({ where: { id: jobCardId } });
  if (!job?.customerMobile) return;

  await sendWhatsAppTemplate(job.customerMobile, 'service_reminder', [
    job.customerName,
    formatDate(new Date()),
    process.env.NEXTAUTH_URL || 'https://vaahan-erp.vercel.app',
    'VaahanERP'
  ]);

  await logComm(job.tenantId, 'EVENT_SERVICE_DONE', job.customerMobile,
    `Service complete: ${job.vehicleRegNo}`,
    'SENT'
  );
}

/**
 * EVENT 5: Expense Over Budget → Alert owner
 */
export async function onExpenseOverBudget(tenantId: string, category: string, spent: number, budget: number): Promise<void> {
  await logComm(tenantId, 'EVENT_BUDGET_ALERT', 'system',
    `⚠️ Budget exceeded: ${category} — Spent ${formatCurrency(spent)} / Budget ${formatCurrency(budget)}`,
    'ALERT'
  );
}

/**
 * EVENT 6: Security Alert → Failed logins
 */
export async function onSecurityAlert(tenantId: string, userId: string, alertType: string): Promise<void> {
  await logComm(tenantId, 'EVENT_SECURITY', 'system',
    `🚨 Security: ${alertType} — User: ${userId}`,
    'ALERT'
  );
}
