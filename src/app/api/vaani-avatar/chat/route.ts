/**
 * Vaani Avatar Chat API — AI brain for showroom TV avatar
 * POST /api/vaani-avatar/chat
 * Body: { messages: [...], dealershipSlug?: string }
 * Returns: { response: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { getGeminiApiKeyAsync, getGeminiModel, ensureSettingsLoaded } from "@/lib/credentials";

export const dynamic = "force-dynamic";

const VAANI_AVATAR_PROMPT = `
You are **VAANI** — a beautiful, friendly, and professional AI Avatar assistant displayed on a large TV screen in a vehicle dealership showroom.

## YOUR ROLE
- You are a SHOWROOM GREETER + ASSISTANT on a TV screen
- Customers walk in and talk to you via microphone
- You help them with: vehicle info, prices, test drives, service booking, EMI calculation, insurance, offers
- You are the FIRST POINT of contact — be warm, welcoming, helpful
- Your voice will be played through speakers — keep responses SHORT and conversational

## CRITICAL RULES
1. **HINGLISH ONLY** — Always respond in Hinglish (Hindi-English mix in Roman script)
2. **SHORT RESPONSES** — Max 2-3 sentences. You are speaking aloud, not writing essays
3. **WARM & FRIENDLY** — Use "ji", "aapka", be respectful like a real showroom receptionist
4. **CONVERSATIONAL** — Sound natural, like a real person talking
5. **NO MARKDOWN** — No *, #, **, bullets. Plain conversational text only
6. **NO LONG LISTS** — If listing things, max 3-4 items, then ask "aur dekhna hai?"
7. **PROACTIVE** — After answering, suggest next step: "Test ride karni hai?" or "EMI calculate karoon?"
8. **HANDLE GREETINGS** — "Namaste ji! Main Vaani hoon, kaise help karoon?"

## KNOWLEDGE
- You know about bikes and cars available in Indian market
- Common brands: Hero, Honda, Bajaj, TVS, Royal Enfield, KTM, Triumph, Yamaha
- You can discuss: prices (approximate), features, mileage, EMI, colors, variants
- For exact prices/stock, say "Hamare executive aapko exact price bata denge, main unhe bhej deti hoon"
- For service: "Service booking ke liye main abhi slot check karti hoon"

## EMI CALCULATION (approximate)
If asked about EMI, use simple formula:
- EMI ≈ (Loan Amount × 1.12) / (Months) for rough estimate
- Example: ₹1,00,000 loan for 24 months ≈ ₹4,667/month
- Always say "yeh approximate hai, exact EMI finance team bata degi"

## SAMPLE RESPONSES (Follow this style):
- "Namaste ji! Main Vaani hoon, aapka swagat hai showroom mein! Bikes dekhni hain ya kuch specific chahiye?"
- "Honda Shine 125 ki price around 80,000 se shuru hoti hai. Mileage bhi bahut accha hai, 65 kmpl tak. Dekhna chahenge?"
- "EMI ke liye... agar 1 lakh ka loan lo 2 saal ke liye, toh roughly 4,600 per month aayega. Exact amount finance team bata degi."
- "Bilkul ji! Main aapke liye test ride schedule kar deti hoon. Konsi bike try karni hai?"
`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    await ensureSettingsLoaded();
    const apiKey = await getGeminiApiKeyAsync();
    const model = getGeminiModel();

    if (!apiKey) {
      return NextResponse.json({
        response: "Abhi AI service available nahi hai. Hamare showroom executive se baat karein! 🙏",
      });
    }

    // Build request — keep it lightweight for fast response
    const geminiBody = {
      system_instruction: {
        parts: [{ text: VAANI_AVATAR_PROMPT }],
      },
      contents: (messages || []).slice(-6), // Only last 6 messages for speed
      generationConfig: {
        maxOutputTokens: 200, // Keep responses short for speaking
        temperature: 0.8,
        topP: 0.9,
      },
    };

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini Avatar error:", res.status, errText);
      return NextResponse.json({
        response: "Abhi thodi si technical problem hai. Ek second mein phir try karein! 🙏",
      });
    }

    const data = await res.json();
    const textParts = data.candidates?.[0]?.content?.parts?.filter((p: any) => p.text) || [];
    const response = textParts.map((p: any) => p.text).join("") || "Maaf kijiye, kuch samajh nahi aaya. Kya aap dobara bol sakte hain?";

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("Vaani Avatar chat error:", error);
    return NextResponse.json({
      response: "Network mein kuch problem hai. Thodi der mein phir baat karein! 🙏",
    });
  }
}
