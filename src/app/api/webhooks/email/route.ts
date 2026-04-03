/**
 * Email Webhook — Receives inbound emails (via Zapier/Make/SendGrid Inbound Parse)
 * POST /api/webhooks/email
 * Also callable manually for testing
 */
import { NextRequest, NextResponse } from "next/server";
import { captureLeadFromEmail } from "@/lib/lead-automation/lead-capture";
import { notifyAdminNewLead, sendAutoReplyEmail } from "@/lib/lead-automation/email-service";
import { autoAssignLead } from "@/lib/lead-automation/follow-up-engine";

export const dynamic = "force-dynamic";

const WEBHOOK_SECRET = process.env.EMAIL_WEBHOOK_SECRET || "vaahanerp_email_2026";
const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID || "";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let emailData: {
      from: string;
      fromName?: string;
      to: string;
      subject: string;
      body: string;
      html?: string;
    };

    if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      // SendGrid Inbound Parse format
      const formData = await req.formData();
      emailData = {
        from: formData.get("from")?.toString() || "",
        fromName: formData.get("from")?.toString()?.split("<")[0]?.trim() || "",
        to: formData.get("to")?.toString() || "",
        subject: formData.get("subject")?.toString() || "No Subject",
        body: formData.get("text")?.toString() || "",
        html: formData.get("html")?.toString() || "",
      };
    } else {
      // JSON format (Zapier/Make/manual)
      const body = await req.json();

      // Verify webhook secret if provided
      if (body.secret && body.secret !== WEBHOOK_SECRET) {
        return NextResponse.json({ error: "Invalid secret" }, { status: 403 });
      }

      emailData = {
        from: body.from || body.senderEmail || body.sender || "",
        fromName: body.fromName || body.senderName || "",
        to: body.to || body.recipient || "",
        subject: body.subject || "No Subject",
        body: body.body || body.text || body.content || "",
        html: body.html || "",
      };
    }

    // Extract clean email from "Name <email>" format
    const emailMatch = emailData.from.match(/<(.+?)>/) || [null, emailData.from];
    const senderEmail = (emailMatch[1] || emailData.from).trim().toLowerCase();
    const senderName = emailData.fromName?.replace(/<.*>/, "").trim() || senderEmail.split("@")[0];

    if (!senderEmail || !senderEmail.includes("@")) {
      return NextResponse.json({ error: "Invalid sender email" }, { status: 400 });
    }

    // Skip auto-replies and system emails
    const skipPatterns = ["noreply@", "no-reply@", "mailer-daemon@", "postmaster@", "vaahanerp.com"];
    if (skipPatterns.some(p => senderEmail.includes(p))) {
      return NextResponse.json({ status: "skipped", reason: "system_email" });
    }

    console.log(`📧 Email from ${senderEmail} (${senderName}): ${emailData.subject}`);

    // Determine which tenant based on "to" address
    const tenantId = DEFAULT_TENANT_ID;

    // 1. Capture lead
    const result = await captureLeadFromEmail(tenantId, {
      senderEmail,
      senderName,
      subject: emailData.subject,
      body: emailData.body || emailData.html || "",
    });

    // 2. Auto-assign
    if (result.isNew) {
      await autoAssignLead(tenantId, result.lead.id, result.classification.suggestedAssignRole);
    }

    // 3. Send auto-reply email
    await sendAutoReplyEmail(senderEmail, senderName, result.classification).catch(err => {
      console.warn("Auto-reply email failed:", err.message);
    });

    // 4. Notify admin
    if (result.isNew) {
      await notifyAdminNewLead({
        name: senderName,
        email: senderEmail,
        source: "email",
        type: result.classification.type,
        message: `${emailData.subject}\n${(emailData.body || "").substring(0, 200)}`,
      }).catch(() => {});
    }

    return NextResponse.json({
      status: "processed",
      leadId: result.lead.id,
      isNew: result.isNew,
      classification: result.classification.type,
      priority: result.classification.priority,
    });
  } catch (error: any) {
    console.error("❌ Email webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
