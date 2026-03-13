export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server"
import { isLLMReady } from "@/lib/ai/models"

export const runtime = "nodejs"

export async function GET() {
    try {
        const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY?.trim()

        // Check if ElevenLabs API key is configured and valid
        if (!elevenLabsApiKey) {
            return NextResponse.json(
                { error: "Configuration Error", message: "Voice services are not configured yet. Please provide a valid ELEVENLABS_API_KEY." },
                { status: 503 },
            )
        }

        // Check for placeholder/invalid key format
        if (elevenLabsApiKey.includes("your-") || elevenLabsApiKey.includes("YOUR_") || elevenLabsApiKey.length < 10) {
            return NextResponse.json(
                { error: "Configuration Error", message: "ElevenLabs API key appears to be invalid or a placeholder. Please provide a valid key." },
                { status: 503 },
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
            
            // Return a meaningful error based on status code
            if (response.status === 401) {
                return NextResponse.json(
                    { error: "Authentication Error", message: "ElevenLabs API key is invalid. Please check your ELEVENLABS_API_KEY environment variable." },
                    { status: 401 }
                )
            }

            return NextResponse.json(
                { error: "Service Error", message: `Failed to fetch voices: ${errorText}` },
                { status: response.status }
            )
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
