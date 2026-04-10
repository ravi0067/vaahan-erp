/**
 * One-time blog setup: seeds all posts via Supabase REST (no Prisma/DATABASE_URL needed).
 * Usage: GET /api/blog/setup?key=VaahanBlog2026
 */

import { NextRequest, NextResponse } from "next/server";

const SETUP_KEY = "VaahanBlog2026";

const BLOG_POSTS = [
  {
    title: "Vehicle Dealership Mein ERP Kyun Zaruri Hai?",
    slug: "vehicle-dealership-mein-erp-kyun-zaruri-hai",
    excerpt: "Vehicle dealership chalana sirf vehicles bechne se zyada hai. VaahanERP se apna pura showroom automate karo — leads se delivery tak.",
    content: `<h2>Dealership Mein Problems Kya Hain?</h2><p>Aaj ke competitive market mein vehicle dealership chalana sirf vehicles bechne se kaafi zyada complicated ho gaya hai. Leads manage karna, test drives schedule karna, finance process, RTO documentation, service reminders — yeh sab manually manage karna almost impossible hai.</p><h2>ERP Kya Karta Hai?</h2><ul><li><strong>Lead Management:</strong> Incoming leads automatically capture aur assign hoti hain</li><li><strong>Inventory Tracking:</strong> Real-time vehicle stock visibility</li><li><strong>Finance &amp; Loans:</strong> Bank tie-ups aur EMI calculations automated</li><li><strong>Service Department:</strong> Job cards, reminders, revenue tracking</li></ul><h2>Conclusion</h2><p>Agar aap apni dealership ko next level pe le jaana chahte hain, toh ERP sirf ek option nahi — yeh ek necessity ban gayi hai.</p>`,
    coverImage: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=450&fit=crop&q=80",
    published: true, featured: true, category: "Business Tips",
    tags: "ERP, dealership management, vehicle showroom, lead CRM, automation", views: 2,
  },
  {
    title: "Bike Showroom Mein Lead Management: 5 Proven Tips",
    slug: "bike-showroom-lead-management-tips",
    excerpt: "Har din showroom mein 20-30 leads aati hain. 5 proven tips se apna conversion rate 25% se 40% tak badha sakte ho.",
    content: `<h2>Lead Management Kyun Important Hai?</h2><p>Ek typical bike showroom mein roz 20-30 inquiries aati hain. Inhe manually track karna impossible hai.</p><h2>5 Proven Tips</h2><ol><li><strong>Har Lead Ko Immediately Register Karo</strong></li><li><strong>Same Day Follow-Up Rule</strong></li><li><strong>WhatsApp Integration Use Karo</strong></li><li><strong>Lost Leads Ko Re-Engage Karo</strong></li><li><strong>Data Se Seekho</strong></li></ol><p>In tips se average 15% conversion improvement milti hai.</p>`,
    coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=450&fit=crop&q=80",
    published: true, featured: false, category: "Sales",
    tags: "lead management, bike showroom, conversion, CRM, follow-up", views: 1,
  },
  {
    title: "Vehicle Dealership Ka Cashflow Kaise Manage Karein",
    slug: "vehicle-dealership-cashflow-management",
    excerpt: "Profitable dealership bhi cash crunch mein aa sakti hai. Digital daybook se apna cashflow 100% accurate banao.",
    content: `<h2>Cashflow Problem Kyun Hoti Hai?</h2><p>Bahut se dealership owners sochte hain ki agar business profitable hai toh cash problem nahi hogi. Lekin reality alag hai.</p><h2>Digital Daybook Ke Fayde</h2><ul><li>Real-time cashflow visibility</li><li>Bank auto-reconciliation</li><li>GST tracking automated</li><li>30-day forecast projections</li></ul>`,
    coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop&q=80",
    published: true, featured: true, category: "Finance",
    tags: "cashflow, daybook, dealership accounting, payments, finance", views: 0,
  },
  {
    title: "Service Workshop Management: Job Cards Se Revenue Kaise Badhayein",
    slug: "service-workshop-job-cards-revenue",
    excerpt: "Service department sirf repair ka kaam nahi, yeh consistent revenue source hai. Digital job cards se revenue 30% badhaiye.",
    content: `<h2>Service Department Ki Importance</h2><p>Vehicle dealership mein service department year-round consistent revenue generate karta hai — total revenue ka 30-40%.</p><h2>Digital Job Cards Ke Fayde</h2><ul><li>Customer real-time updates milte hain</li><li>Mechanic accountability track hoti hai</li><li>Parts auto-order triggered hoti hai</li><li>Billing accuracy 100%</li></ul>`,
    coverImage: "https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800&h=450&fit=crop&q=80",
    published: true, featured: false, category: "Service",
    tags: "service workshop, job cards, mechanic, revenue, vehicle service", views: 0,
  },
  {
    title: "WhatsApp CRM: Dealership Leads Ko Convert Karne Ka Sabse Fast Tarika",
    slug: "whatsapp-crm-dealership-leads-convert",
    excerpt: "India mein 90% buyers WhatsApp use karte hain. WhatsApp CRM se response time 2 ghante se 10 minute karo aur conversion 35% badhao.",
    content: `<h2>WhatsApp India Ka #1 Communication Tool</h2><p>India mein 500 million se zyada WhatsApp users hain. 5 minute ke andar reply karo toh 9x higher conversion chance hoti hai. VaahanERP ka built-in WhatsApp integration yeh sab ek dashboard se manage karta hai.</p>`,
    coverImage: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=450&fit=crop&q=80",
    published: true, featured: false, category: "Technology",
    tags: "WhatsApp CRM, lead conversion, automation, dealership, communication", views: 0,
  },
  {
    title: "RTO Documentation: Vehicle Delivery Process Streamline Kaise Karein",
    slug: "rto-documentation-vehicle-delivery-process",
    excerpt: "RTO documentation aur delivery delays se customer frustration hota hai. Digital document management se delivery process 50% fast karein.",
    content: `<h2>RTO Documentation Ka Problem</h2><p>Vehicle delivery mein sabse zyada delay RTO documentation mein hoti hai. Digital system se delivery time 7 days se 3 days, customer satisfaction 85% se 95%.</p>`,
    coverImage: "https://images.unsplash.com/photo-1568599104766-6f7c7775bef8?w=800&h=450&fit=crop&q=80",
    published: true, featured: false, category: "Business Tips",
    tags: "RTO, documentation, delivery, vehicle registration, paperwork", views: 0,
  },
];

async function sbFetch(path: string, opts: RequestInit = {}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase env vars missing");

  const res = await fetch(`${url}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation,resolution=merge-duplicates",
      ...(opts.headers as any),
    },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${text}`);
  return text ? JSON.parse(text) : [];
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== SETUP_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  try {
    // Upsert all posts via Supabase REST (no Prisma needed)
    const upserted = await sbFetch("BlogPost", {
      method: "POST",
      body: JSON.stringify(BLOG_POSTS),
    });

    results.push(`✅ Upserted ${Array.isArray(upserted) ? upserted.length : "?"} blog posts`);

    // Count total published posts
    const all = await sbFetch("BlogPost?published=eq.true&select=id");
    const total = Array.isArray(all) ? all.length : 0;
    results.push(`📊 Total published posts: ${total}`);

    return NextResponse.json({
      success: true,
      message: "Blog setup complete!",
      steps: results,
      totalPosts: total,
    });
  } catch (error: any) {
    console.error("Blog setup error:", error?.message);
    return NextResponse.json(
      { success: false, error: error?.message, steps: results },
      { status: 500 }
    );
  }
}
