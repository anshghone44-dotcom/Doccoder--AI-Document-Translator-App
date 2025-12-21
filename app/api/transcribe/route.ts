import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY

    // Enhanced debugging for API Key issues
    if (!elevenLabsApiKey) {
      console.error("[ElevenLabs] Error: ELEVENLABS_API_KEY is missing in environment variables.")
      return NextResponse.json(
        { 
          error: "Server configuration error: ElevenLabs API key is missing.", 
          details: "Please add ELEVENLABS_API_KEY to your .env.local or Vercel environment variables." 
        },
        { status: 500 },
      )
    }

    const audioBuffer = await audioFile.arrayBuffer()
    const audioBlob = new Blob([audioBuffer], { type: audioFile.type })

    const elevenLabsForm = new FormData()
    elevenLabsForm.append("file", audioBlob, "audio.webm")
    elevenLabsForm.append("model_id", "scribe_v1")

    console.log("[ElevenLabs] Sending audio to Speech-to-Text API...")

    const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: {
        "xi-api-key": elevenLabsApiKey,
        // boundary is automatically set by fetch when body is FormData
      },
      body: elevenLabsForm,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[ElevenLabs] API Error (${response.status}):`, errorText)
      return NextResponse.json(
        { 
          error: "Speech-to-text conversion failed", 
          details: errorText,
          statusCode: response.status
        }, 
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log("[ElevenLabs] Transcription successful")

    return NextResponse.json({ text: result.text || "" })
  } catch (error: any) {
    console.error("[ElevenLabs] Internal Error:", error)
    return NextResponse.json(
      { error: "Internal server error during transcription", details: error.message }, 
      { status: 500 }
    )
  }
}
