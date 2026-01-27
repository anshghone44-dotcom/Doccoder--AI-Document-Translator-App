import { type NextRequest, NextResponse } from "next/server"
import { isLLMReady } from "@/lib/ai/models"
import { speechToText } from "@/lib/voice/stt"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Check if OpenAI is ready (which is our new primary transcription service)
    if (!isLLMReady()) {
      return NextResponse.json(
        { error: "Configuration Error", message: "Voice services are not configured yet. Please provide a valid OPENAI_API_KEY." },
        { status: 500 },
      )
    }

    console.log("[v0] Sending audio to OpenAI Whisper API...")

    const transcription = await speechToText(audioFile)

    console.log("[v0] Transcription successful")

    return NextResponse.json({ text: transcription || "" })
  } catch (error: any) {
    console.error("[v0] Transcription error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
