import { type NextRequest, NextResponse } from "next/server"
import { isLLMReady } from "@/lib/ai/models"

export async function GET() {
    try {
        if (!isLLMReady(true)) {
            return NextResponse.json(
                { error: "Configuration Error", message: "Voice services are not configured yet. Please provide a valid ELEVENLABS_API_KEY." },
                { status: 500 },
            )
        }

        const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY as string

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
