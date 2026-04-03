/**
 * Auto-Responder — Generates auto-reply messages for leads
 */
import { Classification } from "./classifier";

export function getEmailAutoReply(leadName: string, classification: Classification): string {
  const name = leadName || "Customer";
  const typeResponses: Record<string, string> = {
    sales: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7c3aed, #6d28d9); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🏍️ VaahanERP</h1>
          <p style="color: #e9d5ff; margin: 5px 0 0;">Your Dealership Partner</p>
        </div>
        <div style="background: white; padding: 25px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 16px; color: #374151;">Namaste <strong>${name} ji</strong>! 🙏</p>
          <p style="color: #4b5563;">Aapka enquiry humein mil gaya hai. Humari sales team jaldi se jaldi aapko contact karegi.</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">📋 <strong>Aapki Inquiry:</strong> Sales / Vehicle Inquiry</p>
            <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">⏰ <strong>Expected Response:</strong> 2-4 hours mein</p>
          </div>
          <p style="color: #4b5563;">Agar urgent hai toh directly call karein:</p>
          <p style="font-size: 18px; color: #7c3aed; font-weight: bold;">📞 +91 9554762008</p>
          <p style="color: #9ca3af; font-size: 13px;">📧 support@vaahanerp.com</p>
        </div>
        <div style="background: #f9fafb; padding: 15px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">© 2026 VaahanERP — Powered by Ravi Accounting Services</p>
        </div>
      </div>`,
    support: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669, #047857); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🔧 VaahanERP Support</h1>
        </div>
        <div style="background: white; padding: 25px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 16px; color: #374151;">Namaste <strong>${name} ji</strong>! 🙏</p>
          <p style="color: #4b5563;">Aapki service/support request humein mil gayi hai. Humari service team jald respond karegi.</p>
          <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 0; color: #166534; font-size: 14px;">🔧 <strong>Request Type:</strong> Service / Support</p>
            <p style="margin: 5px 0 0; color: #166534; font-size: 14px;">⏰ <strong>Response Time:</strong> 4-6 hours mein</p>
          </div>
          <p style="color: #4b5563;">Emergency service ke liye call karein: <strong style="color: #059669;">📞 +91 9554762008</strong></p>
        </div>
        <div style="background: #f9fafb; padding: 15px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">© 2026 VaahanERP — Powered by Ravi Accounting Services</p>
        </div>
      </div>`,
    admin: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #d97706, #b45309); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📋 VaahanERP</h1>
        </div>
        <div style="background: white; padding: 25px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 16px; color: #374151;">Namaste <strong>${name} ji</strong>! 🙏</p>
          <p style="color: #4b5563;">Aapka admin/billing request mil gaya hai. Humari accounts team dekhegi aur jald respond karegi.</p>
          <p style="color: #4b5563;">Documents ya invoices ke liye: <strong>admin@vaahanerp.com</strong></p>
        </div>
        <div style="background: #f9fafb; padding: 15px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">© 2026 VaahanERP</p>
        </div>
      </div>`,
  };

  return typeResponses[classification.type] || typeResponses.sales;
}

export function getWhatsAppAutoReply(leadName: string, classification: Classification): string {
  const name = leadName || "Customer";

  if (classification.type === "sales") {
    return `🙏 Namaste ${name} ji! VaahanERP mein aapka swagat hai!

Aapki inquiry mil gayi hai. Humari sales team jaldi aapko call karegi.

Abhi kya chahiye aapko?
1️⃣ Vehicle Price List
2️⃣ Test Drive Book Karein
3️⃣ EMI Calculator
4️⃣ Exchange Offer
5️⃣ Kisi Se Baat Karein

Koi bhi number reply karein ya apna sawaal likhein! 🏍️

📞 Direct Call: +91 9554762008
🌐 Website: www.vaahanerp.com`;
  }

  if (classification.type === "support") {
    return `🔧 Namaste ${name} ji!

Aapki service request mil gayi hai. Humari service team jald respond karegi.

Quick Options:
1️⃣ Service Booking
2️⃣ Complaint Register
3️⃣ Warranty Check
4️⃣ Pickup/Drop Service
5️⃣ Service Manager Se Baat

Reply karein ya call karein: 📞 +91 9554762008`;
  }

  if (classification.type === "admin") {
    return `📋 Namaste ${name} ji!

Aapka request humari admin team ko forward kar diya hai.

Documents/invoices ke liye:
📧 admin@vaahanerp.com
📞 +91 9554762008`;
  }

  return `🙏 Namaste ${name} ji! VaahanERP mein aapka swagat hai!

Aapka message mil gaya hai. Hum jaldi respond karenge.

📞 Call: +91 9554762008
📧 Email: support@vaahanerp.com`;
}

export function getCallMissedReply(leadName: string): string {
  const name = leadName || "Customer";
  return `🙏 Namaste ${name} ji!

Aapka call aaya tha lekin hum pick nahi kar paaye. Sorry! 🙁

Hum aapko jaldi call back karenge. Ya aap dubara try karein:
📞 +91 9554762008

Ya WhatsApp par message karein — hum turant reply denge! 💬

— VaahanERP Team`;
}

export function getNewLeadAdminNotification(lead: {
  name: string;
  phone?: string;
  email?: string;
  source: string;
  type: string;
  message?: string;
}): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 20px;">
      <h2 style="color: #7c3aed;">🔔 New Lead Alert — VaahanERP</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; color: #6b7280;">👤 Name:</td><td style="padding: 8px; font-weight: bold;">${lead.name}</td></tr>
        <tr><td style="padding: 8px; color: #6b7280;">📞 Phone:</td><td style="padding: 8px;">${lead.phone || "N/A"}</td></tr>
        <tr><td style="padding: 8px; color: #6b7280;">📧 Email:</td><td style="padding: 8px;">${lead.email || "N/A"}</td></tr>
        <tr><td style="padding: 8px; color: #6b7280;">📌 Source:</td><td style="padding: 8px;">${lead.source.toUpperCase()}</td></tr>
        <tr><td style="padding: 8px; color: #6b7280;">🏷️ Type:</td><td style="padding: 8px;">${lead.type}</td></tr>
        ${lead.message ? `<tr><td style="padding: 8px; color: #6b7280;">💬 Message:</td><td style="padding: 8px;">${lead.message.substring(0, 200)}</td></tr>` : ""}
      </table>
      <p style="margin-top: 15px;"><a href="https://www.vaahanerp.com/leads" style="background: #7c3aed; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">View in Dashboard →</a></p>
    </div>`;
}
