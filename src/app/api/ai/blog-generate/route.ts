import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { keyword, language = "hinglish" } = await req.json();
  if (!keyword) return NextResponse.json({ error: "Keyword required" }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  const prompt = `You are a content writer for VaahanERP — a dealership management software (vehicle ERP) used by bike and car showrooms across India.

Write a ${language === "hinglish" ? "Hinglish (mix of Hindi + English)" : "English"} blog post about: "${keyword}"

Requirements:
- Length: 900–1200 words
- SEO optimized
- Practical tips for vehicle dealership owners
- Include subheadings (H2, H3)
- Include a CTA at the end for VaahanERP dealership software
- Engaging and informative tone

Return JSON with these exact keys:
{
  "title": "SEO-friendly blog title",
  "metaTitle": "60-char SEO meta title",
  "metaDesc": "155-char meta description",
  "excerpt": "2-sentence blog summary",
  "category": "one of: Business Tips, Technology, Sales, Service, Finance, Industry News",
  "tags": "comma-separated tags (5-7 tags)",
  "content": "full HTML blog content with <h2>, <h3>, <p>, <ul>, <li> tags"
}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json({ error: err.error?.message || "AI generation failed" }, { status: 500 });
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "AI generation failed. Check API key." }, { status: 500 });
  }
}
