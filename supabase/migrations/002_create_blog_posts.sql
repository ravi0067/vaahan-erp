-- Blog Posts Table for VaahanERP
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS "BlogPost" (
  "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "title"       TEXT NOT NULL,
  "slug"        TEXT NOT NULL UNIQUE,
  "content"     TEXT NOT NULL,
  "excerpt"     TEXT,
  "coverImage"  TEXT,
  "published"   BOOLEAN NOT NULL DEFAULT false,
  "featured"    BOOLEAN NOT NULL DEFAULT false,
  "metaTitle"   TEXT,
  "metaDesc"    TEXT,
  "category"    TEXT,
  "tags"        TEXT,
  "authorId"    TEXT,
  "views"       INTEGER NOT NULL DEFAULT 0,
  "publishedAt" TIMESTAMPTZ,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BlogPost_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "BlogPost_slug_idx"       ON "BlogPost" ("slug");
CREATE INDEX IF NOT EXISTS "BlogPost_published_idx"  ON "BlogPost" ("published");
CREATE INDEX IF NOT EXISTS "BlogPost_featured_idx"   ON "BlogPost" ("featured");
CREATE INDEX IF NOT EXISTS "BlogPost_category_idx"   ON "BlogPost" ("category");

-- Auto-update updatedAt trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_blogpost_updated_at ON "BlogPost";
CREATE TRIGGER update_blogpost_updated_at
  BEFORE UPDATE ON "BlogPost"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE "BlogPost" ENABLE ROW LEVEL SECURITY;

-- Policy: service_role bypasses RLS (default)
-- Policy: Public can read published posts
CREATE POLICY "public_read_published" ON "BlogPost"
  FOR SELECT USING (published = true);

-- Sample blog post (optional - useful for testing)
INSERT INTO "BlogPost" ("id", "title", "slug", "content", "excerpt", "published", "featured", "category", "tags", "publishedAt")
VALUES (
  gen_random_uuid()::text,
  'Vehicle Dealership Mein ERP Kyun Zaruri Hai? — VaahanERP Guide',
  'vehicle-dealership-mein-erp-kyun-zaruri-hai',
  '<h2>Showroom Management Ka Naya Tarika</h2>
  <p>Aaj ke competitive market mein, vehicle dealership chalana sirf vehicles bechne se zyada hai. Aapko leads track karna hai, bookings manage karni hai, service records maintain karne hain, aur cashflow par nazar rakhni hai.</p>
  <h2>Manual Work Ka Problem</h2>
  <p>Bina ERP ke, yeh sab kaam Excel sheets aur notebooks mein hota hai. Yeh approach slow, error-prone, aur unscalable hai.</p>
  <h3>Common Problems:</h3>
  <ul>
    <li>Leads ka follow-up miss hona</li>
    <li>Stock inventory mismatch</li>
    <li>Cash entries mein galti</li>
    <li>Customer complaints ka record na hona</li>
  </ul>
  <h2>VaahanERP Ka Solution</h2>
  <p>VaahanERP ek complete dealership management system hai jo aapke showroom ke har kaam ko automate karta hai — leads se lekar final delivery tak.</p>
  <h3>Key Features:</h3>
  <ul>
    <li>Smart Lead CRM with automation</li>
    <li>Real-time stock management</li>
    <li>Digital booking & delivery process</li>
    <li>Integrated cashflow & daybook</li>
    <li>Service job cards & billing</li>
    <li>WhatsApp communication center</li>
  </ul>
  <h2>Result Kya Milta Hai?</h2>
  <p>VaahanERP use karne ke baad dealerships ko 40% zyada lead conversion, 60% time savings in admin work, aur near-zero billing errors milte hain.</p>
  <p><strong>Apni dealership ko agale level par lekar jao — aaj hi VaahanERP demo book karo!</strong></p>',
  'Aaj ke competitive market mein vehicle dealership chalana sirf vehicles bechne se zyada hai. VaahanERP se apna pura showroom automate karo.',
  true,
  true,
  'Business Tips',
  'ERP, dealership management, vehicle showroom, lead CRM, automation',
  NOW()
) ON CONFLICT (slug) DO NOTHING;
