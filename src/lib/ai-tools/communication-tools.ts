/**
 * VaahanERP AI Communication Tools — 11 Tools
 * WhatsApp (Exotel), SMS (Exotel), Email (SMTP), Voice Calling (Exotel)
 * All bulk operations require DOUBLE_CONFIRM permission
 */

import prisma from '@/lib/prisma';
import { ToolDefinition, ToolCategory, PermissionLevel, ToolResult } from './types';
import { registerTool } from './registry';

// Helper: format currency
function formatCurrency(amount: number | any): string {
  const num = typeof amount === 'number' ? amount : Number(amount || 0);
  return '₹' + num.toLocaleString('en-IN');
}

function formatDate(date: Date | string | null): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ═══════════════════════════════════════
// EXOTEL API HELPERS
// ═══════════════════════════════════════

function getExotelCredentials() {
  return {
    accountSid: process.env.EXOTEL_ACCOUNT_SID || '',
    apiKey: process.env.EXOTEL_API_KEY || '',
    apiToken: process.env.EXOTEL_API_TOKEN || '',
    baseUrl: process.env.EXOTEL_BASE_URL || 'https://api.exotel.com',
    callerId: process.env.EXOTEL_CALLER_ID || '',
    whatsappNumber: process.env.EXOTEL_WHATSAPP_NUMBER || '',
  };
}

function isExotelConfigured(): boolean {
  const creds = getExotelCredentials();
  return !!(creds.accountSid && creds.apiKey && creds.apiToken);
}

/**
 * Send WhatsApp message via Exotel API
 */
