/**
 * Vaani Avatar TTS API — Uses ElevenLabs for natural Hindi/Hinglish voice
 * POST /api/vaani-avatar/speak
 * Body: { text: string, voiceId?: string }
 * Returns: audio/mpeg stream
 */
import { NextRequest, NextResponse } from "next/server";
import { ensureSettingsLoaded, getElevenLabsApiKey } from "@/lib/credentials";

export const dynamic = "force-dynamic";

// Default voice — female Hindi voice on ElevenLabs
// "Rachel" is a good default, or use a Hindi voice ID
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel (natural female)

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Clean text for speech
    const cleanText = text
      .replace(/[\u{1F000}-\u{1FFFF}]/gu, "") // Remove emojis
      .replace(/[*_~`#\[\]]/g, "") // Remove markdown
      .replace(/\n+/g, ". ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 1000); // ElevenLabs limit

    if (!cleanText) {
      return NextResponse.json({ error: "No speakable text" }, { status: 400 });
    }

    // Get ElevenLabs API key
    await ensureSettingsLoaded();
    const apiKey = getElevenLabsApiKey();

    if (!apiKey) {
      // Fallback: return empty response, client will use browser TTS
      return NextResponse.json({ error: "ElevenLabs not configured", fallback: true }, { status: 503 });
    }

    const voice = voiceId || DEFAULT_VOICE_ID;

    // Call ElevenLabs TTS API
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: "eleven_multilingual_v2", // Supports Hindi/Hinglish
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("ElevenLabs error:", res.status, errText);
      return NextResponse.json(
        { error: `ElevenLabs error: ${res.status}`, fallback: true },
        { status: 503 }
      );
    }

    // Stream audio back
    const audioBuffer = await res.arrayBuffer();
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("Vaani speak error:", error);
    return NextResponse.json(
      { error: error.message, fallback: true },
      { status: 500 }
    );
  }
}
