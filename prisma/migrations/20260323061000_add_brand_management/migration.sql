-- Add Brand Management Tables

-- Dealership Brands (KTM, Triumph, Hero, etc.)
CREATE TABLE "DealershipBrand" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "brandType" TEXT NOT NULL DEFAULT 'BIKE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealershipBrand_pkey" PRIMARY KEY ("id")
);

-- Showroom Locations (Chinhat KTM, Ring Road KTM, etc.)
CREATE TABLE "ShowroomLocation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "locationName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "managerName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShowroomLocation_pkey" PRIMARY KEY ("id")
);

-- Add missing columns to Vehicle table
ALTER TABLE "Vehicle" ADD COLUMN "make" TEXT DEFAULT 'Unknown';
ALTER TABLE "Vehicle" ADD COLUMN "year" INTEGER DEFAULT 2024;
ALTER TABLE "Vehicle" ADD COLUMN "fuelType" TEXT DEFAULT 'PETROL';
ALTER TABLE "Vehicle" ADD COLUMN "transmission" TEXT DEFAULT 'MANUAL';
ALTER TABLE "Vehicle" ADD COLUMN "vehicleType" TEXT DEFAULT 'BIKE';
ALTER TABLE "Vehicle" ADD COLUMN "brandId" TEXT;
ALTER TABLE "Vehicle" ADD COLUMN "locationId" TEXT;

-- Add indexes and foreign keys
CREATE INDEX "DealershipBrand_tenantId_idx" ON "DealershipBrand"("tenantId");
CREATE INDEX "ShowroomLocation_tenantId_idx" ON "ShowroomLocation"("tenantId");
CREATE INDEX "ShowroomLocation_brandId_idx" ON "ShowroomLocation"("brandId");

-- Add Foreign Key Constraints
ALTER TABLE "DealershipBrand" ADD CONSTRAINT "DealershipBrand_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShowroomLocation" ADD CONSTRAINT "ShowroomLocation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShowroomLocation" ADD CONSTRAINT "ShowroomLocation_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "DealershipBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "DealershipBrand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "ShowroomLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;