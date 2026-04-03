/**
 * IMAP Email Poller — Checks incoming emails from all 3 mailboxes
 * Processes new emails → Lead capture → Auto-reply → Notification
 * 
 * Email routing:
 * - support@vaahanerp.com → Customer support inquiries  
 * - admin@vaahanerp.com   → Admin/billing requests
 * - info@vaahanerp.com    → General inquiries, marketing responses
 */
import { captureLeadFromEmail } from "./lead-capture";
import { sendAutoReplyEmail, notifyAdminNewLead } from "./email-service";
import { autoAssignLead } from "./follow-up-engine";
import { createLeadNotification } from "./notification-service";

const Imap = require("node-imap");

interface ImapConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
  accountKey: string;
}

interface ParsedEmail {
  from: string;
  fromName: string;
  to: string;
  subject: string;
  body: string;
  date: Date;
  uid: number;
}

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID || "";

// ── Skip patterns (don't create leads from these) ─────────────────────────
const SKIP_PATTERNS = [
  "noreply@", "no-reply@", "mailer-daemon@", "postmaster@",
  "vaahanerp.com", "notifications@", "donotreply@",
  "bounce@", "auto-", "daemon@",
];

function shouldSkip(email: string): boolean {
  const lower = email.toLowerCase();
  return SKIP_PATTERNS.some(p => lower.includes(p));
}

// ── Get IMAP configs for all 3 mailboxes ──────────────────────────────────
function getImapConfigs(): ImapConfig[] {
  const configs: ImapConfig[] = [];
  const accounts = [
    { key: "support", user: "support@vaahanerp.com" },
    { key: "admin", user: "admin@vaahanerp.com" },
    { key: "info", user: "info@vaahanerp.com" },
  ];

  for (const acc of accounts) {
    const password = process.env[`EMAIL_${acc.key.toUpperCase()}_PASSWORD`] || process.env.SMTP_PASSWORD;
    if (password) {
      configs.push({
        user: acc.user,
        password,
        host: "imap.hostinger.com",
        port: 993,
        tls: true,
        accountKey: acc.key,
      });
    }
  }

  return configs;
}

// ── Simple email body extractor ───────────────────────────────────────────
function extractBody(buffer: string): string {
  // Try to find plain text part
  const boundaryMatch = buffer.match(/boundary="?([^"\r\n]+)"?/i);
  if (boundaryMatch) {
    const boundary = boundaryMatch[1];
    const parts = buffer.split(`--${boundary}`);
    for (const part of parts) {
      if (part.includes("text/plain")) {
        const bodyStart = part.indexOf("\r\n\r\n");
        if (bodyStart !== -1) {
          return part.substring(bodyStart + 4).replace(/--$/, "").trim();
        }
      }
    }
  }
  
  // Fallback: extract after headers
  const headerEnd = buffer.indexOf("\r\n\r\n");
  if (headerEnd !== -1) {
    let body = buffer.substring(headerEnd + 4);
    // Strip HTML tags
    body = body.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    return body.substring(0, 2000);
  }
  
  return buffer.substring(0, 500);
}

