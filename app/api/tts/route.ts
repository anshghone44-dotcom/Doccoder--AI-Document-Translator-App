import { type NextRequest, NextResponse } from "next/server"
import { isLLMReady } from "@/lib/ai/models"
import { textToSpeech } from "@/lib/voice/tts"

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    if (!isLLMReady()) {
      return NextResponse.json(
        { error: "Configuration Error", message: "Voice services are not configured yet. Please provide a valid OPENAI_API_KEY." },
        { status: 500 },
      )
    }

    console.log("[v0] Generating speech for text:", text.substring(0, 50) + "...")

    const audioBuffer = await textToSpeech(text)

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    })
  } catch (error: any) {
    console.error("[v0] TTS error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}