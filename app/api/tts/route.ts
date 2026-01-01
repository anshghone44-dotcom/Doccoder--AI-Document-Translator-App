import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const { text, voiceId } = await req.json()

        if (!text) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 })
        }

        const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY
        if (!elevenLabsApiKey) {
            return NextResponse.json(
                { error: "ElevenLabs API key not configured" },
                { status: 500 },
            )
        }

        // Default voice ID if none provided (e.g., Rachel)
        const targetVoiceId = voiceId || "21m00Tcm4TlvDq8ikWAM"

        console.log(`[v0] Generating TTS for: "${text.substring(0, 30)}..." using voice ${targetVoiceId}`)

        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}/stream`,
            {
                method: "POST",
                headers: {
                    "xi-api-key": elevenLabsApiKey,
                    "Content-Type": "application/json",
                    accept: "audio/mpeg",
                },
                body: JSON.stringify({
                    text,
                    model_id: "eleven_monolingual_v1",
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.5,
                    },
                }),
            },
        )

        if (!response.ok) {
            const errorText = await response.text()
            console.error("[v0] ElevenLabs TTS error:", response.status, errorText)
            return NextResponse.json({ error: `TTS conversion failed: ${errorText}` }, { status: response.status })
        }

        const audioBuffer = await response.arrayBuffer()
        return new Response(audioBuffer, {
            headers: {
                "Content-Type": "audio/mpeg",
            },
        })
    } catch (error: any) {
        console.error("[v0] TTS error:", error)
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
    }
}