// ── Fetch unseen emails from one IMAP account ────────────────────────────
async function fetchUnseenEmails(config: ImapConfig): Promise<ParsedEmail[]> {
  return new Promise((resolve, reject) => {
    const emails: ParsedEmail[] = [];
    const timeout = setTimeout(() => {
      reject(new Error(`IMAP timeout for ${config.user}`));
    }, 30000);

    const imap = new Imap({
      user: config.user,
      password: config.password,
      host: config.host,
      port: config.port,
      tls: config.tls,
      tlsOptions: { rejectUnauthorized: false },
      connTimeout: 15000,
      authTimeout: 10000,
    });

    imap.once("ready", () => {
      imap.openBox("INBOX", false, (err: Error, box: any) => {
        if (err) {
          clearTimeout(timeout);
          imap.end();
          return reject(err);
        }

        imap.search(["UNSEEN"], (err: Error, uids: number[]) => {
          if (err || !uids?.length) {
            clearTimeout(timeout);
            imap.end();
            return resolve([]);
          }

          // Limit to 20 emails per poll
          const uidSlice = uids.slice(0, 20);
          const fetch = imap.fetch(uidSlice, { bodies: "", markSeen: true });

          fetch.on("message", (msg: any, seqno: number) => {
            let buffer = "";
            let uid = 0;

            msg.on("body", (stream: any) => {
              stream.on("data", (chunk: Buffer) => { buffer += chunk.toString("utf8"); });
            });

            msg.once("attributes", (attrs: any) => { uid = attrs.uid; });

            msg.once("end", () => {
              // Parse headers
              const fromMatch = buffer.match(/^From:\s*(.+)$/im);
              const toMatch = buffer.match(/^To:\s*(.+)$/im);
              const subjectMatch = buffer.match(/^Subject:\s*(.+)$/im);
              const dateMatch = buffer.match(/^Date:\s*(.+)$/im);

              const fromRaw = fromMatch?.[1]?.trim() || "";
              const emailMatch = fromRaw.match(/<(.+?)>/);
              const fromEmail = (emailMatch?.[1] || fromRaw).trim().toLowerCase();
              const fromName = fromRaw.replace(/<.*>/, "").replace(/"/g, "").trim() || fromEmail.split("@")[0];

              emails.push({
                from: fromEmail,
                fromName,
                to: toMatch?.[1]?.trim() || config.user,
                subject: subjectMatch?.[1]?.trim() || "No Subject",
                body: extractBody(buffer),
                date: dateMatch ? new Date(dateMatch[1]) : new Date(),
                uid,
              });
            });
          });

          fetch.once("end", () => {
            clearTimeout(timeout);
            imap.end();
            resolve(emails);
          });

          fetch.once("error", (err: Error) => {
            clearTimeout(timeout);
            imap.end();
            reject(err);
          });
        });
      });
    });

    imap.once("error", (err: Error) => {
      clearTimeout(timeout);
      reject(err);
    });

    imap.connect();
  });
}

// ── Poll all mailboxes and process emails ─────────────────────────────────
export async function pollAllMailboxes(): Promise<{
  total: number;
  processed: number;
  errors: string[];
  details: { account: string; fetched: number; processed: number }[];
}> {
  const configs = getImapConfigs();
  
  if (configs.length === 0) {
    return { total: 0, processed: 0, errors: ["No email accounts configured. Set EMAIL_SUPPORT_PASSWORD, EMAIL_ADMIN_PASSWORD, or EMAIL_INFO_PASSWORD env vars."], details: [] };
  }

  let total = 0;
  let processed = 0;
  const errors: string[] = [];
  const details: { account: string; fetched: number; processed: number }[] = [];

  for (const config of configs) {
    let fetched = 0;
    let accountProcessed = 0;

    try {
      const emails = await fetchUnseenEmails(config);
      fetched = emails.length;
      total += fetched;

      for (const email of emails) {
        if (shouldSkip(email.from)) {
          console.log(`⏭️ Skipping system email from ${email.from}`);
          continue;
        }

        try {
          // Capture lead
          const result = await captureLeadFromEmail(DEFAULT_TENANT_ID, {
            senderEmail: email.from,
            senderName: email.fromName,
            subject: email.subject,
            body: email.body,
          });

          // Auto-assign
          if (result.isNew) {
            await autoAssignLead(DEFAULT_TENANT_ID, result.lead.id, result.classification.suggestedAssignRole);
            
            // Create notification
            await createLeadNotification(DEFAULT_TENANT_ID, {
              leadId: result.lead.id,
              type: "new_lead",
              title: `📧 New Email Lead: ${email.fromName}`,
              message: `Subject: ${email.subject}\nFrom: ${email.from}\nClassified as: ${result.classification.type}`,
            }).catch(() => {});
          }

          // Send auto-reply
          await sendAutoReplyEmail(email.from, email.fromName, result.classification).catch((err) => {
            console.warn(`Auto-reply failed to ${email.from}:`, err.message);
          });

          // Notify admin for new leads
          if (result.isNew) {
            await notifyAdminNewLead({
              name: email.fromName,
              email: email.from,
              source: "email",
              type: result.classification.type,
              message: `${email.subject}\n${email.body.substring(0, 200)}`,
            }).catch(() => {});
          }

          accountProcessed++;
          processed++;
          console.log(`✅ Processed email from ${email.from} → Lead ${result.lead.id} (${result.classification.type})`);
        } catch (emailErr: any) {
          console.error(`❌ Error processing email from ${email.from}:`, emailErr.message);
          errors.push(`${email.from}: ${emailErr.message}`);
        }
      }
    } catch (imapErr: any) {
      console.error(`❌ IMAP error for ${config.user}:`, imapErr.message);
      errors.push(`${config.user}: ${imapErr.message}`);
    }

    details.push({ account: config.user, fetched, processed: accountProcessed });
  }

  return { total, processed, errors, details };
}