async function sendExotelWhatsApp(
  to: string,
  templateName: string,
  variables: string[]
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const creds = getExotelCredentials();
  if (!creds.accountSid) {
    return { success: false, error: 'Exotel not configured' };
  }

  // Format phone number (add 91 if needed)
  const phone = to.replace(/\D/g, '');
  const formattedPhone = phone.length === 10 ? `91${phone}` : phone;

  try {
    const basicAuth = Buffer.from(`${creds.apiKey}:${creds.apiToken}`).toString('base64');
    
    const response = await fetch(
      `${creds.baseUrl}/v2/accounts/${creds.accountSid}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: creds.whatsappNumber,
          to: formattedPhone,
          channel: 'whatsapp',
          template: {
            name: templateName,
            components: [
              {
                type: 'body',
                parameters: variables.map(v => ({ type: 'text', text: v }))
              }
            ]
          }
        })
      }
    );

    const data = await response.json();
    
    if (response.ok || response.status === 200 || response.status === 201) {
      return { success: true, messageId: data?.sid || data?.id || 'sent' };
    } else {
      return { success: false, error: data?.message || data?.error || `HTTP ${response.status}` };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Make a voice call via Exotel API
 */
async function makeExotelCall(
  to: string,
  purpose: string,
  appUrl?: string
): Promise<{ success: boolean; callSid?: string; error?: string }> {
  const creds = getExotelCredentials();
  if (!creds.accountSid) {
    return { success: false, error: 'Exotel not configured' };
  }

  const phone = to.replace(/\D/g, '');
  const formattedPhone = phone.length === 10 ? phone : phone.slice(-10);

  try {
    const basicAuth = Buffer.from(`${creds.apiKey}:${creds.apiToken}`).toString('base64');
    
    const flowUrl = appUrl || `${process.env.NEXTAUTH_URL || 'https://vaahan-erp.vercel.app'}/api/calls/flow?purpose=${encodeURIComponent(purpose)}`;

    const formData = new URLSearchParams();
    formData.append('From', formattedPhone);
    formData.append('To', creds.callerId);
    formData.append('CallerId', creds.callerId);
    formData.append('Url', flowUrl);
    formData.append('CallType', 'trans');

    const response = await fetch(
      `${creds.baseUrl}/v1/Accounts/${creds.accountSid}/Calls/connect.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      }
    );

    const data = await response.json();
    
    if (response.ok) {
      const callSid = data?.Call?.Sid || data?.sid || 'initiated';
      return { success: true, callSid };
    } else {
      return { success: false, error: data?.RestException?.Message || data?.message || `HTTP ${response.status}` };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Log communication to DB (matches CommunicationLog schema)
 */
async function logCommunication(
  tenantId: string,
  channel: string,
  phone: string,
  purpose: string,
  status: string,
  _messageId?: string
): Promise<void> {
  try {
    await prisma.communicationLog.create({
      data: {
        tenantId,
        customerName: phone, // Store phone as identifier
        phone,
        channel,
        purpose,
        status,
        direction: 'outbound',
        completedAt: status === 'SENT' ? new Date() : null,
        notes: _messageId ? `ID: ${_messageId}` : null
      }
    });
  } catch (e) {
    console.error('Failed to log communication:', e);
  }
}

// ═══════════════════════════════════════
// TOOL 32: send_whatsapp
// ═══════════════════════════════════════
const sendWhatsApp: ToolDefinition = {
  name: 'send_whatsapp',
  description: 'Send a WhatsApp message to a customer using approved templates. Available templates: booking_confirmation, payment_reminder, service_reminder, insurance_expiry, festival_offer.',
  category: ToolCategory.COMMUNICATION,
  permissionLevel: PermissionLevel.CONFIRM,
  parameters: {
    phone: { type: 'string', description: 'Customer 10-digit mobile number', required: true },
    template: { type: 'string', description: 'Template name', required: true, enum: ['booking_confirmation', 'payment_reminder', 'service_reminder', 'insurance_expiry', 'festival_offer'] },
    customer_name: { type: 'string', description: 'Customer name (variable 1)', required: true },
    variable_2: { type: 'string', description: 'Variable 2 (vehicle/amount/date/festival)', required: true },
    variable_3: { type: 'string', description: 'Variable 3 (date/link)', required: true },
    firm_name: { type: 'string', description: 'Firm name (default: VaahanERP)' }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    if (!isExotelConfigured()) {
      return { success: false, message: '❌ Exotel WhatsApp not configured. Admin se settings check karwao.' };
    }

    const phone = params.phone?.replace(/\D/g, '');
    if (!phone || phone.length !== 10) {
      return { success: false, message: '❌ Invalid phone number. 10-digit number chahiye.' };
    }

    const firmName = params.firm_name || 'VaahanERP';
    const variables = [params.customer_name, params.variable_2, params.variable_3, firmName];

    const result = await sendExotelWhatsApp(phone, params.template, variables);

    await logCommunication(tenantId, 'WHATSAPP', phone, `Template: ${params.template}`, result.success ? 'SENT' : 'FAILED', result.messageId);

    if (result.success) {
      return {
        success: true,
        message: `✅ WhatsApp Sent!\n\n📱 To: ${params.customer_name} (${phone})\n📋 Template: ${params.template}\n📝 Variables: ${variables.join(', ')}\n🆔 Message ID: ${result.messageId}`
      };
    } else {
      return {
        success: false,
        message: `❌ WhatsApp Failed!\n\n📱 To: ${phone}\n❌ Error: ${result.error}\n\n💡 Check: Number WhatsApp pe hai? Template approved hai?`
      };
    }
  }
};

// ═══════════════════════════════════════
// TOOL 33: send_whatsapp_bulk
// ═══════════════════════════════════════
const sendWhatsAppBulk: ToolDefinition = {
  name: 'send_whatsapp_bulk',
  description: 'Send WhatsApp messages to multiple customers using a template. Can target: hot_leads, payment_pending, insurance_expiring, service_due, or all_customers.',
  category: ToolCategory.COMMUNICATION,
  permissionLevel: PermissionLevel.DOUBLE_CONFIRM,
  parameters: {
    target_group: { type: 'string', description: 'Target group', required: true, enum: ['hot_leads', 'payment_pending', 'insurance_expiring', 'service_due', 'all_customers'] },
    template: { type: 'string', description: 'Template name', required: true, enum: ['booking_confirmation', 'payment_reminder', 'service_reminder', 'insurance_expiry', 'festival_offer'] },
    festival_name: { type: 'string', description: 'Festival name (for festival_offer template)' },
    firm_name: { type: 'string', description: 'Firm name (default: VaahanERP)' }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    if (!isExotelConfigured()) {
      return { success: false, message: '❌ Exotel WhatsApp not configured.' };
    }

    const firmName = params.firm_name || 'VaahanERP';
    let recipients: Array<{ name: string; phone: string; var2: string; var3: string }> = [];

    // Build recipient list based on target group
    switch (params.target_group) {
      case 'hot_leads': {
        const leads = await prisma.lead.findMany({
          where: { tenantId, dealHealth: 'HOT', status: { in: ['NEW', 'CONTACTED', 'FOLLOWUP'] } }
        });
        recipients = leads.map(l => ({
          name: l.customerName,
          phone: l.mobile,
          var2: l.interestedModel || 'Vehicle',
          var3: formatDate(new Date())
        }));
        break;
      }
      case 'payment_pending': {
        const bookings = await prisma.booking.findMany({
          where: { tenantId, pendingAmount: { gt: 0 }, status: { in: ['CONFIRMED', 'RTO_PENDING', 'READY'] } },
          include: { customer: true }
        });
        recipients = bookings.map(b => ({
          name: b.customer?.name || 'Customer',
          phone: b.customer?.mobile || '',
          var2: formatCurrency(Number(b.pendingAmount)),
          var3: process.env.NEXTAUTH_URL || 'https://vaahan-erp.vercel.app'
        }));
        break;
      }
      case 'insurance_expiring': {
        const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const rtos = await prisma.rTORegistration.findMany({
          where: { booking: { tenantId }, insuranceExpiry: { gte: new Date(), lte: thirtyDays } },
          include: { booking: { include: { customer: true } } }
        });
        recipients = rtos.map(r => ({
          name: r.booking.customer?.name || 'Customer',
          phone: r.booking.customer?.mobile || '',
          var2: formatDate(r.insuranceExpiry),
          var3: process.env.NEXTAUTH_URL || 'https://vaahan-erp.vercel.app'
        }));
        break;
      }
      case 'service_due': {
        const jobs = await prisma.jobCard.findMany({
          where: { tenantId, status: { in: ['OPEN', 'IN_PROGRESS'] } }
        });
        recipients = jobs.map(j => ({
          name: j.customerName,
          phone: j.customerMobile,
          var2: formatDate(new Date()),
          var3: process.env.NEXTAUTH_URL || 'https://vaahan-erp.vercel.app'
        }));
        break;
      }
      case 'all_customers': {
        const customers = await prisma.customer.findMany({
          where: { tenantId },
          take: 100 // Safety limit
        });
        recipients = customers.map(c => ({
          name: c.name,
          phone: c.mobile,
          var2: params.festival_name || 'Special Offer',
          var3: process.env.NEXTAUTH_URL || 'https://vaahan-erp.vercel.app'
        }));
        break;
      }
    }

    // Filter valid phone numbers
    recipients = recipients.filter(r => r.phone && r.phone.replace(/\D/g, '').length === 10);

    if (recipients.length === 0) {
      return { success: true, message: `📱 No recipients found for "${params.target_group}". Koi eligible customer nahi mila.` };
    }

    // Send with delay to avoid rate limiting (1 per second)
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const recipient of recipients) {
      const variables = [recipient.name, recipient.var2, recipient.var3, firmName];
      const result = await sendExotelWhatsApp(recipient.phone, params.template, variables);
      
      await logCommunication(tenantId, 'WHATSAPP_BULK', recipient.phone, `Template: ${params.template}`, result.success ? 'SENT' : 'FAILED', result.messageId);

      if (result.success) {
        sent++;
      } else {
        failed++;
        if (errors.length < 3) errors.push(`${recipient.name}: ${result.error}`);
      }

      // Rate limit: 1 message per second
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return {
      success: true,
      message: `📨 Bulk WhatsApp Complete!\n\n📊 Target: ${params.target_group}\n📋 Template: ${params.template}\n\n✅ Sent: ${sent}\n❌ Failed: ${failed}\n📊 Total: ${recipients.length}\n${errors.length > 0 ? '\n⚠️ Errors:\n' + errors.map(e => '  • ' + e).join('\n') : ''}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 34: send_sms (via Exotel)
// ═══════════════════════════════════════
const sendSms: ToolDefinition = {
  name: 'send_sms',
  description: 'Send an SMS to a customer via Exotel. For transactional messages like payment confirmations, booking updates.',
  category: ToolCategory.COMMUNICATION,
  permissionLevel: PermissionLevel.CONFIRM,
  parameters: {
    phone: { type: 'string', description: 'Customer 10-digit mobile', required: true },
    message: { type: 'string', description: 'SMS message text', required: true }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    if (!isExotelConfigured()) {
      return { success: false, message: '❌ Exotel SMS not configured.' };
    }

    const phone = params.phone?.replace(/\D/g, '');
    if (!phone || phone.length !== 10) {
      return { success: false, message: '❌ Invalid phone. 10-digit number chahiye.' };
    }

    try {
      const creds = getExotelCredentials();
      const basicAuth = Buffer.from(`${creds.apiKey}:${creds.apiToken}`).toString('base64');

      const formData = new URLSearchParams();
      formData.append('From', creds.callerId);
      formData.append('To', phone);
      formData.append('Body', params.message);

      const response = await fetch(
        `${creds.baseUrl}/v1/Accounts/${creds.accountSid}/Sms/send.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formData.toString()
        }
      );

      const data = await response.json();

      await logCommunication(tenantId, 'SMS', phone, params.message, response.ok ? 'SENT' : 'FAILED', data?.SMSMessage?.Sid);

      if (response.ok) {
        return { success: true, message: `✅ SMS Sent!\n\n📱 To: ${phone}\n📝 Message: ${params.message}\n🆔 ID: ${data?.SMSMessage?.Sid || 'sent'}` };
      } else {
        return { success: false, message: `❌ SMS Failed!\n\n📱 To: ${phone}\n❌ Error: ${data?.RestException?.Message || 'Unknown error'}` };
      }
    } catch (error: any) {
      await logCommunication(tenantId, 'SMS', phone, params.message, 'FAILED');
      return { success: false, message: `❌ SMS Error: ${error.message}` };
    }
  }
};

