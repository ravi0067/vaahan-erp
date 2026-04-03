/**
 * Email Service — Send & receive emails via SMTP/IMAP
 * Uses 3 email IDs: support@, admin@, info@vaahanerp.com
 */

// ── Email Configuration ───────────────────────────────────────────────────
export const EMAIL_ACCOUNTS = {
  support: {
    address: "support@vaahanerp.com",
    purpose: "Customer support, general inquiries, lead notifications",
    smtpHost: "smtp.hostinger.com",
    smtpPort: 465,
    imapHost: "imap.hostinger.com",
    imapPort: 993,
  },
  admin: {
    address: "admin@vaahanerp.com",
    purpose: "Admin notifications, billing, invoices, internal alerts",
    smtpHost: "smtp.hostinger.com",
    smtpPort: 465,
    imapHost: "imap.hostinger.com",
    imapPort: 993,
  },
  info: {
    address: "info@vaahanerp.com",
    purpose: "Marketing, newsletters, general info, auto-replies to leads",
    smtpHost: "smtp.hostinger.com",
    smtpPort: 465,
    imapHost: "imap.hostinger.com",
    imapPort: 993,
  },
} as const;

export type EmailAccountKey = keyof typeof EMAIL_ACCOUNTS;

// ── Send Email ────────────────────────────────────────────────────────────
export async function sendEmail(opts: {
  from?: EmailAccountKey;
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const account = EMAIL_ACCOUNTS[opts.from || "support"];

  // Get credentials from env or DB
  const user = process.env[`EMAIL_${(opts.from || "support").toUpperCase()}_USER`] || account.address;
  const pass = process.env[`EMAIL_${(opts.from || "support").toUpperCase()}_PASSWORD`] || process.env.SMTP_PASSWORD;

  if (!pass) {
    console.warn(`⚠️ Email password not set for ${account.address}`);
    return { success: false, error: "SMTP password not configured" };
  }

  try {
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: account.smtpHost,
      port: account.smtpPort,
      secure: true,
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from: `"VaahanERP" <${account.address}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo || account.address,
    });

    console.log(`✅ Email sent: ${info.messageId} from ${account.address} to ${opts.to}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`❌ Email send error (${account.address}):`, error.message);
    return { success: false, error: error.message };
  }
}

// ── Send Lead Notification to Admin ───────────────────────────────────────
export async function notifyAdminNewLead(lead: {
  name: string;
  phone?: string;
  email?: string;
  source: string;
  type: string;
  message?: string;
}): Promise<void> {
  const { getNewLeadAdminNotification } = await import("./auto-responder");
  const html = getNewLeadAdminNotification(lead);

  // Send to both admin and support
  await Promise.allSettled([
    sendEmail({
      from: "admin",
      to: "admin@vaahanerp.com",
      subject: `🔔 New ${lead.source.toUpperCase()} Lead: ${lead.name}`,
      html,
    }),
    sendEmail({
      from: "support",
      to: "support@vaahanerp.com",
      subject: `🔔 New ${lead.source.toUpperCase()} Lead: ${lead.name}`,
      html,
    }),
  ]);
}

// ── Send Auto-Reply to Lead ───────────────────────────────────────────────
export async function sendAutoReplyEmail(
  toEmail: string,
  leadName: string,
  classification: { type: string }
): Promise<void> {
  const { getEmailAutoReply } = await import("./auto-responder");
  const { Classification } = await import("./classifier");
  const html = getEmailAutoReply(leadName, classification as any);

  await sendEmail({
    from: "info", // Auto-replies from info@
    to: toEmail,
    subject: classification.type === "support"
      ? "🔧 VaahanERP — Aapki Service Request Mil Gayi!"
      : classification.type === "admin"
        ? "📋 VaahanERP — Aapka Request Received"
        : "🏍️ VaahanERP — Aapki Inquiry Mil Gayi!",
    html,
    replyTo: "support@vaahanerp.com",
  });
}

// ── Email Routing Rules ───────────────────────────────────────────────────
export function getEmailRouting(classification: { type: string }): {
  replyFrom: EmailAccountKey;
  notifyTo: string[];
  assignTeam: string;
} {
  switch (classification.type) {
    case "sales":
      return {
        replyFrom: "info",
        notifyTo: ["support@vaahanerp.com", "admin@vaahanerp.com"],
        assignTeam: "SALES_EXEC",
      };
    case "support":
      return {
        replyFrom: "support",
        notifyTo: ["support@vaahanerp.com"],
        assignTeam: "SERVICE_MANAGER",
      };
    case "admin":
      return {
        replyFrom: "admin",
        notifyTo: ["admin@vaahanerp.com"],
        assignTeam: "ACCOUNTANT",
      };
    default:
      return {
        replyFrom: "support",
        notifyTo: ["support@vaahanerp.com"],
        assignTeam: "SALES_EXEC",
      };
  }
}
