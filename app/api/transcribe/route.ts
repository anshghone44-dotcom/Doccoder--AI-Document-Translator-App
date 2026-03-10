export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server"
import { isLLMReady } from "@/lib/ai/models"
import { speechToText } from "@/lib/voice/stt"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get("voice") as File

    if (!audioFile) {
      return NextResponse.json({ error: "No voice file provided" }, { status: 400 })
    }

    // Check if OpenAI is ready (which is our new primary transcription service)
    if (!isLLMReady()) {
      return NextResponse.json(
        { error: "Configuration Error", message: "Voice communication not integrated. Please provide a valid ELEVENLABS_API_KEY." }
      )
    }

    console.log("[v0] Sending audio to Elevenlabs API...")

    const transcription = await speechToText(audioFile)

    console.log("[v0] Transcription successful")

    return NextResponse.json({ text: transcription || "" })
  } catch (error: any) {
    console.error("[v0] Transcription error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" })
  }
}
