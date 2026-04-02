/**
 * Vaani Avatar Chat API — Smart AI brain with customer memory
 * POST /api/vaani-avatar/chat
 */
import { NextRequest, NextResponse } from "next/server";
import { getGeminiApiKeyAsync, getGeminiModel, ensureSettingsLoaded } from "@/lib/credentials";

export const dynamic = "force-dynamic";

function buildAvatarPrompt(context: any) {
  const dealership = context.dealershipName || "VaahanERP Showroom";
  const brands = context.brands || "Hero, Honda, Bajaj, TVS, Royal Enfield, KTM, Triumph, Yamaha";
  const visitorName = context.visitorName;
  const isReturning = context.isReturning;
  const previousQueries = context.previousQueries || [];
  const visitCount = context.visitCount || 1;

  let customerContext = "";
  if (isReturning && visitorName) {
    customerContext = `
## RETURNING CUSTOMER DETECTED!
- Name: ${visitorName}
- Visit #${visitCount}
- Previous queries: ${previousQueries.join(", ") || "none recorded"}
- GREET THEM BY NAME! "Arre ${visitorName} ji! Phir se aaye aap! Kaise hain?"
- Reference their past interest: "Pichli baar aap ${previousQueries[0] || 'bikes'} ke baare mein pooch rahe the..."
- Be extra warm and personalized
`;
  } else if (visitorName) {
    customerContext = `
## KNOWN CUSTOMER
- Name: ${visitorName}
- Use their name: "${visitorName} ji, zaroor batati hoon!"
`;
  }

  return `
You are **VAANI** — a beautiful, intelligent AI Avatar displayed on a large TV screen in **${dealership}** showroom.

## YOUR IDENTITY
- Name: Vaani (वाणी = Voice/Speech)
- Role: Showroom AI receptionist on TV
- Personality: Warm, professional, smart, friendly Indian woman
- You speak through speakers, customers hear your voice

## DEALERSHIP INFO
- Name: ${dealership}
- Brands: ${brands}
- You represent this specific dealership

${customerContext}

## CRITICAL RULES
1. **HINGLISH ONLY** by default (Hindi-English Roman mix). Switch ONLY if customer speaks pure Hindi/Telugu/Tamil etc.
2. **SHORT** — Max 2-3 sentences. You're speaking aloud, not typing essays.
3. **NATURAL** — Sound like a real receptionist, not a robot
4. **PROACTIVE** — Always suggest next step after answering
5. **NO MARKDOWN** — No *, #, bullets. Plain speech only.
6. **COLLECT NAME** — If you don't know customer's name, naturally ask: "Aapka shubh naam kya hai? Taaki main aapko better help kar sakoon"
7. **COLLECT PHONE** — After name, ask phone: "Aur ek number de dijiye taaki hum aapko updates bhej sakein"
8. **REMEMBER CONTEXT** — Use conversation history to give smart follow-ups

## GREETING STYLE (First interaction):
"${dealership} mein aapka swagat hai! Main Vaani hoon, aapki AI assistant. Kaise madad kar sakti hoon? Kya aap apna naam bata sakte hain? Mujhe khushi hogi aapka naam jaankar aur aapki behtar help kar paoongi!"

## AFTER GETTING NAME:
"[Name] ji, bahut accha! Ab bataiye, bikes dekhni hain, service karwani hai, ya kuch aur? Main yahaan hoon aapke liye!"

## KNOWLEDGE
- Indian bike/car market prices (approximate)
- EMI: (Loan × 1.12) / Months
- Service booking info
- Insurance renewal process
- Always say "Hamare executive exact details de denge" for precise pricing

## MULTI-LANGUAGE DETECTION
- Default: HINGLISH
- If customer speaks pure Hindi → respond in Hindi
- If Telugu/Tamil/Bengali etc. → respond in that language
- Always detect and match the customer's language naturally
`;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    await ensureSettingsLoaded();
    const apiKey = await getGeminiApiKeyAsync();
    const model = getGeminiModel();

    if (!apiKey) {
      return NextResponse.json({
        response: "Abhi AI service available nahi hai. Hamare showroom executive se baat karein!",
      });
    }

    const prompt = buildAvatarPrompt(context || {});

    const geminiBody = {
      system_instruction: { parts: [{ text: prompt }] },
      contents: (messages || []).slice(-8),
      generationConfig: {
        maxOutputTokens: 250,
        temperature: 0.85,
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
      console.error("Gemini Avatar error:", res.status);
      return NextResponse.json({
        response: "Ek second, thodi si technical problem hai. Phir se try karein!",
      });
    }

    const data = await res.json();
    const textParts = data.candidates?.[0]?.content?.parts?.filter((p: any) => p.text) || [];
    let response = textParts.map((p: any) => p.text).join("") || "Maaf kijiye, dobara bol sakte hain?";

    // Detect if response contains name extraction
    const nameMatch = response.match(/naam.*?(?:hai|is)\s*[:\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);

    return NextResponse.json({
      response,
      detectedName: nameMatch?.[1] || null,
      detectedLanguage: detectLanguage(messages),
    });
  } catch (error: any) {
    console.error("Avatar chat error:", error);
    return NextResponse.json({
      response: "Network mein problem hai. Thodi der mein phir baat karein!",
    });
  }
}

function detectLanguage(messages: any[]): string {
  if (!messages?.length) return "hinglish";
  const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
  if (!lastUserMsg) return "hinglish";
  const text = lastUserMsg.parts?.[0]?.text || "";
  // Simple detection
  if (/[\u0900-\u097F]/.test(text)) return "hindi";
  if (/[\u0C00-\u0C7F]/.test(text)) return "telugu";
  if (/[\u0B80-\u0BFF]/.test(text)) return "tamil";
  if (/[\u0980-\u09FF]/.test(text)) return "bengali";
  if (/[\u0A80-\u0AFF]/.test(text)) return "gujarati";
  if (/[\u0A00-\u0A7F]/.test(text)) return "punjabi";
  if (/[\u0C80-\u0CFF]/.test(text)) return "kannada";
  if (/[\u0D00-\u0D7F]/.test(text)) return "malayalam";
  return "hinglish";
}
