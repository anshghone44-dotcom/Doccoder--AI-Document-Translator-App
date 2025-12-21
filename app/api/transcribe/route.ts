import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY

    if (!elevenLabsApiKey) {
      console.error("[v0] ELEVENLABS_API_KEY not set")
      return NextResponse.json(
        { error: "ElevenLabs API key not configured. Please add ELEVENLABS_API_KEY to environment variables." },
        { status: 500 },
      )
    }

    const audioBuffer = await audioFile.arrayBuffer()
    const audioBlob = new Blob([audioBuffer], { type: audioFile.type })

    const elevenLabsForm = new FormData()
    elevenLabsForm.append("file", audioBlob, "audio.webm")
    elevenLabsForm.append("model_id", "scribe_v1")

    console.log("[v0] Sending audio to ElevenLabs API...")

    // Call ElevenLabs Speech-to-Text API with correct endpoint
    const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: {
        "xi-api-key": elevenLabsApiKey,
      },
      body: elevenLabsForm,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] ElevenLabs API error:", response.status, errorText)
      return NextResponse.json({ error: `Speech-to-text conversion failed: ${errorText}` }, { status: response.status })
    }

    const result = await response.json()
    console.log("[v0] Transcription successful")

    // ElevenLabs returns { text: "transcribed text" }
    return NextResponse.json({ text: result.text || "" })
  } catch (error: any) {
    console.error("[v0] Transcription error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
