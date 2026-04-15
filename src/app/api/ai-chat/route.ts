import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, errorResponse } from '@/lib/api-auth';
import prisma from '@/lib/prisma';
import { getSystemPrompt } from '@/lib/ai-system-prompt';

export const dynamic = 'force-dynamic';

// ── Blog-related query detection ──────────────────────────
function isBlogQuery(text: string): boolean {
  const triggers = [
    'blog', 'post', 'article', 'likho', 'likh', 'write', 'publish',
    'draft', 'content', 'seo', 'generate blog', 'blog banao',
    'blog dikhao', 'blog list', 'blog padho', 'read blog',
    'latest blog', 'blog kitne', 'blog page',
  ];
  const lower = text.toLowerCase();
  return triggers.some(t => lower.includes(t));
}

// ── Fetch blog data for AI context ────────────────────────
async function getBlogContext(tenantId: string): Promise<string> {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true, title: true, slug: true, published: true,
        featured: true, category: true, views: true,
        createdAt: true, publishedAt: true,
      }
    });

    if (!posts.length) return '\n[Blog Data] Abhi koi blog post nahi hai. User ko suggest karo ki naya blog create kare /admin/blog/new se.';

    const published = posts.filter(p => p.published);
    const drafts = posts.filter(p => !p.published);

    let ctx = `\n[Blog Data] Total: ${posts.length} posts (${published.length} published, ${drafts.length} drafts)\n`;
    ctx += 'Recent posts:\n';
    posts.forEach((p, i) => {
      ctx += `${i + 1}. "${p.title}" [${p.published ? '✅ Published' : '📝 Draft'}] | Category: ${p.category || 'None'} | Views: ${p.views || 0} | Slug: ${p.slug}\n`;
    });

    return ctx;
  } catch (e) {
    console.error('Blog context error:', e);
    return '\n[Blog Data] Blog module available. User can manage at /admin/blog';
  }
}

