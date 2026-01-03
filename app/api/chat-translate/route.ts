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

        // Map future/advanced models to currently available versions
        const modelMapping: Record<string, string> = {
            "openai/gpt-5": "gpt-4o",
            "xai/grok-4": "gpt-4o",
            "anthropic/claude-4.1": "claude-3-5-sonnet-latest",
            "openai/gpt-4-mini": "gpt-4o-mini",
            "xai/grok-3": "gpt-4o",
            "anthropic/claude-3.1": "claude-3-5-haiku-20241022"
        }

        const modelId = model && model.includes('/') ? model.split('/')[1] : (model || "gpt-4o-mini")
        const mappedModel = modelMapping[model] || modelId

        const response = await generateText({
            model: model && model.startsWith('anthropic') ? `anthropic:${mappedModel}` : `openai:${mappedModel}`,
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
