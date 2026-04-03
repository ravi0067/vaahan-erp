/**
 * WhatsApp Webhook — Meta WhatsApp Cloud API
 * POST /api/webhooks/whatsapp — Incoming messages
 * GET /api/webhooks/whatsapp — Verification challenge
 */
import { NextRequest, NextResponse } from "next/server";
import { captureLeadFromWhatsApp } from "@/lib/lead-automation/lead-capture";
import { classifyMessage } from "@/lib/lead-automation/classifier";
import { getWhatsAppAutoReply } from "@/lib/lead-automation/auto-responder";
import { notifyAdminNewLead } from "@/lib/lead-automation/email-service";
import { autoAssignLead } from "@/lib/lead-automation/follow-up-engine";

export const dynamic = "force-dynamic";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "vaahanerp_webhook_2026";
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID || "";

// ── GET — Webhook Verification (Meta sends this during setup) ─────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ WhatsApp webhook verified");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// ── POST — Incoming WhatsApp Messages ─────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Meta webhook format
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value?.messages?.length) {
      // Status update (delivered, read) — acknowledge
      return NextResponse.json({ status: "ok" });
    }

    const message = value.messages[0];
    const contact = value.contacts?.[0];
    const phone = message.from; // Full number with country code
    const name = contact?.profile?.name || "";
    const text = message.text?.body || message.caption || "";

    if (!text) {
      return NextResponse.json({ status: "no_text" });
    }

    console.log(`📩 WhatsApp from ${phone} (${name}): ${text.substring(0, 100)}`);

    // 1. Capture lead
    const result = await captureLeadFromWhatsApp(DEFAULT_TENANT_ID, {
      phone,
      name,
      message: text,
    });

    // 2. Auto-assign
    if (result.isNew) {
      await autoAssignLead(DEFAULT_TENANT_ID, result.lead.id, result.classification.suggestedAssignRole);
    }

    // 3. Send auto-reply
    const autoReply = getWhatsAppAutoReply(name || "Customer", result.classification);
    await sendWhatsAppMessage(phone, autoReply);

    // 4. Notify admin
    if (result.isNew) {
      await notifyAdminNewLead({
        name: name || phone,
        phone,
        source: "whatsapp",
        type: result.classification.type,
        message: text.substring(0, 200),
      }).catch(() => {}); // Don't fail if email not configured
    }

    return NextResponse.json({
      status: "processed",
      leadId: result.lead.id,
      isNew: result.isNew,
      type: result.classification.type,
    });
  } catch (error: any) {
    console.error("❌ WhatsApp webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── Send WhatsApp Message via Cloud API ───────────────────────────────────
async function sendWhatsAppMessage(to: string, text: string): Promise<boolean> {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    console.warn("⚠️ WhatsApp API credentials not set");
    return false;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: text },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("WhatsApp send error:", err);
      return false;
    }

    console.log(`✅ WhatsApp sent to ${to}`);
    return true;
  } catch (error) {
    console.error("WhatsApp send exception:", error);
    return false;
  }
}
