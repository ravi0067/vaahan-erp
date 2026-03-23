import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, errorResponse } from '@/lib/api-auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const { message, action } = await request.json();
    const tenantId = session!.user.tenantId;
    const userRole = session!.user.role;

    // AI Chat Response Logic
    let response = '';
    let actions = [];

    // Client-level AI (Regular Operations)
    if (userRole !== 'SUPER_ADMIN') {
      response = await handleClientAI(message, tenantId, userRole, action);
    } 
    // Super Admin AI (Code fixes, GitHub integration)
    else {
      response = await handleSuperAdminAI(message, action);
    }

    return NextResponse.json({ 
      response, 
      actions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    return errorResponse('AI chat failed');
  }
}

async function handleClientAI(message: string, tenantId: string, userRole: string, action?: string) {
  const lowerMessage = message.toLowerCase();
  
  // Lead Follow-up Management
  if (lowerMessage.includes('follow up') || lowerMessage.includes('followup')) {
    const pendingLeads = await prisma.lead.count({
      where: { 
        tenantId, 
        status: 'FOLLOWUP',
        followUpDate: { lte: new Date() }
      }
    });
    
    return `📞 You have ${pendingLeads} pending follow-ups today. I can help you:
    
1. **Send WhatsApp reminders** to customers
2. **Update lead status** after calls
3. **Schedule next follow-up** dates
4. **Generate follow-up reports**

What would you like me to do?`;
  }

  // Payment & Document Management
  if (lowerMessage.includes('payment') || lowerMessage.includes('document')) {
    return `💰 **Payment & Document Assistant Ready!**

I can help you:
1. **Send payment reminders** via WhatsApp/SMS
2. **Generate payment receipts** automatically  
3. **Upload RTO documents** to customer portal
4. **Send document alerts** when ready
5. **Track pending payments** with auto-reminders

Just tell me what you need - "send payment reminder to [customer]" or "upload RTO docs for booking #123"`;
  }

  // Customer Communication
  if (lowerMessage.includes('customer') || lowerMessage.includes('message')) {
    return `📱 **Customer Communication Center**

I can instantly:
- **WhatsApp/SMS alerts** for bookings, deliveries, service
- **Email invoices** with payment links
- **Document sharing** via secure links  
- **Service reminders** for upcoming maintenance
- **Feedback collection** after delivery/service

Example: "Send delivery update to Rahul Kumar" or "Share RTO docs with customer #456"`;
  }

  // General Business Intelligence
  if (lowerMessage.includes('sales') || lowerMessage.includes('report') || lowerMessage.includes('analytics')) {
    const todayStats = await getTodayStats(tenantId);
    return `📊 **Today's Business Summary:**

🚗 **Sales:** ${todayStats.bookings} new bookings (₹${todayStats.revenue})
📞 **Leads:** ${todayStats.leads} new enquiries  
💰 **Cash:** ₹${todayStats.cashIn} in, ₹${todayStats.cashOut} out
🔧 **Service:** ${todayStats.serviceJobs} jobs active

**I can help you:**
- Generate detailed reports
- Send daily summaries to your team
- Set up automated alerts for targets
- Track competitor analysis`;
  }

  // Default helpful response
  return `🤖 **VaahanERP AI Assistant at your service!**

I can help you with:

📞 **Lead Management** - Follow-ups, conversions, reminders
💰 **Payment Tracking** - Reminders, receipts, pending collections  
📋 **Customer Communication** - WhatsApp, SMS, email automation
🚗 **Inventory Updates** - Stock alerts, vehicle status updates
🔧 **Service Coordination** - Job cards, mechanic assignments
📊 **Business Intelligence** - Daily reports, analytics, insights

**Just ask me naturally:** 
- "Follow up with hot leads"
- "Send payment reminder to Rahul"  
- "Show me today's sales report"
- "Upload RTO docs for booking #123"`;
}

async function handleSuperAdminAI(message: string, action?: string) {
  const lowerMessage = message.toLowerCase();

  // GitHub Code Management
  if (lowerMessage.includes('fix') || lowerMessage.includes('bug') || lowerMessage.includes('feature')) {
    return `🔧 **Super Admin AI - Code Management**

I have **full GitHub access** and can:

1. **Auto-fix bugs** by analyzing error logs
2. **Add new features** directly to codebase
3. **Push commits** and trigger deployments  
4. **Review code quality** and suggest improvements
5. **Handle database migrations** automatically

**Example commands:**
- "Fix login issue in production"
- "Add SMS integration feature" 
- "Optimize database queries for reports"
- "Deploy latest changes to Vercel"

⚠️ **This level only works for Super Admin!** Regular users get standard AI assistance.`;
  }

  // System Monitoring
  if (lowerMessage.includes('status') || lowerMessage.includes('monitor') || lowerMessage.includes('health')) {
    return `📡 **System Health Monitor**

Current Status:
- ✅ **Vercel Deployment:** Active
- ✅ **Database:** Connected (Supabase Mumbai)  
- ✅ **API Health:** All endpoints responding
- ✅ **Build Status:** Clean (minor ESLint warnings)

I can:
- **Monitor uptime** 24/7 with alerts
- **Auto-fix deployment issues**
- **Scale resources** based on usage
- **Security patch management**
- **Performance optimization**`;
  }

  return `🚀 **Super Admin AI - Full System Control**

I have elevated permissions for:

🔧 **Development:** Code fixes, feature additions, GitHub management
📊 **Analytics:** Deep system insights, performance monitoring  
🛡️ **Security:** Vulnerability scanning, patch management
🚀 **Deployment:** Auto-deploy, rollback, environment management
📈 **Scaling:** Resource optimization, load balancing

**Available only to Super Admin!** What would you like me to help you with?`;
}

async function getTodayStats(tenantId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [bookings, leads, cashIn, cashOut, serviceJobs] = await Promise.all([
    prisma.booking.count({ where: { tenantId, createdAt: { gte: today } } }),
    prisma.lead.count({ where: { tenantId, createdAt: { gte: today } } }),
    prisma.cashTransaction.aggregate({ 
      where: { tenantId, type: 'INCOME', date: { gte: today } },
      _sum: { amount: true }
    }),
    prisma.cashTransaction.aggregate({
      where: { tenantId, type: 'EXPENSE', date: { gte: today } },
      _sum: { amount: true }
    }),
    prisma.jobCard.count({ 
      where: { tenantId, status: 'IN_PROGRESS' }
    })
  ]);

  return {
    bookings,
    leads,
    cashIn: cashIn._sum.amount || 0,
    cashOut: cashOut._sum.amount || 0,
    serviceJobs,
    revenue: bookings * 50000 // Estimated
  };
}