/**
 * Call Webhook — Receives call events from Exotel/Twilio
 * POST /api/webhooks/call
 */
import { NextRequest, NextResponse } from "next/server";
import { captureLeadFromCall } from "@/lib/lead-automation/lead-capture";
import { getCallMissedReply } from "@/lib/lead-automation/auto-responder";
import { notifyAdminNewLead } from "@/lib/lead-automation/email-service";
import { autoAssignLead } from "@/lib/lead-automation/follow-up-engine";

export const dynamic = "force-dynamic";

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support both Exotel and Twilio formats + manual
    const phone = body.From || body.CallFrom || body.phone || body.from || "";
    const status = body.Status || body.CallStatus || body.status || "received";
    const duration = parseInt(body.Duration || body.CallDuration || body.duration || "0", 10);
    const name = body.CallerName || body.name || "";
    const direction = body.Direction || body.direction || "inbound";
    const notes = body.Notes || body.notes || body.RecordingUrl || "";

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);

    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    console.log(`📞 Call from ${cleanPhone} | Status: ${status} | Duration: ${duration}s`);

    // Map various status formats
    const normalizedStatus = normalizeCallStatus(status);

    // 1. Capture lead
    const result = await captureLeadFromCall(DEFAULT_TENANT_ID, {
      phone: cleanPhone,
      name,
      duration,
      status: normalizedStatus,
      notes,
    });

    // 2. Auto-assign
    if (result.isNew) {
      await autoAssignLead(
        DEFAULT_TENANT_ID,
        result.lead.id,
        result.classification.suggestedAssignRole
      );
    }

    // 3. If missed call — send WhatsApp/SMS auto-reply
    if (normalizedStatus === "missed" || normalizedStatus === "no-answer") {
      const missedReply = getCallMissedReply(name || "Customer");
      // Try to send via WhatsApp
      await sendMissedCallNotification(cleanPhone, missedReply).catch(() => {});
    }

    // 4. Notify admin for new leads
    if (result.isNew) {
      await notifyAdminNewLead({
        name: name || cleanPhone,
        phone: cleanPhone,
        source: "call",
        type: result.classification.type,
        message: `Call ${normalizedStatus} | Duration: ${duration}s`,
      }).catch(() => {});
    }

    return NextResponse.json({
      status: "processed",
      leadId: result.lead.id,
      isNew: result.isNew,
      callStatus: normalizedStatus,
      classification: result.classification.type,
    });
  } catch (error: any) {
    console.error("❌ Call webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── Normalize call status from various providers ──────────────────────────
function normalizeCallStatus(status: string): string {
  const s = status.toLowerCase();
  if (["completed", "answered", "connected"].includes(s)) return "answered";
  if (["no-answer", "noanswer", "not_answered", "missed", "unanswered"].includes(s)) return "missed";
  if (["busy", "engaged"].includes(s)) return "busy";
  if (["failed", "error"].includes(s)) return "failed";
  if (["ringing", "in-progress", "initiated"].includes(s)) return "ringing";
  return s;
}

// ── Send missed call notification via WhatsApp ────────────────────────────
async function sendMissedCallNotification(phone: string, message: string): Promise<void> {
  const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    console.warn("⚠️ WhatsApp not configured for missed call replies");
    return;
  }

  const fullPhone = phone.startsWith("91") ? phone : `91${phone}`;

  await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: fullPhone,
      type: "text",
      text: { body: message },
    }),
  });
}
