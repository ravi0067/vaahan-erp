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
    excerpt: "RTO documentation aur delivery delays se customer frustration hota hai. VaahanERP ke Digital Document Vault se delivery process 50% fast karein aur customers ka bharosa jeetein.",
    content: `<h2>RTO Documentation Aur Vehicle Delivery — Sabse Bada Sardaard</h2>
<p>Automobile dealership chalana koi aasan kaam nahi hai. Gaadi bechna fir bhi ek baar ko asaan lagta hai, lekin sabse bada sardaard shuru hota hai uske baad — <strong>RTO Documentation aur Vehicle Delivery ka process</strong>.</p>
<p>Customers ke baar-baar aane wale calls (<em>"Bhaiya meri gaadi ka number kab aayega?"</em>, <em>"RC kab milegi?"</em>), files ka ghum ho jana, aur paper-based workflows dealership ki efficiency ko completely down kar dete hain.</p>
<p>Agar aap bhi in problems se pareshan hain, toh waqt aa gaya hai apne showroom ko <strong>VaahanERP 2.0</strong> ke sath digital aur automated banane ka.</p>

<img src="/images/vaahan-dashboard.png" alt="VaahanERP Dashboard - Complete Dealership Management" style="width:100%;border-radius:12px;margin:24px 0;box-shadow:0 4px 24px rgba(0,0,0,0.12);" />

<h2>1. Digital Document Vault (Paperless Work)</h2>
<p>Files aur folders mein documents maintain karna purana aur risky tareeqa hai. <strong>VaahanERP ke Document Manager module</strong> mein aap ek hi jagah par lagbhag <strong>15 tarah ke documents</strong> securely upload aur manage kar sakte hain:</p>
<ul>
  <li><strong>Customer ID Proofs:</strong> Aadhar Card, PAN Card, Driving License, aur Photos</li>
  <li><strong>RTO Forms:</strong> Form 20 (Sale Letter), Form 21 (Delivery Note), Form 22 (Road Worthiness)</li>
  <li><strong>Other Documents:</strong> Tax Invoice, Helmet Receipt, Insurance Copy, aur Bank Finance ke papers</li>
</ul>
<p>✅ <strong>Fayda:</strong> Sab kuch cloud par secure rehta hai, jisse file ghumne ka darr hamesha ke liye khatam ho jata hai.</p>

<h2>2. Real-Time RTO &amp; Registration Tracking</h2>
<p>RTO process ko track karna ab ungliyon par hai. VaahanERP ke RTO module mein aap har gaadi ka <strong>Registration Number, RTO Date, aur Insurance Expiry</strong> ek hi popup mein save kar sakte hain.</p>
<p>Aap RTO application ka status step-by-step update kar sakte hain:</p>
<p style="font-weight:bold;color:#f97316;">Applied ➔ Pending ➔ Approved ➔ Done</p>
<p>Isse dealership staff ko pata rehta hai ki kaun si gaadi ka RTO pending hai aur kiske documents ready hain.</p>

<h2>3. "Swiggy-Style" Live Customer Tracking</h2>
<p>Dealership owners ka sabse zyada time customers ko unki gaadi ka status batane mein waste hota hai. VaahanERP is problem ko apne <strong>Live Tracking Link (/track/[id])</strong> ke zariye solve karta hai:</p>
<ul>
  <li>Jaise hi booking confirm hoti hai, customer ko <strong>WhatsApp par ek link</strong> milta hai</li>
  <li>Bina kisi login ke, customer live track kar sakta hai: <strong>Booking Confirmed ➔ Payment Received ➔ Vehicle Allocated ➔ RTO Processing ➔ Insurance Done ➔ Ready for Delivery</strong></li>
  <li><strong>Digital Downloads:</strong> Jab RTO approve ho jata hai, toh customer apne documents (RC, Insurance) seedha is link se download kar sakta hai</li>
</ul>

<h2>4. 1-Click Delivery &amp; Automated Reminders</h2>
<p>Jab gaadi delivery ke liye ready ho jaye, toh system se <strong>ek click mein "Deliver" mark karein</strong>:</p>
<ul>
  <li>Customer ko automatically <strong>"Vehicle Ready"</strong> ka WhatsApp/SMS chala jayega</li>
  <li>System khud-ba-khud agle saal ke liye <strong>Insurance Expiry Reminder</strong> aur <strong>Next Service Due Reminder</strong> schedule kar dega</li>
  <li>Jo customer ko automatically message ya call bhej dega — aapko kuch karna nahi!</li>
</ul>

<h2>Conclusion: Digital Banein, Aage Badein</h2>
<p>VaahanERP sirf ek software nahi — yeh aapki dealership ka <strong>digital backbone</strong> hai. RTO tracking se lekar 1-click delivery tak, har process automated aur transparent hai.</p>
<p><strong>Abhi free demo lein</strong> aur dekhein ki VaahanERP aapki dealership ko kaise transform kar sakta hai!</p>`,
    coverImage: "/images/vaahan-dashboard.png",
    published: true, featured: true, category: "Business Tips",
    tags: "RTO, documentation, delivery, vehicle registration, VaahanERP, paperwork, tracking", views: 0,
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
