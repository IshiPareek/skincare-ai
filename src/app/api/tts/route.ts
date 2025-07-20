// src/app/api/tts/route.ts
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  console.log("🎙️ TTS endpoint hit");

  try {
    const { text } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return new Response("Missing OpenAI API key", { status: 500 });
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: "nova",
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ OpenAI TTS error:", errText);
      return new Response(errText, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });
  } catch (err) {
    console.error("❌ Unexpected TTS error:", err);
    return new Response("Unexpected error", { status: 500 });
  }
}
