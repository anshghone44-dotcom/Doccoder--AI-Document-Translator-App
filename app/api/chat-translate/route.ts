import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const { messages, targetLanguage, tone, model } = await request.json()

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
        }

        const lastUserMessage = messages[messages.length - 1].content

        const response = await generateText({
            model: "openai/gpt-4-mini",
            system: `You are Doccoder AI, a premium translation assistant powered by ${model || "Advanced Neural Engines"}. 
      Your goal is to translate the user's input accurately into ${targetLanguage || "the requested language"} with a ${tone || "professional"} tone.
      Provide the translation clearly. If the user asks questions about the translation, answer them helpfuly.`,
            prompt: lastUserMessage,
            temperature: 0.7,
        })

        return NextResponse.json({ role: "assistant", content: response.text })
    } catch (error) {
        console.error("[v0] Chat translation error:", error)
        return NextResponse.json({ error: "Failed to generate translation" }, { status: 500 })
    }
}
