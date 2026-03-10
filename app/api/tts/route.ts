export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server"
import { isLLMReady } from "@/lib/ai/models"
import { textToSpeech } from "@/lib/voice/tts"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    if (!isLLMReady()) {
      return NextResponse.json(
        { error: "Configuration Error", message: "AI services are not configured. Please provide a valid OPENAI_API_KEY." },
        { status: 503 },
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
    
    // Provide more specific error messages
    const errorMessage = error.message || "Internal server error"
    const status = error.status || 500
    
    return NextResponse.json(
      { error: "Speech Generation Failed", message: errorMessage },
      { status }
    )
  }
}
