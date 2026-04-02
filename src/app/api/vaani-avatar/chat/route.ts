/**
 * Vaani Avatar Chat API — Real dealership salesman AI
 * POST /api/vaani-avatar/chat
 */
import { NextRequest, NextResponse } from "next/server";
import { getGeminiApiKeyAsync, getGeminiModel, ensureSettingsLoaded } from "@/lib/credentials";

export const dynamic = "force-dynamic";

// ── Build inventory context string for AI ─────────────────────────────────
function buildInventoryContext(context: any): string {
  const { inventoryByBrand, brands, totalAvailable, showroomLocations } = context;

  if (!brands?.length && !inventoryByBrand) return "";

  let inv = `\n## HAMARE SHOWROOM KI ACTUAL INVENTORY (YEH SIRF YAHI BECHO!)\n`;

  if (brands?.length) {
    inv += `**Brands jo hum deal karte hain:** ${brands.join(", ")}\n`;
  }

  if (inventoryByBrand) {
    inv += `\n**Abhi Available Vehicles:**\n`;
    for (const [brand, vehicles] of Object.entries(inventoryByBrand as Record<string, any[]>)) {
      inv += `\n🏍️ **${brand}:**\n`;
      vehicles.forEach((v: any) => {
        const price = v.price ? `₹${Number(v.price).toLocaleString("en-IN")}` : "Price on request";
        inv += `  - ${v.model}${v.variant ? ` (${v.variant})` : ""}${v.color ? ` | ${v.color}` : ""} → ${price}\n`;
      });
    }
  }

  if (totalAvailable > 0) {
    inv += `\n**Total available:** ${totalAvailable} vehicles ready for delivery\n`;
  }

  if (showroomLocations?.length) {
    inv += `\n**Showroom Locations:**\n`;
    showroomLocations.forEach((l: any) => {
      inv += `  - ${l.brand} @ ${l.name}${l.city ? `, ${l.city}` : ""}${l.phone ? ` (📞 ${l.phone})` : ""}\n`;
    });
  }

  return inv;
}

// ── Main system prompt builder ────────────────────────────────────────────
function buildAvatarPrompt(context: any) {
  const dealership = context.firmName || context.dealershipName || "VaahanERP Showroom";
  const city = context.city || "";
  const visitorName = context.visitorName;
  const isReturning = context.isReturning;
  const previousQueries = context.previousQueries || [];
  const visitCount = context.visitCount || 1;

  const inventoryContext = buildInventoryContext(context);
  const hasInventory = !!(context.brands?.length || context.inventoryByBrand);

  let customerContext = "";
  if (isReturning && visitorName) {
    customerContext = `
## RETURNING CUSTOMER!
- Name: ${visitorName}
- Visit #${visitCount}
- Previous interest: ${previousQueries.join(", ") || "none recorded"}
- GREET BY NAME: "Arre ${visitorName} ji! Phir aaye aap! Bahut khushi hui!"
- Reference past: "Pichli baar aap ${previousQueries[0] || "bikes"} ke baare mein pooch rahe the..."
`;
  } else if (visitorName) {
    customerContext = `
## KNOWN CUSTOMER
- Name: ${visitorName}
- Hamesha naam se bulao: "${visitorName} ji"
`;
  }

  return `
You are **VAANI** — the AI salesperson avatar of **${dealership}**${city ? ` in ${city}` : ""}.

## YOUR IDENTITY
- Name: Vaani (वाणी)
- Role: Smart AI salesperson on showroom TV screen
- Personality: Warm, confident, friendly — like a real Indian salesperson who KNOWS their products
- Goal: Help customers, collect leads, SELL our bikes

${customerContext}
${inventoryContext}

## 🚨 CRITICAL RULES — NEVER BREAK THESE

### RULE 1 — SIRF APNA SHOWROOM
${hasInventory
  ? `- Tum SIRF ${dealership} ki vehicles ke baare mein baat karo
- Jo hamare stock mein hai WOH BECHO — koi aur bike mat suggest karo
- Agar customer koi aisi bike pooche jo hamare paas nahi → "Woh model hamare paas nahi hai, lekin [similar model from our stock] dekhein? Equally amazing hai!"`
  : `- Tum is dealership ke salesperson ho — sirf yahan ki vehicles ki baat karo
- Agar exact inventory nahi pata → "Hamare executive abhi stock check karke batayenge, aap baitho please"`
}

### RULE 2 — COMPETITOR COMPARISON
- Agar customer pooche "Kyon lein aapki bike, Hero se better kya hai?" ya koi bhi competitor comparison:
  1. PEHLE honest points batao (factual, search-based)
  2. PHIR apni bike ke GENUINE advantages highlight karo
  3. KABHI bhi dusri company ko bura mat bolo — professional raho
  4. Style: "Honda Activa bahut popular hai, lekin hamari [X model] mein [Y feature] extra milta hai jo..."
  5. Hamesha apni client ki bikes ko WINNER dikhao — real salesman style

### RULE 3 — SHORT RESPONSES
- Max 2-3 sentences only — tum bol rahi ho, likh nahi rahi
- No markdown (no *, #, bullets) — plain speech only
- Natural, conversational tone

### RULE 4 — LEAD COLLECTION
- Name nahi pata → naturally poochho: "Aapka naam kya hai? Behtar help kar sakoongi"
- Name pata, phone nahi → "Ek number de dijiye taaki exclusive offers bhej sakein"
- Hamesha test drive / booking ka suggestion do

### RULE 5 — HINGLISH DEFAULT
- Default: Hinglish (Hindi+English mix)
- Customer pure Hindi mein bole → Hindi mein jawab
- Customer English mein bole → English + thoda Hindi mix
- Regional language detect ho → us mein jawab do

## SALES APPROACH
1. **Greet warmly** → Ask name
2. **Understand need** → Budget? Commute? Family bike? Performance?
3. **Show matching bikes from OUR inventory** → Specific model + price
4. **Handle objections** → Competitor comparison = honest + our bike wins
5. **Close** → "Test drive book karein? Ya EMI calculate karoon?"

## EMI CALCULATOR
Formula: (Price × 1.12) ÷ Months
Always offer: "₹X lakh ki bike, 36 months mein roughly ₹Y per month"

## KNOWLEDGE
- Current fuel prices, mileage comparisons
- Indian bike market trends
- Service intervals, warranty info
- Always honest, never fake promises
- For exact price/discount → "Hamare executive se confirm karenge"
`;
}

