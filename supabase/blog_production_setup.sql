-- VaahanERP Blog Production Setup
-- Run this in Supabase SQL Editor → New Query → Paste → Run

-- Step 1: Create BlogPost table
CREATE TABLE IF NOT EXISTS "BlogPost" (
  "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "title"       TEXT        NOT NULL,
  "slug"        TEXT        NOT NULL,
  "content"     TEXT        NOT NULL DEFAULT '',
  "excerpt"     TEXT,
  "coverImage"  TEXT,
  "published"   BOOLEAN     NOT NULL DEFAULT false,
  "featured"    BOOLEAN     NOT NULL DEFAULT false,
  "category"    TEXT,
  "tags"        TEXT,
  "metaTitle"   TEXT,
  "metaDesc"    TEXT,
  "authorId"    TEXT,
  "views"       INTEGER     NOT NULL DEFAULT 0,
  "publishedAt" TIMESTAMPTZ DEFAULT NOW(),
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BlogPost_slug_key" UNIQUE ("slug")
);

-- Step 2: Insert/upsert blog posts
INSERT INTO "BlogPost" ("title","slug","excerpt","content","coverImage","published","featured","category","tags","views","publishedAt")
VALUES
(
  'Vehicle Dealership Mein ERP Kyun Zaruri Hai?',
  'vehicle-dealership-mein-erp-kyun-zaruri-hai',
  'Vehicle dealership chalana sirf vehicles bechne se zyada hai. VaahanERP se apna pura showroom automate karo — leads se delivery tak.',
  '<h2>Dealership Mein Problems Kya Hain?</h2><p>Aaj ke competitive market mein vehicle dealership chalana sirf vehicles bechne se kaafi zyada complicated ho gaya hai. Leads manage karna, test drives schedule karna, finance process, RTO documentation, service reminders — yeh sab manually manage karna almost impossible hai.</p><h2>ERP Kya Karta Hai?</h2><ul><li><strong>Lead Management:</strong> Incoming leads automatically capture aur assign hoti hain</li><li><strong>Inventory Tracking:</strong> Real-time vehicle stock visibility</li><li><strong>Finance &amp; Loans:</strong> Bank tie-ups aur EMI calculations automated</li><li><strong>Service Department:</strong> Job cards, reminders, revenue tracking</li></ul><h2>Conclusion</h2><p>Agar aap apni dealership ko next level pe le jaana chahte hain, toh ERP sirf ek option nahi — yeh ek necessity ban gayi hai. VaahanERP ke saath free demo book karo.</p>',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=450&fit=crop&q=80',
  true, true, 'Business Tips',
  'ERP, dealership management, vehicle showroom, lead CRM, automation',
  2, NOW()
),
(
  'Bike Showroom Mein Lead Management: 5 Proven Tips',
  'bike-showroom-lead-management-tips',
  'Har din showroom mein 20-30 leads aati hain. 5 proven tips se apna conversion rate 25% se 40% tak badha sakte ho.',
  '<h2>Lead Management Kyun Important Hai?</h2><p>Ek typical bike showroom mein roz 20-30 inquiries aati hain. Inhe manually track karna impossible hai.</p><h2>5 Proven Tips</h2><ol><li><strong>Har Lead Ko Immediately Register Karo</strong></li><li><strong>Same Day Follow-Up Rule</strong></li><li><strong>WhatsApp Integration Use Karo</strong></li><li><strong>Lost Leads Ko Re-Engage Karo</strong></li><li><strong>Data Se Seekho</strong></li></ol><p>In tips se average 15% conversion improvement milti hai pehle 3 months mein.</p>',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=450&fit=crop&q=80',
  true, false, 'Sales',
  'lead management, bike showroom, conversion, CRM, follow-up',
  1, NOW()
),
(
  'Vehicle Dealership Ka Cashflow Kaise Manage Karein',
  'vehicle-dealership-cashflow-management',
  'Profitable dealership bhi cash crunch mein aa sakti hai. Digital daybook se apna cashflow 100% accurate banao.',
  '<h2>Cashflow Problem Kyun Hoti Hai?</h2><p>Bahut se dealership owners sochte hain ki agar business profitable hai toh cash problem nahi hogi. Lekin reality alag hai. Advance payments, inventory blocking capital, loan disbursements — yeh sab cashflow issues create karte hain.</p><h2>Digital Daybook Ke Fayde</h2><ul><li>Real-time cashflow visibility</li><li>Bank auto-reconciliation</li><li>GST tracking automated</li><li>30-day forecast projections</li></ul>',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop&q=80',
  true, true, 'Finance',
  'cashflow, daybook, dealership accounting, payments, finance',
  0, NOW()
),
(
  'Service Workshop Management: Job Cards Se Revenue Kaise Badhayein',
  'service-workshop-job-cards-revenue',
  'Service department sirf repair ka kaam nahi, yeh consistent revenue source hai. Digital job cards se revenue 30% badhaiye.',
  '<h2>Service Department Ki Importance</h2><p>Vehicle dealership mein service department year-round consistent revenue generate karta hai — total revenue ka 30-40%.</p><h2>Digital Job Cards Ke Fayde</h2><ul><li>Customer real-time updates milte hain</li><li>Mechanic accountability track hoti hai</li><li>Parts auto-order triggered hoti hai</li><li>Upselling recommendations automated</li><li>Billing accuracy 100% rehti hai</li></ul>',
  'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800&h=450&fit=crop&q=80',
  true, false, 'Service',
  'service workshop, job cards, mechanic, revenue, vehicle service',
  0, NOW()
),
(
  'WhatsApp CRM: Dealership Leads Ko Convert Karne Ka Sabse Fast Tarika',
  'whatsapp-crm-dealership-leads-convert',
  'India mein 90% buyers WhatsApp use karte hain. WhatsApp CRM se response time 2 ghante se 10 minute karo aur conversion 35% badhao.',
  '<h2>WhatsApp India Ka #1 Communication Tool</h2><p>India mein 500 million se zyada WhatsApp users hain. Aapke potential customers din mein 3-4 ghante WhatsApp pe spend karte hain.</p><p>Studies show karte hain ki 5 minute ke andar reply karo toh 9x higher conversion chance hoti hai. VaahanERP ka built-in WhatsApp integration yeh sab ek dashboard se manage karta hai.</p>',
  'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=450&fit=crop&q=80',
  true, false, 'Technology',
  'WhatsApp CRM, lead conversion, automation, dealership, communication',
  0, NOW()
),
(
  'RTO Documentation: Vehicle Delivery Process Streamline Kaise Karein',
  'rto-documentation-vehicle-delivery-process',
  'RTO documentation aur delivery delays se customer frustration hota hai. Digital document management se delivery process 50% fast karein.',
  '<h2>RTO Documentation Ka Problem</h2><p>Vehicle delivery mein sabse zyada delay RTO documentation mein hoti hai. Form 20, 21, 22, insurance, hypothecation — yeh sab manually manage karna time-consuming aur error-prone hai.</p><h2>Result</h2><ul><li>Delivery time: 7 days se 3 days</li><li>Documentation errors: 0% (previously 15%)</li><li>Customer satisfaction: 85% se 95%</li></ul>',
  'https://images.unsplash.com/photo-1568599104766-6f7c7775bef8?w=800&h=450&fit=crop&q=80',
  true, false, 'Business Tips',
  'RTO, documentation, delivery, vehicle registration, paperwork',
  0, NOW()
)
ON CONFLICT ("slug") DO UPDATE SET
  "coverImage"  = EXCLUDED."coverImage",
  "published"   = EXCLUDED."published",
  "featured"    = EXCLUDED."featured",
  "content"     = EXCLUDED."content",
  "excerpt"     = EXCLUDED."excerpt",
  "updatedAt"   = NOW();

-- Step 3: Verify
SELECT slug, title, featured, category, 
       CASE WHEN "coverImage" IS NOT NULL THEN '✅ image' ELSE '❌ no image' END as img
FROM "BlogPost" 
ORDER BY "publishedAt" DESC;