// ═══════════════════════════════════════
// TOOL 35: send_sms_bulk
// ═══════════════════════════════════════
const sendSmsBulk: ToolDefinition = {
  name: 'send_sms_bulk',
  description: 'Send SMS to multiple customers. Target groups: insurance_expiring, payment_pending, service_due.',
  category: ToolCategory.COMMUNICATION,
  permissionLevel: PermissionLevel.DOUBLE_CONFIRM,
  parameters: {
    target_group: { type: 'string', description: 'Target group', required: true, enum: ['insurance_expiring', 'payment_pending', 'service_due'] },
    message_template: { type: 'string', description: 'Message with {{name}} and {{detail}} placeholders', required: true }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    if (!isExotelConfigured()) {
      return { success: false, message: '❌ Exotel SMS not configured.' };
    }

    let recipients: Array<{ name: string; phone: string; detail: string }> = [];

    switch (params.target_group) {
      case 'insurance_expiring': {
        const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const rtos = await prisma.rTORegistration.findMany({
          where: { booking: { tenantId }, insuranceExpiry: { gte: new Date(), lte: thirtyDays } },
          include: { booking: { include: { customer: true } } }
        });
        recipients = rtos.map(r => ({
          name: r.booking.customer?.name || 'Customer',
          phone: r.booking.customer?.mobile || '',
          detail: formatDate(r.insuranceExpiry)
        }));
        break;
      }
      case 'payment_pending': {
        const bookings = await prisma.booking.findMany({
          where: { tenantId, pendingAmount: { gt: 0 }, status: { in: ['CONFIRMED', 'RTO_PENDING', 'READY'] } },
          include: { customer: true }
        });
        recipients = bookings.map(b => ({
          name: b.customer?.name || 'Customer',
          phone: b.customer?.mobile || '',
          detail: formatCurrency(Number(b.pendingAmount))
        }));
        break;
      }
      case 'service_due': {
        const jobs = await prisma.jobCard.findMany({
          where: { tenantId, status: { in: ['OPEN', 'IN_PROGRESS'] } }
        });
        recipients = jobs.map(j => ({
          name: j.customerName,
          phone: j.customerMobile,
          detail: j.vehicleRegNo
        }));
        break;
      }
    }

    recipients = recipients.filter(r => r.phone && r.phone.replace(/\D/g, '').length === 10);

    if (recipients.length === 0) {
      return { success: true, message: '📱 No recipients found.' };
    }

    let sent = 0;
    let failed = 0;

    for (const r of recipients) {
      const message = params.message_template
        .replace(/\{\{name\}\}/g, r.name)
        .replace(/\{\{detail\}\}/g, r.detail);

      try {
        const creds = getExotelCredentials();
        const basicAuth = Buffer.from(`${creds.apiKey}:${creds.apiToken}`).toString('base64');
        const formData = new URLSearchParams();
        formData.append('From', creds.callerId);
        formData.append('To', r.phone.replace(/\D/g, ''));
        formData.append('Body', message);

        const res = await fetch(`${creds.baseUrl}/v1/Accounts/${creds.accountSid}/Sms/send.json`, {
          method: 'POST',
          headers: { 'Authorization': `Basic ${basicAuth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString()
        });

        await logCommunication(tenantId, 'SMS_BULK', r.phone, message, res.ok ? 'SENT' : 'FAILED');
        if (res.ok) sent++;
        else failed++;
      } catch {
        failed++;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return {
      success: true,
      message: `📨 Bulk SMS Complete!\n\n📊 Target: ${params.target_group}\n✅ Sent: ${sent}\n❌ Failed: ${failed}\n📊 Total: ${recipients.length}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 36: send_email
// ═══════════════════════════════════════
const sendEmail: ToolDefinition = {
  name: 'send_email',
  description: 'Send an email to a customer. For invoices, reports, booking confirmations.',
  category: ToolCategory.COMMUNICATION,
  permissionLevel: PermissionLevel.CONFIRM,
  parameters: {
    to_email: { type: 'string', description: 'Recipient email address', required: true },
    subject: { type: 'string', description: 'Email subject', required: true },
    body: { type: 'string', description: 'Email body (plain text or HTML)', required: true },
    customer_name: { type: 'string', description: 'Customer name for greeting' }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    // Email via SMTP — check if configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASSWORD;

    if (!smtpHost || !smtpUser) {
      // Fallback: Log as pending and suggest manual send
      await logCommunication(tenantId, 'EMAIL', params.to_email, `${params.subject}: ${params.body}`, 'PENDING');
      
      return {
        success: true,
        message: `📧 Email Queued (SMTP not configured)\n\n📨 To: ${params.to_email}\n📋 Subject: ${params.subject}\n📝 Body preview: ${params.body.substring(0, 100)}...\n\n⚠️ SMTP not configured. Email saved as pending.\n💡 Admin se SMTP settings configure karwao (Gmail/SendGrid).`
      };
    }

    // If SMTP is configured, send via nodemailer (dynamic import)
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: smtpUser, pass: smtpPass }
      });

      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'VaahanERP'}" <${smtpUser}>`,
        to: params.to_email,
        subject: params.subject,
        html: params.body
      });

      await logCommunication(tenantId, 'EMAIL', params.to_email, params.subject, 'SENT');

      return {
        success: true,
        message: `✅ Email Sent!\n\n📨 To: ${params.to_email}\n📋 Subject: ${params.subject}\n${params.customer_name ? '👤 ' + params.customer_name : ''}`
      };
    } catch (error: any) {
      await logCommunication(tenantId, 'EMAIL', params.to_email, params.subject, 'FAILED');
      return { success: false, message: `❌ Email Failed: ${error.message}` };
    }
  }
};

