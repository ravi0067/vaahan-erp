/**
 * Lead Automation System — Central export
 * Captures leads from Email, WhatsApp, Calls → DB → Classification → Auto-Response → Tracking
 */

export { classifyMessage, type Classification } from "./classifier";
export { getEmailAutoReply, getWhatsAppAutoReply, getCallMissedReply, getNewLeadAdminNotification } from "./auto-responder";
export { captureLeadFromEmail, captureLeadFromWhatsApp, captureLeadFromCall } from "./lead-capture";
export { getOverdueFollowUps, getStaleLeads, scheduleFollowUp, getFollowUpSummary, autoAssignLead } from "./follow-up-engine";
export { sendEmail, notifyAdminNewLead, sendAutoReplyEmail, getEmailRouting, EMAIL_ACCOUNTS } from "./email-service";
export { pollAllMailboxes } from "./imap-poller";
export { createLeadNotification, createOverdueNotifications, createStaleLeadNotifications } from "./notification-service";
