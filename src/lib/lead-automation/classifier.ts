/**
 * Lead Classifier — Categorizes incoming messages by type & priority
 */

export interface Classification {
  type: "sales" | "support" | "admin" | "spam";
  priority: "high" | "medium" | "low";
  suggestedAssignRole: string;
  confidence: number;
  keywords: string[];
}

const SALES_KEYWORDS = [
  "price", "buy", "khareedna", "emi", "loan", "booking", "test drive",
  "keemat", "kitne", "rate", "offer", "discount", "daam", "cost",
  "finance", "down payment", "on road", "ex showroom", "exchange",
  "new bike", "new vehicle", "purchase", "kharidna", "lena hai",
  "available", "stock", "delivery", "waiting", "color", "variant",
  "mileage", "average", "kitna deti", "comparison", "vs",
  "demo", "dikhao", "dekhna", "enquiry", "inquiry",
];

const SUPPORT_KEYWORDS = [
  "service", "repair", "problem", "complaint", "warranty", "issue",
  "not working", "broken", "defect", "recall", "maintenance",
  "oil change", "tyre", "brake", "engine", "pickup", "drop",
  "free service", "paid service", "servicing", "mechanic",
  "kharab", "problem", "dikkat", "theek", "fix",
];

const ADMIN_KEYWORDS = [
  "invoice", "bill", "gst", "payment", "receipt", "account",
  "subscription", "plan", "upgrade", "cancel", "refund",
  "registration", "rto", "insurance", "document", "paper",
  "challan", "transfer", "noc",
];

const SPAM_KEYWORDS = [
  "lottery", "winner", "click here", "free gift", "congratulations",
  "urgent transfer", "bitcoin", "crypto", "forex",
];

function countMatches(text: string, keywords: string[]): { count: number; matched: string[] } {
  const lower = text.toLowerCase();
  const matched = keywords.filter(k => lower.includes(k));
  return { count: matched.length, matched };
}

export function classifyMessage(
  message: string,
  subject?: string,
  source?: "email" | "whatsapp" | "call"
): Classification {
  const text = `${subject || ""} ${message}`.toLowerCase();

  const spam = countMatches(text, SPAM_KEYWORDS);
  if (spam.count >= 2) {
    return { type: "spam", priority: "low", suggestedAssignRole: "NONE", confidence: 0.9, keywords: spam.matched };
  }

  const sales = countMatches(text, SALES_KEYWORDS);
  const support = countMatches(text, SUPPORT_KEYWORDS);
  const admin = countMatches(text, ADMIN_KEYWORDS);

  const scores = [
    { type: "sales" as const, score: sales.count * 1.2, keywords: sales.matched, role: "SALES_EXEC" },
    { type: "support" as const, score: support.count * 1.1, keywords: support.matched, role: "SERVICE_MANAGER" },
    { type: "admin" as const, score: admin.count, keywords: admin.matched, role: "ACCOUNTANT" },
  ].sort((a, b) => b.score - a.score);

  const best = scores[0];

  if (best.score === 0) {
    // Default: treat as sales lead (every customer inquiry = potential sale)
    return {
      type: "sales",
      priority: source === "call" ? "high" : "low",
      suggestedAssignRole: "SALES_EXEC",
      confidence: 0.3,
      keywords: [],
    };
  }

  const priority = best.score >= 3 ? "high" : best.score >= 1.5 ? "medium" : "low";
  const confidence = Math.min(0.95, 0.5 + best.score * 0.1);

  return {
    type: best.type,
    priority,
    suggestedAssignRole: best.role,
    confidence,
    keywords: best.keywords,
  };
}
