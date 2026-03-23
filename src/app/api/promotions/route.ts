import { NextRequest, NextResponse } from "next/server";

// In-memory store (replace with DB in production)
let promotions = [
  {
    id: "P001",
    title: "🪔 Diwali Dhamaka Sale",
    description: "Sabhi Honda vehicles par 15% tak discount!",
    discountPercent: 15,
    validFrom: "2026-10-15",
    validTo: "2026-11-05",
    applicableBrands: "Honda, TVS",
    applicableVehicles: "All Two-Wheelers",
    type: "Festival",
    createdAt: new Date().toISOString(),
  },
];

function getStatus(from: string, to: string) {
  const now = new Date();
  if (now > new Date(to)) return "Expired";
  if (now < new Date(from)) return "Upcoming";
  return "Active";
}

export async function GET() {
  const data = promotions.map((p) => ({
    ...p,
    status: getStatus(p.validFrom, p.validTo),
  }));
  return NextResponse.json({ success: true, promotions: data });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, discountPercent, validFrom, validTo, applicableBrands, applicableVehicles, type } = body;

    if (!title || !validFrom || !validTo) {
      return NextResponse.json({ success: false, error: "Title aur dates required hain" }, { status: 400 });
    }

    const newPromo = {
      id: `P${Date.now().toString().slice(-6)}`,
      title,
      description: description || "",
      discountPercent: discountPercent || 0,
      validFrom,
      validTo,
      applicableBrands: applicableBrands || "",
      applicableVehicles: applicableVehicles || "",
      type: type || "Festival",
      createdAt: new Date().toISOString(),
    };

    promotions.push(newPromo);
    return NextResponse.json({ success: true, promotion: { ...newPromo, status: getStatus(validFrom, validTo) } });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Promotion ID required hai" }, { status: 400 });
    }

    const idx = promotions.findIndex((p) => p.id === id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: "Promotion nahi mili" }, { status: 404 });
    }

    promotions[idx] = { ...promotions[idx], ...updates };
    return NextResponse.json({ success: true, promotion: promotions[idx] });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Promotion ID required hai" }, { status: 400 });
    }

    const before = promotions.length;
    promotions = promotions.filter((p) => p.id !== id);

    if (promotions.length === before) {
      return NextResponse.json({ success: false, error: "Promotion nahi mili" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Promotion delete ho gayi" });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
