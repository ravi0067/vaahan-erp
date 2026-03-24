import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Ravi's notification email
const NOTIFY_EMAIL = 'raviverma0067@gmail.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, business, mobile, email, address } = body;

    if (!name || !mobile) {
      return NextResponse.json({ error: 'Name and mobile required' }, { status: 400 });
    }

    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'short',
    });

    // Log the lead (always works)
    console.log('🔔 NEW WEBSITE LEAD:', {
      name,
      business,
      mobile,
      email,
      address,
      timestamp,
      source: 'website-chatbot',
    });

    // Try to send email notification via multiple methods
    let emailSent = false;

    // Method 1: Use Resend if API key available
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'VaahanERP <noreply@vaahan-erp.vercel.app>',
            to: [NOTIFY_EMAIL],
            subject: `🔔 New Lead: ${name} (${business || 'N/A'}) — VaahanERP Website`,
            html: `
              <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;">
                <h2 style="color:#16a34a;">🔔 New Website Lead!</h2>
                <table style="width:100%;border-collapse:collapse;">
                  <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">👤 Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${name}</td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">🏢 Business</td><td style="padding:8px;border-bottom:1px solid #eee;">${business || 'Not specified'}</td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">📱 Mobile</td><td style="padding:8px;border-bottom:1px solid #eee;"><a href="tel:${mobile}">${mobile}</a></td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">📧 Email</td><td style="padding:8px;border-bottom:1px solid #eee;"><a href="mailto:${email}">${email || 'Not provided'}</a></td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">📍 Location</td><td style="padding:8px;border-bottom:1px solid #eee;">${address || 'Not provided'}</td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">🕐 Time</td><td style="padding:8px;border-bottom:1px solid #eee;">${timestamp}</td></tr>
                  <tr><td style="padding:8px;font-weight:bold;">📌 Source</td><td style="padding:8px;">Website Chatbot</td></tr>
                </table>
                <p style="margin-top:20px;color:#666;font-size:12px;">— VaahanERP Lead Capture Bot</p>
              </div>
            `,
          }),
        });
        emailSent = res.ok;
      } catch (e) {
        console.error('Resend email error:', e);
      }
    }

    // Method 2: Use Brevo/Sendinblue if available
    const brevoKey = process.env.BREVO_API_KEY;
    if (!emailSent && brevoKey) {
      try {
        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': brevoKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'VaahanERP', email: 'noreply@vaahan.com' },
            to: [{ email: NOTIFY_EMAIL }],
            subject: `🔔 New Lead: ${name} (${business || 'N/A'})`,
            htmlContent: `<p><b>Name:</b> ${name}<br><b>Business:</b> ${business}<br><b>Mobile:</b> ${mobile}<br><b>Email:</b> ${email}<br><b>Location:</b> ${address}<br><b>Time:</b> ${timestamp}</p>`,
          }),
        });
        emailSent = res.ok;
      } catch (e) {
        console.error('Brevo email error:', e);
      }
    }

    // Log whether email was sent
    if (emailSent) {
      console.log(`✅ Lead notification emailed to ${NOTIFY_EMAIL}`);
    } else {
      console.log(`⚠️ Email not configured. Lead saved to logs. Set RESEND_API_KEY or BREVO_API_KEY in Vercel env.`);
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you! Our team will contact you soon.',
      emailSent,
    });
  } catch (error) {
    console.error('Public lead capture error:', error);
    return NextResponse.json({ success: true }); // Don't expose errors to visitors
  }
}
