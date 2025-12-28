import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const { messages, targetLanguage, tone, model, useGlossary } = await request.json()

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
        }

        const lastUserMessage = messages[messages.length - 1].content

        const systemPrompt = `You are the Doccoder AI Neural Translation Engine, a high-performance system optimized for technical and professional accuracy. 
      Powered by ${model || "Advanced Neural Architectures"}, your objective is to provide linguistically precise translations into ${targetLanguage || "the requested language"}.
      Maintain a highly professional, objective, and technical tone. Ensure terminology consistency and preserve context-specific nuances.
      Output format: Provide the translation directly. If the user requests technical clarification, respond as a specialized translation interface.`

        const response = await generateText({
            model: model ? `openai/${model.toLowerCase().replace('gpt-', 'gpt-')}` : "openai/gpt-4-mini",
            system: systemPrompt,
            prompt: lastUserMessage,
            temperature: 0.7,
        })

        return NextResponse.json({ role: "assistant", content: response.text })
    } catch (error) {
        console.error("[v0] Chat translation error:", error)
        return NextResponse.json({ error: "Failed to generate translation" }, { status: 500 })
    }
}
