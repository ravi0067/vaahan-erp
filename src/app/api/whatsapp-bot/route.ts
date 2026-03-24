import { NextRequest, NextResponse } from 'next/server';
import { getSystemPrompt } from '@/lib/ai-system-prompt';

export const dynamic = 'force-dynamic';

// This endpoint handles incoming WhatsApp messages
// In production, this would be called by WhatsApp Business API webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from, message, contacts } = body;
    
    // Clean phone number
    const phone = from?.replace(/\D/g, "").slice(-10);
    
    if (!phone || !message) {
      return NextResponse.json({ error: "Missing phone or message" }, { status: 400 });
    }
    
    // Find role from contacts list (passed from frontend config)
    // In production, this would query the database
    const contact = contacts?.find((c: any) => c.phone === phone && c.isActive);
    const role = contact?.role || "UNKNOWN";
    
    if (role === "UNKNOWN") {
      return NextResponse.json({
        reply: "🙏 Namaste! Yeh VaahanERP ka official bot hai. Aapka number registered nahi hai. Kripya apne dealership owner se sampark karein registration ke liye.",
        role: "UNKNOWN"
      });
    }
    
    // Get role-appropriate system prompt
    const systemPrompt = getSystemPrompt(role, contact?.dealershipName || 'VaahanERP', 'BIKE');
    
    // Try Gemini API if key available
    const geminiKey = process.env.GEMINI_API_KEY;
    
    if (geminiKey) {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: message }] }]
          })
        }
      );
      
      const data = await geminiRes.json();
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return NextResponse.json({
          reply: data.candidates[0].content.parts[0].text,
          role,
          name: contact?.name
        });
      }
    }
    
    // Fallback response based on role
    const roleResponses: Record<string, string> = {
      OWNER: `👑 Namaste ${contact?.name || 'Boss'}! Main VaahanERP AI hoon. Aap Owner hain — poora dealership data aapke access mein hai. Puchiye kya jaanna hai: sales, leads, cashflow, reports, ya kuch aur?`,
      MANAGER: `🧑‍💼 Namaste ${contact?.name || ''}! Main VaahanERP AI hoon. Aap Manager hain — bookings, leads, stock, service sab check kar sakte hain. Kya help chahiye?`,
      SERVICE_MANAGER: `🔧 Namaste ${contact?.name || ''}! Main VaahanERP AI hoon. Aap Service Manager hain — service jobs, mechanic status, parts sab dekh sakte hain. Kya jaanna hai?`,
      SALES_EXEC: `💼 Namaste ${contact?.name || ''}! Main VaahanERP AI hoon. Aap Sales team mein hain — leads, bookings, stock check kar sakte hain. Kaise madad karun?`,
      ACCOUNTANT: `🧮 Namaste ${contact?.name || ''}! Main VaahanERP AI hoon. Aap Accountant hain — cashflow, expenses, reports dekh sakte hain. Kya chahiye?`,
    };
    
    return NextResponse.json({
      reply: roleResponses[role] || "🤖 Namaste! Main VaahanERP AI hoon. Kaise madad karun?",
      role,
      name: contact?.name
    });
    
  } catch (err: any) {
    console.error('WhatsApp Bot Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
