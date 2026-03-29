/**
 * VaahanERP AI DevOps + Report Tools — 10 Tools
 * System monitoring, GitHub issues, deploy, PDF report generation
 */

import prisma from '@/lib/prisma';
import { ToolDefinition, ToolCategory, PermissionLevel, ToolResult } from './types';
import { registerTool } from './registry';

function formatCurrency(amount: number | any): string {
  const num = typeof amount === 'number' ? amount : Number(amount || 0);
  return '₹' + num.toLocaleString('en-IN');
}

function formatDate(date: Date | string | null): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ═══════════════════════════════════════
// TOOL 43: get_error_logs
// ═══════════════════════════════════════
const getErrorLogs: ToolDefinition = {
  name: 'get_error_logs',
  description: 'Get recent system errors and communication failures from logs.',
  category: ToolCategory.SYSTEM,
  permissionLevel: PermissionLevel.AUTO,
  parameters: {
    limit: { type: 'number', description: 'Max results (default 20)' }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const logs = await prisma.communicationLog.findMany({
      where: { tenantId, status: { in: ['FAILED', 'ALERT', 'ERROR'] } },
      orderBy: { createdAt: 'desc' },
      take: params.limit || 20
    });

    if (logs.length === 0) {
      return { success: true, message: '✅ No errors found! System running smoothly.' };
    }

    const list = logs.map((l, i) =>
      `${i + 1}. ❌ ${l.channel} — ${l.status}\n   📝 ${l.purpose || 'N/A'}\n   📅 ${formatDate(l.createdAt)}`
    ).join('\n\n');

    return { success: true, message: `🔍 Error Logs (${logs.length}):\n\n${list}` };
  }
};

// ═══════════════════════════════════════
// TOOL 44: get_deployment_status
// ═══════════════════════════════════════
const getDeploymentStatus: ToolDefinition = {
  name: 'get_deployment_status',
  description: 'Check current Vercel deployment status and recent deployments.',
  category: ToolCategory.SYSTEM,
  permissionLevel: PermissionLevel.AUTO,
  parameters: {},
  handler: async (_params: any, _tenantId: string): Promise<ToolResult> => {
    const vercelToken = process.env.VERCEL_TOKEN;
    const projectId = process.env.VERCEL_PROJECT_ID;

    if (!vercelToken) {
      return { success: true, message: '⚠️ Vercel token not configured. Dashboard se check karo: vercel.com' };
    }

    try {
      const res = await fetch(
        `https://api.vercel.com/v6/deployments?projectId=${projectId || ''}&limit=5`,
        { headers: { 'Authorization': `Bearer ${vercelToken}` } }
      );
      const data = await res.json();

      if (!data.deployments || data.deployments.length === 0) {
        return { success: true, message: '📦 No deployments found.' };
      }

      const deploys = data.deployments.slice(0, 5).map((d: any, i: number) => {
        const statusEmoji = d.state === 'READY' ? '✅' : d.state === 'ERROR' ? '❌' : '🔄';
        return `${i + 1}. ${statusEmoji} ${d.state} — ${formatDate(d.created)}\n   🔗 ${d.url || 'N/A'}`;
      }).join('\n\n');

      return { success: true, message: `🚀 Vercel Deployments:\n\n${deploys}` };
    } catch (error: any) {
      return { success: false, message: `❌ Vercel API error: ${error.message}` };
    }
  }
};

