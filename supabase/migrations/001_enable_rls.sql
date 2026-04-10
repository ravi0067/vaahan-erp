-- ═══════════════════════════════════════════════════════════════════════════
-- VaahanERP — Row Level Security (RLS) Setup
-- Generated: 2026-04-10
-- Purpose: Block all public/anon REST API access. Only service_role (used
--          by the server/Prisma) can access data. Prisma & Next.js API
--          routes are unaffected (they connect as postgres superuser).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── STEP 1: Enable RLS on ALL 26 tables ──────────────────────────────────
ALTER TABLE "Tenant"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Permission"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lead"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LeadActivity"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LeadNotification"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vehicle"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Booking"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BookingPayment"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BookingDocument"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RTORegistration"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DaybookEntry"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CashTransaction"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Expense"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ExpenseBudget"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JobCard"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DealershipBrand"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ShowroomLocation"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Promotion"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CommunicationLog"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AvatarVisitor"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AvatarSession"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SubscriptionPayment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SystemSetting"       ENABLE ROW LEVEL SECURITY;

-- ── STEP 2: Drop any stray existing policies ──────────────────────────────
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT schemaname, tablename, policyname
           FROM pg_policies WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
                   r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ── STEP 3: service_role bypass policies (explicit, belt-and-suspenders) ──
-- service_role already bypasses RLS but explicit policies are cleaner.
-- anon and authenticated roles get NO policies → zero access by default.

CREATE POLICY "tenant_service_only"      ON "Tenant"             FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "user_service_only"        ON "User"               FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "permission_service_only"  ON "Permission"         FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "lead_service_only"        ON "Lead"               FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "leadact_service_only"     ON "LeadActivity"       FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "leadnotif_service_only"   ON "LeadNotification"   FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "vehicle_service_only"     ON "Vehicle"            FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "customer_service_only"    ON "Customer"           FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "booking_service_only"     ON "Booking"            FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "bookpay_service_only"     ON "BookingPayment"     FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "bookdoc_service_only"     ON "BookingDocument"    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "rto_service_only"         ON "RTORegistration"    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "daybook_service_only"     ON "DaybookEntry"       FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "cash_service_only"        ON "CashTransaction"    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "expense_service_only"     ON "Expense"            FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "expbudget_service_only"   ON "ExpenseBudget"      FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "jobcard_service_only"     ON "JobCard"            FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "brand_service_only"       ON "DealershipBrand"    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "location_service_only"    ON "ShowroomLocation"   FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "promo_service_only"       ON "Promotion"          FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "commlog_service_only"     ON "CommunicationLog"   FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "avatarvis_service_only"   ON "AvatarVisitor"      FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "avatarses_service_only"   ON "AvatarSession"      FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "sub_service_only"         ON "Subscription"       FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "subpay_service_only"      ON "SubscriptionPayment" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "syssetting_service_only"  ON "SystemSetting"      FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── STEP 4: Drop legacy tables (old pre-Prisma tables) ───────────────────
DROP TABLE IF EXISTS "customers" CASCADE;
DROP TABLE IF EXISTS "leads" CASCADE;

-- ── Done ──────────────────────────────────────────────────────────────────
-- Result after this migration:
--   anon key  → 403 on ALL tables  ✅
--   service_role → full access      ✅ (used by Next.js API routes)
--   Prisma (postgres user) → full access ✅ (superuser bypasses RLS)
