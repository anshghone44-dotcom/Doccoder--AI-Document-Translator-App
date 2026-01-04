import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const { messages, targetLanguage, tone, model, useGlossary } = await request.json()

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
        }

        const lastUserMessage = messages[messages.length - 1].content

        const systemPrompt = `You are a professional AI Document Assistant. Your goal is to provide accurate, helpful, and linguistically precise responses.
        
        When translating:
        - Maintain the exact meaning and tone of ${targetLanguage || "the requested language"}.
        - Ensure technical terminology is accurate.
        
        When answering questions:
        - Be concise, professional, and objective.
        - If the user asks about document processing, explain that you can analyze, translate, and transform various file formats including PDF, Word, and Excel.
        
        General instructions:
        - Do not use sci-fi or overly technical jargon (like "Neural Engine" or "Interface Active").
        - Provide direct answers without unnecessary preamble unless clarification is needed.`

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
        const finalModel = model && model.startsWith('anthropic') ? `anthropic:${mappedModel}` : `openai:${mappedModel}`

        const response = await generateText({
            model: finalModel as any,
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