// ═══════════════════════════════════════
// TOOL 45: create_github_issue
// ═══════════════════════════════════════
const createGithubIssue: ToolDefinition = {
  name: 'create_github_issue',
  description: 'Create a GitHub issue for bug reports or feature requests.',
  category: ToolCategory.SYSTEM,
  permissionLevel: PermissionLevel.CONFIRM,
  parameters: {
    title: { type: 'string', description: 'Issue title', required: true },
    body: { type: 'string', description: 'Issue description', required: true },
    labels: { type: 'string', description: 'Labels (comma separated, e.g., bug,urgent)' }
  },
  handler: async (params: any, _tenantId: string): Promise<ToolResult> => {
    const githubToken = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO || 'ravi0067/vaahan-erp';

    if (!githubToken) {
      return { success: false, message: '❌ GitHub token not configured.' };
    }

    try {
      const labels = params.labels ? params.labels.split(',').map((l: string) => l.trim()) : [];

      const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: params.title, body: params.body, labels })
      });

      const data = await res.json();

      if (res.ok) {
        return {
          success: true,
          message: `✅ GitHub Issue Created!\n\n📋 #${data.number}: ${data.title}\n🔗 ${data.html_url}\n🏷️ Labels: ${labels.join(', ') || 'none'}`
        };
      } else {
        return { success: false, message: `❌ GitHub Error: ${data.message}` };
      }
    } catch (error: any) {
      return { success: false, message: `❌ GitHub API error: ${error.message}` };
    }
  }
};

// ═══════════════════════════════════════
// TOOL 46: get_github_issues
// ═══════════════════════════════════════
const getGithubIssues: ToolDefinition = {
  name: 'get_github_issues',
  description: 'List open GitHub issues for the VaahanERP repository.',
  category: ToolCategory.SYSTEM,
  permissionLevel: PermissionLevel.AUTO,
  parameters: {
    state: { type: 'string', description: 'Issue state', enum: ['open', 'closed', 'all'] },
    limit: { type: 'number', description: 'Max results (default 10)' }
  },
  handler: async (params: any, _tenantId: string): Promise<ToolResult> => {
    const githubToken = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO || 'ravi0067/vaahan-erp';

    if (!githubToken) {
      return { success: false, message: '❌ GitHub token not configured.' };
    }

    try {
      const state = params.state || 'open';
      const res = await fetch(
        `https://api.github.com/repos/${repo}/issues?state=${state}&per_page=${params.limit || 10}`,
        { headers: { 'Authorization': `token ${githubToken}` } }
      );
      const issues = await res.json();

      if (!Array.isArray(issues) || issues.length === 0) {
        return { success: true, message: `📋 No ${state} issues found.` };
      }

      const list = issues.map((issue: any, i: number) => {
        const labels = issue.labels?.map((l: any) => l.name).join(', ') || '';
        return `${i + 1}. ${issue.state === 'open' ? '🟢' : '🔴'} #${issue.number}: ${issue.title}\n   ${labels ? '🏷️ ' + labels + ' | ' : ''}📅 ${formatDate(issue.created_at)}`;
      }).join('\n\n');

      return { success: true, message: `📋 GitHub Issues (${state}) — ${issues.length}:\n\n${list}` };
    } catch (error: any) {
      return { success: false, message: `❌ GitHub API error: ${error.message}` };
    }
  }
};