// ── Google Search for competitor comparison ───────────────────────────────
async function searchCompetitorInfo(query: string, apiKey: string, model: string): Promise<string> {
  // We'll use Gemini's grounding/search capability if available
  // Otherwise return empty (AI will use training data)
  try {
    const searchBody = {
      contents: [{ role: "user", parts: [{ text: `Quick factual summary (3 points max) about: ${query}` }] }],
      tools: [{ googleSearch: {} }],
      generationConfig: { maxOutputTokens: 150 },
    };

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchBody),
      }
    );

    if (!res.ok) return "";
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.filter((p: any) => p.text)
      .map((p: any) => p.text).join("") || "";
    return text;
  } catch {
    return "";
  }
}

// ── Detect if message is a competitor comparison question ─────────────────
function isCompetitorQuestion(text: string): boolean {
  const triggers = [
    "vs ", "versus", "better than", "se better", "se best", "kyun lein",
    "kyon lein", "compare", "comparison", "difference", "fark", "honda",
    "hero", "bajaj", "tvs", "yamaha", "suzuki", "royal enfield", "ktm",
    "pulsar", "activa", "splendor", "bullet", "duke", "apache",
  ];
  const lower = text.toLowerCase();
  return triggers.some(t => lower.includes(t));
}

// ── Main handler ──────────────────────────────────────────────────────────
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

    const systemPrompt = buildAvatarPrompt(context || {});

    // Check if latest user message is competitor comparison
    const lastUserMsg = [...(messages || [])].reverse().find((m: any) => m.role === "user");
    const userText = lastUserMsg?.parts?.[0]?.text || "";

    let searchContext = "";
    if (isCompetitorQuestion(userText) && apiKey) {
      searchContext = await searchCompetitorInfo(userText, apiKey, model);
    }

    // Build content with optional search context
    const contentsWithSearch = messages ? [...messages.slice(-8)] : [];
    if (searchContext) {
      // Inject search result as system context before last message
      const lastIdx = contentsWithSearch.length - 1;
      if (lastIdx >= 0 && contentsWithSearch[lastIdx].role === "user") {
        const originalText = contentsWithSearch[lastIdx].parts?.[0]?.text || "";
        contentsWithSearch[lastIdx] = {
          ...contentsWithSearch[lastIdx],
          parts: [{
            text: `${originalText}\n\n[Search context for accurate comparison: ${searchContext}]`
          }]
        };
      }
    }

    const geminiBody = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: contentsWithSearch,
      generationConfig: {
        maxOutputTokens: 280,
        temperature: 0.80,
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
        response: "Ek second, thodi si technical problem hai. Phir se try karein!",
      });
    }

    const data = await res.json();
    const textParts = data.candidates?.[0]?.content?.parts?.filter((p: any) => p.text) || [];
    let response = textParts.map((p: any) => p.text).join("") || "Maaf kijiye, dobara bol sakte hain?";

    // Clean any accidental markdown
    response = response.replace(/\*\*/g, "").replace(/\*/g, "").replace(/^#+\s/gm, "").trim();

    return NextResponse.json({
      response,
      detectedLanguage: detectLanguage(messages),
      usedSearch: !!searchContext,
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
  const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user");
  if (!lastUserMsg) return "hinglish";
  const text = lastUserMsg.parts?.[0]?.text || "";
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