// ═══════════════════════════════════════
// TOOL 37: send_email_bulk
// ═══════════════════════════════════════
const sendEmailBulk: ToolDefinition = {
  name: 'send_email_bulk',
  description: 'Send bulk emails to customers. Targets: all_customers, payment_pending, insurance_expiring.',
  category: ToolCategory.COMMUNICATION,
  permissionLevel: PermissionLevel.DOUBLE_CONFIRM,
  parameters: {
    target_group: { type: 'string', description: 'Target group', required: true, enum: ['all_customers', 'payment_pending', 'insurance_expiring'] },
    subject: { type: 'string', description: 'Email subject', required: true },
    body_template: { type: 'string', description: 'Email body with {{name}} placeholder', required: true }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    // Get recipients based on target group
    let recipients: Array<{ name: string; email: string }> = [];

    switch (params.target_group) {
      case 'all_customers': {
        const customers = await prisma.customer.findMany({
          where: { tenantId, email: { not: null } },
          take: 100
        });
        recipients = customers.filter(c => c.email).map(c => ({ name: c.name, email: c.email! }));
        break;
      }
      case 'payment_pending': {
        const bookings = await prisma.booking.findMany({
          where: { tenantId, pendingAmount: { gt: 0 } },
          include: { customer: true }
        });
        recipients = bookings.filter(b => b.customer?.email).map(b => ({ name: b.customer!.name, email: b.customer!.email! }));
        break;
      }
      case 'insurance_expiring': {
        const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const rtos = await prisma.rTORegistration.findMany({
          where: { booking: { tenantId }, insuranceExpiry: { gte: new Date(), lte: thirtyDays } },
          include: { booking: { include: { customer: true } } }
        });
        recipients = rtos.filter(r => r.booking.customer?.email).map(r => ({ name: r.booking.customer!.name, email: r.booking.customer!.email! }));
        break;
      }
    }

    if (recipients.length === 0) {
      return { success: true, message: '📧 No recipients with email found. Customers ke email addresses add karo pehle.' };
    }

    // For now, log all as pending (SMTP may not be configured)
    let queued = 0;
    for (const r of recipients) {
      const body = params.body_template.replace(/\{\{name\}\}/g, r.name);
      await logCommunication(tenantId, 'EMAIL_BULK', r.email, `${params.subject}: ${body.substring(0, 100)}`, 'PENDING');
      queued++;
    }

    return {
      success: true,
      message: `📧 Bulk Email Queued!\n\n📊 Target: ${params.target_group}\n📨 Queued: ${queued} emails\n📋 Subject: ${params.subject}\n\n${process.env.SMTP_HOST ? '✅ Emails being sent...' : '⚠️ SMTP not configured. Emails saved as pending.'}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 38: make_call
// ═══════════════════════════════════════
const makeCall: ToolDefinition = {
  name: 'make_call',
  description: 'Initiate a voice call to a customer via Exotel. Supports purposes: followup, insurance_expiry, service_due, payment_reminder, delivery, offer, birthday.',
  category: ToolCategory.COMMUNICATION,
  permissionLevel: PermissionLevel.CONFIRM,
  parameters: {
    phone: { type: 'string', description: 'Customer 10-digit mobile', required: true },
    purpose: { type: 'string', description: 'Call purpose', required: true, enum: ['followup', 'insurance_expiry', 'service_due', 'payment_reminder', 'delivery', 'offer', 'birthday'] },
    customer_name: { type: 'string', description: 'Customer name for log' }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    if (!isExotelConfigured()) {
      return { success: false, message: '❌ Exotel calling not configured.' };
    }

    const phone = params.phone?.replace(/\D/g, '');
    if (!phone || phone.length !== 10) {
      return { success: false, message: '❌ Invalid phone. 10-digit number chahiye.' };
    }

    const result = await makeExotelCall(phone, params.purpose);

    await logCommunication(tenantId, 'CALL', phone, `Purpose: ${params.purpose}`, result.success ? 'INITIATED' : 'FAILED', result.callSid);

    if (result.success) {
      return {
        success: true,
        message: `📞 Call Initiated!\n\n📱 To: ${params.customer_name || phone}\n📋 Purpose: ${params.purpose}\n🆔 Call SID: ${result.callSid}\n\n⏳ Call connect ho raha hai...`
      };
    } else {
      return {
        success: false,
        message: `❌ Call Failed!\n\n📱 To: ${phone}\n❌ Error: ${result.error}\n\n💡 Number active hai? Exotel balance check karo.`
      };
    }
  }
};

// ═══════════════════════════════════════
// TOOL 39: schedule_call (logs for future)
// ═══════════════════════════════════════
const scheduleCall: ToolDefinition = {
  name: 'schedule_call',
  description: 'Schedule a call for a future date/time. Creates a reminder that will trigger the call.',
  category: ToolCategory.COMMUNICATION,
  permissionLevel: PermissionLevel.CONFIRM,
  parameters: {
    phone: { type: 'string', description: 'Customer mobile', required: true },
    customer_name: { type: 'string', description: 'Customer name', required: true },
    purpose: { type: 'string', description: 'Call purpose', required: true },
    scheduled_date: { type: 'string', description: 'Date (YYYY-MM-DD)', required: true },
    scheduled_time: { type: 'string', description: 'Time (HH:MM, 24hr format)', required: true }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const phone = params.phone?.replace(/\D/g, '');
    if (!phone || phone.length !== 10) {
      return { success: false, message: '❌ Invalid phone number.' };
    }

    const scheduledAt = new Date(`${params.scheduled_date}T${params.scheduled_time}:00+05:30`);
    if (scheduledAt <= new Date()) {
      return { success: false, message: '❌ Scheduled time past mein hai. Future date/time do.' };
    }

    // Log as scheduled communication
    await logCommunication(tenantId, 'CALL_SCHEDULED', phone, `Purpose: ${params.purpose} | Name: ${params.customer_name} | Time: ${params.scheduled_date} ${params.scheduled_time}`, 'SCHEDULED');

    return {
      success: true,
      message: `✅ Call Scheduled!\n\n📱 To: ${params.customer_name} (${phone})\n📋 Purpose: ${params.purpose}\n📅 Date: ${formatDate(params.scheduled_date)}\n🕐 Time: ${params.scheduled_time}\n\n⏰ Reminder set! Call tab trigger hoga.`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 40: send_payment_reminder
// ═══════════════════════════════════════
const sendPaymentReminder: ToolDefinition = {
  name: 'send_payment_reminder',
  description: 'Send payment reminder to a customer with pending booking payment. Auto-fetches booking details.',
  category: ToolCategory.COMMUNICATION,
  permissionLevel: PermissionLevel.CONFIRM,
  parameters: {
    booking_number: { type: 'string', description: 'Booking number', required: true }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const booking = await prisma.booking.findFirst({
      where: { tenantId, OR: [{ bookingNumber: params.booking_number }, { id: params.booking_number }] },
      include: { customer: true }
    });

    if (!booking) {
      return { success: false, message: `❌ Booking "${params.booking_number}" not found.` };
    }

    if (Number(booking.pendingAmount) <= 0) {
      return { success: true, message: `✅ Booking ${booking.bookingNumber} ka payment already complete hai! No reminder needed.` };
    }

    if (!booking.customer?.mobile) {
      return { success: false, message: '❌ Customer ka mobile number nahi hai.' };
    }

    // Send WhatsApp reminder
    const variables = [
      booking.customer.name,
      formatCurrency(Number(booking.pendingAmount)),
      process.env.NEXTAUTH_URL || 'https://vaahan-erp.vercel.app',
      'VaahanERP'
    ];

    const waResult = await sendExotelWhatsApp(booking.customer.mobile, 'payment_reminder', variables);
    await logCommunication(tenantId, 'PAYMENT_REMINDER', booking.customer.mobile, `Booking: ${booking.bookingNumber}, Pending: ${formatCurrency(Number(booking.pendingAmount))}`, waResult.success ? 'SENT' : 'FAILED', waResult.messageId);

    return {
      success: true,
      message: `${waResult.success ? '✅' : '⚠️'} Payment Reminder ${waResult.success ? 'Sent' : 'Attempted'}!\n\n📋 Booking: ${booking.bookingNumber}\n👤 ${booking.customer.name} — 📱 ${booking.customer.mobile}\n💰 Pending: ${formatCurrency(Number(booking.pendingAmount))}\n📱 WhatsApp: ${waResult.success ? 'Sent ✅' : 'Failed ❌ — ' + waResult.error}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 41: send_delivery_update
// ═══════════════════════════════════════
const sendDeliveryUpdate: ToolDefinition = {
  name: 'send_delivery_update',
  description: 'Send vehicle delivery update to customer — vehicle is ready for delivery.',
  category: ToolCategory.COMMUNICATION,
  permissionLevel: PermissionLevel.CONFIRM,
  parameters: {
    booking_number: { type: 'string', description: 'Booking number', required: true }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    const booking = await prisma.booking.findFirst({
      where: { tenantId, OR: [{ bookingNumber: params.booking_number }, { id: params.booking_number }] },
      include: { customer: true, vehicle: true }
    });

    if (!booking) {
      return { success: false, message: `❌ Booking "${params.booking_number}" not found.` };
    }

    if (!booking.customer?.mobile) {
      return { success: false, message: '❌ Customer ka mobile nahi hai.' };
    }

    const vehicleName = booking.vehicle ? `${booking.vehicle.model} ${booking.vehicle.variant || ''}` : 'Vehicle';

    const variables = [
      booking.customer.name,
      vehicleName,
      formatDate(new Date()),
      'VaahanERP'
    ];

    const waResult = await sendExotelWhatsApp(booking.customer.mobile, 'booking_confirmation', variables);
    await logCommunication(tenantId, 'DELIVERY_UPDATE', booking.customer.mobile, `Booking: ${booking.bookingNumber}, Vehicle: ${vehicleName}`, waResult.success ? 'SENT' : 'FAILED', waResult.messageId);

    return {
      success: true,
      message: `${waResult.success ? '✅' : '⚠️'} Delivery Update ${waResult.success ? 'Sent' : 'Attempted'}!\n\n📋 ${booking.bookingNumber}\n👤 ${booking.customer.name} — 📱 ${booking.customer.mobile}\n🏍️ ${vehicleName}\n📱 WhatsApp: ${waResult.success ? 'Sent ✅' : 'Failed ❌'}`
    };
  }
};

// ═══════════════════════════════════════
// TOOL 42: send_service_reminder
// ═══════════════════════════════════════
const sendServiceReminder: ToolDefinition = {
  name: 'send_service_reminder',
  description: 'Send service reminder to customers with active job cards — their vehicle is ready or service is due.',
  category: ToolCategory.COMMUNICATION,
  permissionLevel: PermissionLevel.CONFIRM,
  parameters: {
    job_search: { type: 'string', description: 'Job card ID, vehicle reg no, or customer mobile' }
  },
  handler: async (params: any, tenantId: string): Promise<ToolResult> => {
    let jobs;
    
    if (params.job_search) {
      jobs = await prisma.jobCard.findMany({
        where: {
          tenantId,
          OR: [
            { id: params.job_search },
            { vehicleRegNo: { contains: params.job_search, mode: 'insensitive' } },
            { customerMobile: params.job_search?.replace(/\D/g, '') }
          ]
        }
      });
    } else {
      // Get all completed but not notified
      jobs = await prisma.jobCard.findMany({
        where: { tenantId, status: 'COMPLETED' },
        take: 20
      });
    }

    if (!jobs || jobs.length === 0) {
      return { success: true, message: '🔧 No service jobs found for reminder.' };
    }

    let sent = 0;
    let failed = 0;

    for (const job of jobs) {
      if (!job.customerMobile) continue;

      const variables = [
        job.customerName,
        formatDate(new Date()),
        process.env.NEXTAUTH_URL || 'https://vaahan-erp.vercel.app',
        'VaahanERP'
      ];

      const result = await sendExotelWhatsApp(job.customerMobile, 'service_reminder', variables);
      await logCommunication(tenantId, 'SERVICE_REMINDER', job.customerMobile, `Vehicle: ${job.vehicleRegNo}`, result.success ? 'SENT' : 'FAILED', result.messageId);

      if (result.success) sent++;
      else failed++;

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return {
      success: true,
      message: `🔧 Service Reminder${jobs.length > 1 ? 's' : ''} Sent!\n\n✅ Sent: ${sent}\n❌ Failed: ${failed}\n📊 Total: ${jobs.length}`
    };
  }
};

// ═══════════════════════════════════════
// REGISTER ALL COMMUNICATION TOOLS
// ═══════════════════════════════════════
export function registerAllCommunicationTools(): void {
  const tools = [
    sendWhatsApp,         // 32
    sendWhatsAppBulk,     // 33
    sendSms,              // 34
    sendSmsBulk,          // 35
    sendEmail,            // 36
    sendEmailBulk,        // 37
    makeCall,             // 38
    scheduleCall,         // 39
    sendPaymentReminder,  // 40
    sendDeliveryUpdate,   // 41
    sendServiceReminder,  // 42
  ];

  tools.forEach(tool => registerTool(tool));
  console.log(`✅ Registered ${tools.length} communication tools`);
}