// ═══════════════════════════════════════
// TOOL 47: trigger_deploy
// ═══════════════════════════════════════
const triggerDeploy: ToolDefinition = {
  name: 'trigger_deploy',
  description: 'Trigger a Vercel deployment. REQUIRES MANUAL APPROVAL — high-risk action.',
  category: ToolCategory.SYSTEM,
  permissionLevel: PermissionLevel.MANUAL_APPROVAL,
  parameters: {},
  handler: async (_params: any, _tenantId: string): Promise<ToolResult> => {
    return {
      success: true,
      requiresConfirmation: true,
      message: `🔐 **Manual Approval Required**\n\nDeploy action requires manual approval.\n\n📋 Steps:\n1. Go to GitHub: github.com/ravi0067/vaahan-erp\n2. Or Vercel Dashboard: vercel.com\n3. Trigger deploy manually\n\n⚠️ AI cannot auto-deploy for safety. Human approval required.`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 48: get_system_health
// ═══════════════════════════════════════
const getSystemHealth: ToolDefinition = {
  name: 'get_system_health',
  description: 'Check all system services health — database, AI, Exotel, website.',
  category: ToolCategory.SYSTEM,
  permissionLevel: PermissionLevel.AUTO,
  parameters: {},
  handler: async (_params: any, _tenantId: string): Promise<ToolResult> => {
    const checks: Record<string, { status: boolean; latency?: number }> = {};

    // DB check
    const dbStart = Date.now();
    try { await prisma.tenant.count(); checks.database = { status: true, latency: Date.now() - dbStart }; }
    catch { checks.database = { status: false }; }

    // Gemini check
    const aiStart = Date.now();
    try {
      const key = process.env.GEMINI_API_KEY;
      if (key) {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        checks.gemini_ai = { status: res.ok, latency: Date.now() - aiStart };
      } else { checks.gemini_ai = { status: false }; }
    } catch { checks.gemini_ai = { status: false }; }

    // Exotel check
    const exStart = Date.now();
    try {
      const sid = process.env.EXOTEL_ACCOUNT_SID;
      const apiKey = process.env.EXOTEL_API_KEY;
      const apiToken = process.env.EXOTEL_API_TOKEN;
      if (sid && apiKey && apiToken) {
        const basicAuth = Buffer.from(`${apiKey}:${apiToken}`).toString('base64');
        const res = await fetch(`https://api.exotel.com/v1/Accounts/${sid}`, { headers: { 'Authorization': `Basic ${basicAuth}` } });
        checks.exotel = { status: res.ok, latency: Date.now() - exStart };
      } else { checks.exotel = { status: false }; }
    } catch { checks.exotel = { status: false }; }

    // Website check
    const webStart = Date.now();
    try {
      const url = process.env.NEXTAUTH_URL || 'https://vaahan-erp.vercel.app';
      const res = await fetch(url, { method: 'HEAD' });
      checks.website = { status: res.ok, latency: Date.now() - webStart };
    } catch { checks.website = { status: false }; }

    const allHealthy = Object.values(checks).every(c => c.status);
    const statusEmoji = allHealthy ? '🟢' : '🟡';

    const report = Object.entries(checks).map(([service, check]) =>
      `${check.status ? '✅' : '❌'} ${service}: ${check.status ? 'UP' : 'DOWN'}${check.latency ? ` (${check.latency}ms)` : ''}`
    ).join('\n');

    return {
      success: true,
      message: `${statusEmoji} System Health — ${allHealthy ? 'All Healthy' : 'Issues Detected'}\n\n${report}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 49: generate_daily_report
// ═══════════════════════════════════════
const generateDailyReportTool: ToolDefinition = {
  name: 'generate_daily_report',
  description: 'Generate a detailed daily business report with all key metrics.',
  category: ToolCategory.SYSTEM,
  permissionLevel: PermissionLevel.AUTO,
  parameters: {
    date: { type: 'string', description: 'Date (YYYY-MM-DD), default today' }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const targetDate = params.date ? new Date(params.date) : new Date();
    const startOfDay = new Date(targetDate); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate); endOfDay.setHours(23, 59, 59, 999);

    const [bookings, leads, hotLeads, cashIn, cashOut, expenses, vehiclesSold, serviceJobs, pendingFollowups] = await Promise.all([
      prisma.booking.count({ where: { tenantId, createdAt: { gte: startOfDay, lte: endOfDay } } }),
      prisma.lead.count({ where: { tenantId, createdAt: { gte: startOfDay, lte: endOfDay } } }),
      prisma.lead.count({ where: { tenantId, dealHealth: 'HOT', status: { in: ['NEW', 'CONTACTED', 'FOLLOWUP'] } } }),
      prisma.cashTransaction.aggregate({ where: { tenantId, type: 'INFLOW', createdAt: { gte: startOfDay, lte: endOfDay } }, _sum: { amount: true } }),
      prisma.cashTransaction.aggregate({ where: { tenantId, type: 'OUTFLOW', createdAt: { gte: startOfDay, lte: endOfDay } }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { tenantId, date: { gte: startOfDay, lte: endOfDay } }, _sum: { amount: true } }),
      prisma.vehicle.count({ where: { tenantId, status: 'SOLD', createdAt: { gte: startOfDay, lte: endOfDay } } }),
      prisma.jobCard.count({ where: { tenantId, status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      prisma.lead.count({ where: { tenantId, followUpDate: { lte: endOfDay }, status: { in: ['NEW', 'CONTACTED', 'FOLLOWUP'] } } })
    ]);

    const inAmt = Number(cashIn._sum.amount || 0);
    const outAmt = Number(cashOut._sum.amount || 0);
    const expAmt = Number(expenses._sum.amount || 0);

    // Active bookings
    const activeBookings = await prisma.booking.count({ where: { tenantId, status: { in: ['CONFIRMED', 'RTO_PENDING', 'READY'] } } });
    const pendingRTO = await prisma.rTORegistration.count({ where: { booking: { tenantId }, status: { in: ['APPLIED', 'PENDING'] } } });
    const availableStock = await prisma.vehicle.count({ where: { tenantId, status: 'AVAILABLE' } });

    // Insurance expiring
    const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const insuranceExpiring = await prisma.rTORegistration.count({ where: { booking: { tenantId }, insuranceExpiry: { gte: new Date(), lte: sevenDays } } });

    // Daybook
    const daybook = await prisma.daybookEntry.findFirst({ where: { tenantId, date: startOfDay } });

    return {
      success: true,
      message: `📊 **Daily Report — ${formatDate(targetDate)}**

💰 **Revenue & Cash:**
  📥 Cash In: ${formatCurrency(inAmt)}
  📤 Cash Out: ${formatCurrency(outAmt)}
  💸 Expenses: ${formatCurrency(expAmt)}
  📈 Net: ${formatCurrency(inAmt - outAmt)}

🏍️ **Sales:**
  Vehicles Sold: ${vehiclesSold}
  New Bookings: ${bookings}
  Active Bookings: ${activeBookings}

👥 **Leads:**
  New Today: ${leads}
  🔥 Hot Leads: ${hotLeads}
  📞 Pending Follow-ups: ${pendingFollowups}

🔧 **Operations:**
  Active Service Jobs: ${serviceJobs}
  Pending RTO: ${pendingRTO}
  Available Stock: ${availableStock}

⚠️ **Alerts:**
  🛡️ Insurance Expiring (7d): ${insuranceExpiring}
  📞 Overdue Follow-ups: ${pendingFollowups}
  🔒 Daybook: ${daybook?.isLocked ? 'Locked ✅' : 'NOT LOCKED ⚠️'}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 50: generate_monthly_report
// ═══════════════════════════════════════
const generateMonthlyReportTool: ToolDefinition = {
  name: 'generate_monthly_report',
  description: 'Generate monthly P&L report with revenue, expenses, profit, and key metrics.',
  category: ToolCategory.SYSTEM,
  permissionLevel: PermissionLevel.AUTO,
  parameters: {
    month: { type: 'number', description: 'Month (1-12), default current' },
    year: { type: 'number', description: 'Year, default current' }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const now = new Date();
    const month = (params.month || now.getMonth() + 1) - 1;
    const year = params.year || now.getFullYear();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);
    const monthName = startDate.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

    const [revenue, expenses, bookings, vehiclesSold, leads, leadsConverted, serviceRevenue] = await Promise.all([
      prisma.cashTransaction.aggregate({ where: { tenantId, type: 'INFLOW', createdAt: { gte: startDate, lte: endDate } }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { tenantId, date: { gte: startDate, lte: endDate } }, _sum: { amount: true } }),
      prisma.booking.count({ where: { tenantId, createdAt: { gte: startDate, lte: endDate } } }),
      prisma.vehicle.count({ where: { tenantId, status: 'SOLD', createdAt: { gte: startDate, lte: endDate } } }),
      prisma.lead.count({ where: { tenantId, createdAt: { gte: startDate, lte: endDate } } }),
      prisma.lead.count({ where: { tenantId, status: 'CONVERTED', updatedAt: { gte: startDate, lte: endDate } } }),
      prisma.jobCard.aggregate({ where: { tenantId, createdAt: { gte: startDate, lte: endDate } }, _sum: { totalBilled: true } })
    ]);

    const revenueAmt = Number(revenue._sum.amount || 0);
    const expenseAmt = Number(expenses._sum.amount || 0);
    const serviceAmt = Number(serviceRevenue._sum.totalBilled || 0);
    const profit = revenueAmt - expenseAmt;
    const convRate = leads > 0 ? ((leadsConverted / leads) * 100).toFixed(1) : '0';

    // Expense breakdown
    const expBreakdown = await prisma.expense.groupBy({
      by: ['category'],
      where: { tenantId, date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5
    });

    const expList = expBreakdown.map(e =>
      `  ${e.category}: ${formatCurrency(Number(e._sum.amount || 0))}`
    ).join('\n') || '  No expenses';

    return {
      success: true,
      message: `📊 **Monthly Report — ${monthName}**

💰 **P&L Summary:**
  📥 Revenue: ${formatCurrency(revenueAmt)}
  📤 Expenses: ${formatCurrency(expenseAmt)}
  📈 Net Profit: ${formatCurrency(profit)} ${profit >= 0 ? '✅' : '❌'}
  🔧 Service Revenue: ${formatCurrency(serviceAmt)}

🏍️ **Sales Performance:**
  Vehicles Sold: ${vehiclesSold}
  Total Bookings: ${bookings}

👥 **Lead Funnel:**
  Total Leads: ${leads}
  Converted: ${leadsConverted}
  Conversion Rate: ${convRate}%

💸 **Top Expenses:**
${expList}

📈 **Business Total: ${formatCurrency(revenueAmt + serviceAmt)}**`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 51: generate_lead_report
// ═══════════════════════════════════════
const generateLeadReport: ToolDefinition = {
  name: 'generate_lead_report',
  description: 'Generate lead conversion analytics report — funnel, sources, performance.',
  category: ToolCategory.SYSTEM,
  permissionLevel: PermissionLevel.AUTO,
  parameters: {
    period: { type: 'string', description: 'Period', enum: ['this_month', 'last_month', 'this_week'] }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const now = new Date();
    let startDate: Date;
    if (params.period === 'last_month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    } else if (params.period === 'this_week') {
      startDate = new Date(now); startDate.setDate(now.getDate() - now.getDay()); startDate.setHours(0, 0, 0, 0);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Funnel
    const [total, contacted, followup, converted, lost] = await Promise.all([
      prisma.lead.count({ where: { tenantId, createdAt: { gte: startDate } } }),
      prisma.lead.count({ where: { tenantId, status: 'CONTACTED', createdAt: { gte: startDate } } }),
      prisma.lead.count({ where: { tenantId, status: 'FOLLOWUP', createdAt: { gte: startDate } } }),
      prisma.lead.count({ where: { tenantId, status: 'CONVERTED', createdAt: { gte: startDate } } }),
      prisma.lead.count({ where: { tenantId, status: 'LOST', createdAt: { gte: startDate } } })
    ]);

    // By source
    const sources = await prisma.lead.groupBy({
      by: ['source'],
      where: { tenantId, createdAt: { gte: startDate } },
      _count: true,
      orderBy: { _count: { source: 'desc' } }
    });

    // By health
    const [hot, warm, cold] = await Promise.all([
      prisma.lead.count({ where: { tenantId, dealHealth: 'HOT', createdAt: { gte: startDate } } }),
      prisma.lead.count({ where: { tenantId, dealHealth: 'WARM', createdAt: { gte: startDate } } }),
      prisma.lead.count({ where: { tenantId, dealHealth: 'COLD', createdAt: { gte: startDate } } })
    ]);

    const convRate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0';
    const lossRate = total > 0 ? ((lost / total) * 100).toFixed(1) : '0';

    const sourceList = sources.map(s => `  ${s.source || 'Unknown'}: ${s._count}`).join('\n') || '  No data';

    return {
      success: true,
      message: `👥 **Lead Report — ${params.period || 'this_month'}**

📊 **Funnel:**
  Total Leads: ${total}
  → Contacted: ${contacted}
  → Follow-up: ${followup}
  → Converted: ${converted} ✅
  → Lost: ${lost} ❌

📈 **Rates:**
  Conversion: ${convRate}%
  Loss: ${lossRate}%

🔥 **By Health:**
  Hot: ${hot} | Warm: ${warm} | Cold: ${cold}

📣 **By Source:**
${sourceList}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 52: generate_expense_report
// ═══════════════════════════════════════
const generateExpenseReportTool: ToolDefinition = {
  name: 'generate_expense_report_detailed',
  description: 'Generate detailed expense analytics with category breakdown, budget comparison, and trends.',
  category: ToolCategory.SYSTEM,
  permissionLevel: PermissionLevel.AUTO,
  parameters: {
    period: { type: 'string', description: 'Period', enum: ['this_month', 'last_month'] }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const now = new Date();
    const month = params.period === 'last_month' ? now.getMonth() - 1 : now.getMonth();
    const startDate = new Date(now.getFullYear(), month, 1);
    const endDate = new Date(now.getFullYear(), month + 1, 0, 23, 59, 59);

    const expenses = await prisma.expense.findMany({
      where: { tenantId, date: { gte: startDate, lte: endDate } }
    });

    const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

    // Category breakdown
    const categories: Record<string, number> = {};
    expenses.forEach(e => { categories[e.category] = (categories[e.category] || 0) + Number(e.amount); });
    const sorted = Object.entries(categories).sort(([, a], [, b]) => b - a);

    const breakdown = sorted.map(([cat, amt]) => {
      const pct = total > 0 ? ((amt / total) * 100).toFixed(1) : '0';
      return `  ${cat}: ${formatCurrency(amt)} (${pct}%)`;
    }).join('\n') || '  No expenses';

    // Budget comparison
    const budgets = await prisma.expenseBudget.findMany({ where: { tenantId } });
    let budgetReport = '';
    if (budgets.length > 0) {
      const budgetLines = budgets.map(b => {
        const spent = categories[b.category] || 0;
        const limit = Number(b.monthlyLimit);
        const pct = limit > 0 ? ((spent / limit) * 100).toFixed(0) : '0';
        const status = spent > limit ? '❌ OVER' : spent > limit * 0.8 ? '⚠️ HIGH' : '✅ OK';
        return `  ${b.category}: ${formatCurrency(spent)} / ${formatCurrency(limit)} (${pct}%) ${status}`;
      }).join('\n');
      budgetReport = `\n\n📋 **Budget vs Actual:**\n${budgetLines}`;
    }

    return {
      success: true,
      message: `💸 **Expense Report — ${startDate.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}**

💰 Total Expenses: ${formatCurrency(total)} (${expenses.length} entries)

📊 **Category Breakdown:**
${breakdown}${budgetReport}`
    };
  }
};

// ═══════════════════════════════════════
// REGISTER ALL DEVOPS + REPORT TOOLS
// ═══════════════════════════════════════
export function registerAllDevopsTools(): void {
  const tools = [
    getErrorLogs,             // 43
    getDeploymentStatus,      // 44
    createGithubIssue,        // 45
    getGithubIssues,          // 46
    triggerDeploy,            // 47
    getSystemHealth,          // 48
    generateDailyReportTool,  // 49
    generateMonthlyReportTool,// 50
    generateLeadReport,       // 51
    generateExpenseReportTool // 52
  ];

  tools.forEach(tool => registerTool(tool));
  console.log(`✅ Registered ${tools.length} devops + report tools`);
}
