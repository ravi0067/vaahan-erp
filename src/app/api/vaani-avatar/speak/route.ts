/**
 * Vaani Avatar TTS API — ElevenLabs Multilingual Voice
 * POST /api/vaani-avatar/speak
 * Body: { text: string, voice?: "female" | "male", voiceId?: string }
 * Returns: audio/mpeg stream
 */
import { NextRequest, NextResponse } from "next/server";
import { ensureSettingsLoaded, getElevenLabsApiKey } from "@/lib/credentials";

export const dynamic = "force-dynamic";

// ── Voice Presets ────────────────────────────────────────────────────────
// Professional voices that pronounce Hindi/Hinglish clearly
const VOICE_PRESETS = {
  female: {
    id: "cgSgspJ2msm6clMCkdW9", // Jessica — Playful, Bright, Warm (young female)
    name: "Vaani (Female)",
    settings: { stability: 0.50, similarity_boost: 0.75, style: 0.35, use_speaker_boost: true },
  },
  male: {
    id: "cjVigY5qzO86Huf0OWal", // Eric — Smooth, Trustworthy (young male)
    name: "Vaani (Male)",
    settings: { stability: 0.50, similarity_boost: 0.75, style: 0.30, use_speaker_boost: true },
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice, voiceId } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text required" }, { status: 400 });
    }

    // Clean text for natural speech
    const cleanText = text
      .replace(/[\uD800-\uDFFF]/g, "") // Remove emoji surrogates
      .replace(/[*_~`#\[\](){}]/g, "")          // Remove markdown chars
      .replace(/https?:\/\/\S+/g, "")           // Remove URLs
      .replace(/\n+/g, ". ")                     // Newlines to pauses
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 1000);

    if (!cleanText || cleanText.length < 2) {
      return NextResponse.json({ error: "No speakable text" }, { status: 400 });
    }

    // Get API key
    await ensureSettingsLoaded();
    const apiKey = getElevenLabsApiKey();

    if (!apiKey) {
      return NextResponse.json({ error: "ElevenLabs not configured", fallback: true }, { status: 503 });
    }

    // Select voice
    const preset = voice === "male" ? VOICE_PRESETS.male : VOICE_PRESETS.female;
    const finalVoiceId = voiceId || preset.id;
    const voiceSettings = preset.settings;

    // Call ElevenLabs TTS — eleven_multilingual_v2 for Hindi/Hinglish/all Indian languages
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${finalVoiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: "eleven_multilingual_v2", // Best for Hindi/Hinglish/all Indian languages
          voice_settings: voiceSettings,
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("ElevenLabs TTS error:", res.status, errText);
      return NextResponse.json({ error: `TTS error: ${res.status}`, fallback: true }, { status: 503 });
    }

    // Stream audio back
    const audioBuffer = await res.arrayBuffer();
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBuffer.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("Vaani speak error:", error);
    return NextResponse.json({ error: error.message, fallback: true }, { status: 500 });
  }
}

// GET — List available voices
export async function GET() {
  return NextResponse.json({
    voices: {
      female: { id: VOICE_PRESETS.female.id, name: VOICE_PRESETS.female.name, description: "Young female — professional, warm, clear Hindi pronunciation" },
      male: { id: VOICE_PRESETS.male.id, name: VOICE_PRESETS.male.name, description: "Young male — smooth, trustworthy, clear Hindi pronunciation" },
    },
    model: "eleven_multilingual_v2",
    supportedLanguages: ["Hindi", "Hinglish", "English", "Telugu", "Tamil", "Bengali", "Gujarati", "Marathi", "Punjabi", "Kannada", "Malayalam", "Odia"],
  });
}
