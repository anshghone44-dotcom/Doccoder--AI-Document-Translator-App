import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { text, voice_id = "21m00Tcm4TlvDq8ikWAM" } = await req.json() // Rachel voice as default

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY

    if (!elevenLabsApiKey) {
      console.error("[v0] ELEVENLABS_API_KEY not set")
      return NextResponse.json(
        { error: "ElevenLabs API key not configured. Please add ELEVENLABS_API_KEY to environment variables." },
        { status: 500 },
      )
    }

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