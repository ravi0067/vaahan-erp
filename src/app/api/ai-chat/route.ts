import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, errorResponse } from '@/lib/api-auth';
import prisma from '@/lib/prisma';
import { getSystemPrompt } from '@/lib/ai-system-prompt';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const body = await request.json();
    const { messages, apiKey, callingConfig } = body;
    const tenantId = session!.user.tenantId;
    const userRole = session!.user.role;

    // AI Chat Response Logic
    let response = '';
    let actions: any[] = [];
    
    // Get the latest message for fallback logic
    const latestMessage = Array.isArray(messages) && messages.length > 0 
      ? messages[messages.length - 1].parts[0].text 
      : body.message || '';

    if (apiKey) {
      // Use Live Gemini API
      let contextData = "";
      if (userRole !== 'SUPER_ADMIN') {
        try {
          const stats = await getTodayStats(tenantId);
          contextData = `\nCurrent Dealership Stats (Today): Bookings: ${stats.bookings}, Leads: ${stats.leads}, Cash In: ₹${stats.cashIn}, Cash Out: ₹${stats.cashOut}, Service Jobs: ${stats.serviceJobs}, Est Revenue: ₹${stats.revenue}.`;
        } catch (e) {
          console.error("Failed to fetch stats for context:", e);
        }
      }

      const systemPrompt = getSystemPrompt(userRole, 'VaahanERP', 'BIKE');
      
      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt + contextData }] },
          contents: messages || [{ role: 'user', parts: [{ text: latestMessage }] }]
        })
      });
      
      const data = await geminiRes.json();
      if (data.error) {
        response = "Gemini API Error: " + data.error.message;
      } else if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        response = data.candidates[0].content.parts[0].text;
        
        // INTERCEPT CALL INTENT AND TRIGGER EXOTEL with AI Voice Flow
        if (response.includes("📞 Initiated AI Voice Call") || response.includes("Voice Agent has been dispatched")) {
          const EXOTEL_API_KEY = process.env.EXOTEL_API_KEY || '';
          const EXOTEL_API_TOKEN = process.env.EXOTEL_API_TOKEN || '';
          const EXOTEL_ACCOUNT_SID = process.env.EXOTEL_ACCOUNT_SID || '';
          const EXOTEL_CALLER_ID = process.env.EXOTEL_CALLER_ID || '';
          const APP_URL = process.env.NEXTAUTH_URL || 'https://vaahan-erp.vercel.app';

          if (EXOTEL_API_KEY && EXOTEL_ACCOUNT_SID && EXOTEL_CALLER_ID) {
            const phoneMatch = latestMessage.match(/\b\d{10}\b/);
            const targetPhone = phoneMatch ? phoneMatch[0] : null;
            
            if (targetPhone) {
              try {
                // Detect call purpose from message
                const lm = latestMessage.toLowerCase();
                let purpose = 'offer';
                if (lm.includes('insurance')) purpose = 'insurance_expiry';
                else if (lm.includes('service')) purpose = 'service_due';
                else if (lm.includes('delivery')) purpose = 'delivery';
                else if (lm.includes('payment')) purpose = 'payment_reminder';
                else if (lm.includes('follow')) purpose = 'followup';
                else if (lm.includes('birthday')) purpose = 'birthday';
                else if (lm.includes('offer') || lm.includes('promotion')) purpose = 'promotion';

                // Build flow URL for AI voice script
                const flowParams = new URLSearchParams();
                flowParams.set('company', 'VaahanERP');
                flowParams.set('purpose', purpose);
                flowParams.set('name', 'Sir');
                flowParams.set('lang', 'hi-IN');
                const flowUrl = `${APP_URL}/api/calls/flow?${flowParams.toString()}`;

                const exotelUrl = `https://api.exotel.com/v1/Accounts/${EXOTEL_ACCOUNT_SID}/Calls/connect.json`;
                const basicAuth = Buffer.from(`${EXOTEL_API_KEY}:${EXOTEL_API_TOKEN}`).toString('base64');
                
                const formData = new URLSearchParams();
                formData.append('From', targetPhone);
                formData.append('To', EXOTEL_CALLER_ID);
                formData.append('CallerId', EXOTEL_CALLER_ID);
                formData.append('Url', flowUrl);
                
                fetch(exotelUrl, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Basic ${basicAuth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                  },
                  body: formData.toString()
                }).catch(e => console.error("Exotel Call Error:", e));
                
                response += `\n\n✅ *AI Voice Agent calling ${targetPhone} now! Purpose: ${purpose}*`;
              } catch (e) {
                response += `\n\n⚠️ *Failed to trigger call. Please check Exotel configuration.*`;
              }
            } else {
              response += `\n\n📱 *Please provide a 10-digit mobile number to make the call!*`;
            }
          } else {
            response += `\n\n⚠️ *Exotel not configured. Ask admin to set EXOTEL env variables.*`;
          }
        }
        
      } else {
        response = "Sorry, I couldn't generate a response from Gemini.";
      }
    } else {
      // Fallback to Mock Data
      if (userRole !== 'SUPER_ADMIN') {
        response = await handleClientAI(latestMessage, tenantId, userRole, body.action);
      } else {
        response = await handleSuperAdminAI(latestMessage, body.action);
      }
    }

    return NextResponse.json({ 
      response, 
      actions,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: error.message || 'AI chat failed' }, { status: 500 });
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
      where: { tenantId, type: 'INFLOW', createdAt: { gte: today } },
      _sum: { amount: true }
    }),
    prisma.cashTransaction.aggregate({
      where: { tenantId, type: 'OUTFLOW', createdAt: { gte: today } },
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