// ── Generate blog content via AI ──────────────────────────
async function generateBlogContent(keyword: string, apiKey: string, language: string = 'hinglish'): Promise<any> {
  try {
    const prompt = `You are a content writer for VaahanERP — a dealership management software used by bike and car showrooms across India.

Write a ${language === 'hinglish' ? 'Hinglish (mix of Hindi + English)' : 'English'} blog post about: "${keyword}"

Requirements:
- Length: 900–1200 words
- SEO optimized with proper headings
- Practical tips for vehicle dealership owners
- Include subheadings (H2, H3)
- Include a CTA at the end for VaahanERP dealership software
- Engaging and informative tone

Return JSON with these exact keys:
{
  "title": "SEO-friendly blog title",
  "metaTitle": "60-char SEO meta title",
  "metaDesc": "155-char meta description",
  "excerpt": "2-sentence blog summary",
  "category": "one of: Business Tips, Technology, Sales, Service, Finance, Industry News",
  "tags": "comma-separated tags (5-7 tags)",
  "content": "full HTML blog content with <h2>, <h3>, <p>, <ul>, <li> tags"
}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (e) {
    console.error('Blog generation error:', e);
    return null;
  }
}

// ── Create blog post in database ──────────────────────────
async function createBlogPost(blogData: any, authorId: string | null, publish: boolean = false): Promise<any> {
  try {
    let slug = blogData.title.toLowerCase()
      .replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 100);

    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const post = await prisma.blogPost.create({
      data: {
        title: blogData.title,
        slug,
        content: blogData.content,
        excerpt: blogData.excerpt || null,
        published: publish,
        featured: false,
        metaTitle: blogData.metaTitle || blogData.title,
        metaDesc: blogData.metaDesc || blogData.excerpt || null,
        category: blogData.category || null,
        tags: blogData.tags || null,
        authorId: authorId || null,
        publishedAt: publish ? new Date() : null,
      },
    });

    return post;
  } catch (e) {
    console.error('Blog create error:', e);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const body = await request.json();
    const { messages, apiKey, callingConfig } = body;
    const tenantId = session!.user.tenantId;
    const userRole = session!.user.role;
    const userId = (session!.user as any)?.id || null;

    // AI Chat Response Logic
    let response = '';
    let actions: any[] = [];
    
    // Get the latest message for fallback logic
    const latestMessage = Array.isArray(messages) && messages.length > 0 
      ? messages[messages.length - 1].parts[0].text 
      : body.message || '';

    // ── Check for blog write/generate intent ──
    const lowerMsg = latestMessage.toLowerCase();
    const wantsBlogGenerate = isBlogQuery(latestMessage) && 
      (lowerMsg.includes('likho') || lowerMsg.includes('likh') || lowerMsg.includes('write') || 
       lowerMsg.includes('generate') || lowerMsg.includes('banao') || lowerMsg.includes('create'));

    if (wantsBlogGenerate && apiKey) {
      // Extract the topic from the message
      const topicMatch = latestMessage.match(/(?:about|on|ke\s+baare|par|pe|topic|keyword)\s*[:\-]?\s*(.+)/i) 
        || latestMessage.match(/(?:blog|post|article)\s+(?:likho|likh|write|generate|banao)\s+(.+)/i)
        || latestMessage.match(/(?:likho|likh|write|generate|banao)\s+(?:ek\s+)?(?:blog|post|article)\s+(.+)/i);
      
      const topic = topicMatch ? topicMatch[1].trim() : latestMessage.replace(/blog|post|article|likho|likh|write|generate|banao|create|karo/gi, '').trim();

      if (topic.length > 3) {
        const language = /[\u0900-\u097F]/.test(latestMessage) ? 'hindi' : 'hinglish';
        const blogData = await generateBlogContent(topic, apiKey, language);

        if (blogData) {
          const post = await createBlogPost(blogData, userId, false);
          if (post) {
            response = `📝 Blog draft ready ho gaya!\n\nTitle: "${blogData.title}"\nCategory: ${blogData.category}\nTags: ${blogData.tags}\n\nDraft save ho gaya hai → /admin/blog/${post.id}/edit pe jaake review aur publish kar sakte ho.\n\nPublish karna hai abhi? Bol do "publish karo" 🚀`;
            actions = [{ type: 'blog_created', postId: post.id, slug: post.slug }];
          } else {
            response = `Blog generate ho gaya but save karne mein issue aaya. /admin/blog/new pe jaake manually paste kar sakte ho:\n\nTitle: ${blogData.title}\nCategory: ${blogData.category}`;
          }
        } else {
          response = `Blog generate nahi ho paya. API issue lag raha hai. /admin/blog/new se manually try karo ya thodi der mein phir se bolo.`;
        }

        return NextResponse.json({ response, actions, timestamp: new Date().toISOString() });
      }
    }

    if (apiKey) {
      // Use Live Gemini API — with enriched context
      let contextData = "";

      // Always get stats for non-super-admin
      if (userRole !== 'SUPER_ADMIN') {
        try {
          const stats = await getTodayStats(tenantId);
          contextData = `\nCurrent Dealership Stats (Today): Bookings: ${stats.bookings}, Leads: ${stats.leads}, Cash In: ₹${stats.cashIn}, Cash Out: ₹${stats.cashOut}, Service Jobs: ${stats.serviceJobs}, Est Revenue: ₹${stats.revenue}.`;
        } catch (e) {
          console.error("Failed to fetch stats for context:", e);
        }
      }

      // Add blog context if blog-related query
      if (isBlogQuery(latestMessage)) {
        contextData += await getBlogContext(tenantId);
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

  // Blog Management
  if (isBlogQuery(message)) {
    try {
      const posts = await prisma.blogPost.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, slug: true, published: true, category: true, views: true, createdAt: true }
      });

      if (posts.length === 0) {
        return `📝 **Blog Module**\n\nAbhi koi blog post nahi hai.\n\n**Naya blog create karne ke liye:**\n→ /admin/blog/new pe jaao\n→ Ya mujhe bolo "blog likho [topic]" — main AI se generate kar doongi!\n\nExample: "blog likho dealership management tips ke baare mein"`;
      }

      const published = posts.filter(p => p.published);
      const drafts = posts.filter(p => !p.published);
      let resp = `📝 **Blog Posts** (${posts.length} total — ${published.length} published, ${drafts.length} drafts)\n\n`;
      posts.forEach((p, i) => {
        resp += `${i + 1}. ${p.published ? '✅' : '📝'} **${p.title}** | ${p.category || 'No category'} | ${p.views || 0} views\n`;
      });
      resp += `\n**Actions:**\n→ /admin/blog — manage all posts\n→ "Blog likho [topic]" — AI se naya blog generate karo\n→ /admin/blog/new — manually naya blog likho`;
      return resp;
    } catch {
      return `📝 Blog module available hai → /admin/blog\nAI blog generate karne ke liye bolo: "blog likho [topic]"`;
    }
  }
  
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
  return `🤖 **VaahanERP AI Assistant — Vaani at your service!**

Main yeh sab kar sakti hoon:

📞 **Lead Management** — Follow-ups, conversions, reminders
💰 **Payment Tracking** — Reminders, receipts, pending collections
📋 **Customer Communication** — WhatsApp, SMS, email automation
🚗 **Inventory/Stock** — Stock alerts, vehicle status
🔧 **Service** — Job cards, mechanic assignments
📊 **Reports & Analytics** — Daily reports, insights
📝 **Blog Management** — AI blog generation, publish, manage
📄 **Documents & RTO** — Upload, track, share
💵 **Cashflow & Expenses** — Track income/expenses
📢 **Marketing & Promotions** — Create offers, campaigns

**Natural language mein bolo:**
- "Aaj ki sales dikhao"
- "Blog likho dealership tips ke baare mein"
- "Hot leads list karo"
- "Blog page kahan hai?"
- "Payment reminder bhejo Rahul ko"
- "Stock mein kitni bikes hain?"
- "Naya customer add karo"`;
}

async function handleSuperAdminAI(message: string, action?: string) {
  const lowerMessage = message.toLowerCase();

  // Blog Management (Super Admin)
  if (isBlogQuery(message)) {
    try {
      const posts = await prisma.blogPost.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, title: true, slug: true, published: true, featured: true, category: true, views: true, createdAt: true }
      });

      const total = await prisma.blogPost.count();
      const published = posts.filter(p => p.published).length;
      
      let resp = `📝 **Blog Management (Super Admin)**\n\nTotal: ${total} posts (${published} published)\n\n`;
      
      if (posts.length > 0) {
        resp += `**Recent Posts:**\n`;
        posts.forEach((p, i) => {
          resp += `${i + 1}. ${p.published ? '✅' : '📝'} ${p.featured ? '⭐' : ''} "${p.title}" | ${p.category || '-'} | ${p.views} views\n`;
        });
      }
      
      resp += `\n**Blog Actions:**\n`;
      resp += `→ "Blog likho [topic]" — AI-generated SEO blog\n`;
      resp += `→ /admin/blog — Full blog management\n`;
      resp += `→ /admin/blog/new — Create manually\n`;
      resp += `→ /blog — Public blog page\n`;
      
      return resp;
    } catch {
      return `📝 Blog Module → /admin/blog\nAI Blog: "blog likho [topic]"\nPublic page: /blog`;
    }
  }

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