import { NextResponse } from "next/server"

export async function GET() {
    try {
        const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY
        if (!elevenLabsApiKey) {
            return NextResponse.json(
                { error: "ElevenLabs API key not configured" },
                { status: 500 },
            )
        }

        console.log("[v0] Fetching available voices from ElevenLabs...")

        const response = await fetch("https://api.elevenlabs.io/v1/voices", {
            headers: {
                "xi-api-key": elevenLabsApiKey,
            },
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error("[v0] ElevenLabs Voices error:", response.status, errorText)
            return NextResponse.json({ error: `Failed to fetch voices: ${errorText}` }, { status: response.status })
        }

        const data = await response.json()
        // Return only necessary fields to keep it light
        const voices = data.voices.map((v: any) => ({
            id: v.voice_id,
            name: v.name,
            preview_url: v.preview_url,
            labels: v.labels
        }))

        return NextResponse.json({ voices })
    } catch (error: any) {
        console.error("[v0] Voices fetch error:", error)
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
    }
}
