import { type NextRequest, NextResponse } from "next/server"
import { isLLMReady } from "@/lib/ai/models"

export async function POST(req: NextRequest) {
  try {
    const { text, voice_id = "21m00Tcm4TlvDq8ikWAM" } = await req.json() // Rachel voice as default

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    if (!isLLMReady(true)) {
      return NextResponse.json(
        { error: "Configuration Error", message: "Voice services are not configured yet. Please provide a valid ELEVENLABS_API_KEY." },
        { status: 500 },
      )
    }

    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY as string

    console.log("[v0] Generating speech for text:", text.substring(0, 50) + "...")

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
      method: "POST",
      headers: {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": elevenLabsApiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] ElevenLabs TTS API error:", response.status, errorText)
      return NextResponse.json({ error: `Text-to-speech conversion failed: ${errorText}` }, { status: response.status })
    }

    const audioBuffer = await response.arrayBuffer()

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    })
  } catch (error) {
    console.error("[v0] TTS error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}