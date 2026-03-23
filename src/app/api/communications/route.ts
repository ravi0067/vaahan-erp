import { NextRequest, NextResponse } from "next/server";

// In-memory store (replace with DB in production)
let calls = [
  {
    id: "C001",
    customerName: "Rajesh Kumar",
    phone: "+91 98765 43210",
    purpose: "Insurance Expiry Reminder",
    status: "Completed",
    scheduledAt: "2026-03-23T10:00:00",
    notes: "Customer ne renewal confirm kiya",
    createdAt: new Date().toISOString(),
  },
];

let notifications = [
  {
    id: "N001",
    message: "Rajesh Kumar ka insurance 5 din mein expire ho raha hai!",
    type: "insurance",
    time: new Date().toISOString(),
    read: false,
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const resource = searchParams.get("type") || "calls";

  if (resource === "notifications") {
    return NextResponse.json({ success: true, notifications });
  }

  return NextResponse.json({ success: true, calls });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "schedule-call") {
      const { customerName, phone, purpose, scheduledAt, notes } = body;

      if (!customerName || !phone || !scheduledAt) {
        return NextResponse.json({ success: false, error: "Customer name, phone aur time required hai" }, { status: 400 });
      }

      const newCall = {
        id: `C${Date.now().toString().slice(-6)}`,
        customerName,
        phone,
        purpose: purpose || "Follow-up Call",
        status: "Scheduled" as const,
        scheduledAt,
        notes: notes || "",
        createdAt: new Date().toISOString(),
      };

      calls.push(newCall);
      return NextResponse.json({ success: true, call: newCall });
    }

    if (action === "update-call-status") {
      const { id, status } = body;
      const idx = calls.findIndex((c) => c.id === id);
      if (idx === -1) {
        return NextResponse.json({ success: false, error: "Call nahi mili" }, { status: 404 });
      }
      calls[idx].status = status;
      return NextResponse.json({ success: true, call: calls[idx] });
    }

    if (action === "send-notification") {
      const { message, type } = body;
      const newNotif = {
        id: `N${Date.now().toString().slice(-6)}`,
        message,
        type: type || "general",
        time: new Date().toISOString(),
        read: false,
      };
      notifications.push(newNotif);
      return NextResponse.json({ success: true, notification: newNotif });
    }

    if (action === "mark-read") {
      const { id } = body;
      const notif = notifications.find((n) => n.id === id);
      if (notif) notif.read = true;
      return NextResponse.json({ success: true });
    }

    if (action === "send-bulk") {
      const { channel, target, message } = body;
      // In production: integrate with WhatsApp/Email/SMS APIs
      return NextResponse.json({
        success: true,
        message: `${channel} message "${message}" sent to ${target} customers`,
        sentCount: Math.floor(Math.random() * 50) + 10,
      });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type") || "call";

    if (!id) {
      return NextResponse.json({ success: false, error: "ID required hai" }, { status: 400 });
    }

    if (type === "notification") {
      notifications = notifications.filter((n) => n.id !== id);
    } else {
      calls = calls.filter((c) => c.id !== id);
    }

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
