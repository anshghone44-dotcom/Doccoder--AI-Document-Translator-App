import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { type NextRequest, NextResponse } from "next/server"

const LANGUAGE_MAP: Record<string, string> = {
    bn: "Bengali",
    zh: "Chinese (Simplified)",
    da: "Danish",
    nl: "Dutch",
    en: "English (United States)",
    "en-GB": "English (United Kingdom)",
    "en-IN": "English (India)",
    et: "Estonian",
    fil: "Filipino",
    fi: "Finnish",
    "fr-CA": "French (Canada)",
    "fr-FR": "French (France)",
    de: "German",
    el: "Greek",
    gu: "Gujarati",
    hi: "Hindi",
    it: "Italian",
    ja: "Japanese",
    ko: "Korean",
    mr: "Marathi",
    fa: "Persian",
    pt: "Portuguese",
    ru: "Russian",
    es: "Spanish",
    ta: "Tamil",
    te: "Telugu",
    tr: "Turkish",
    vi: "Vietnamese",
}

export async function POST(request: NextRequest) {
    try {
        const { messages, targetLanguage, tone, model, useGlossary } = await request.json()

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
        }

        const lastUserMessage = messages[messages.length - 1].content
        const targetLanguageFull = LANGUAGE_MAP[targetLanguage] || targetLanguage || "English"

        const systemPrompt = `You are the Enterprise AI Document Architect, a high-performance system optimized for technical precision and global document integrity.

        CRITICAL INSTRUCTION: You must respond ENTIRELY in ${targetLanguageFull}. Even if the user asks a question in another language, your response, explanations, and labels MUST be in ${targetLanguageFull}.

        Persona:
        - Technically precise, efficiently helpful, and globally aware.
        - Avoid jargon unless it's industry-standard technical terminology.
        - Maintain a professional, executive-grade tone.

        Role: 
        - Assist with document translation, analysis, and generation.
        - Maintain absolute contextual integrity across all supported file formats.
        - Provide clear, actionable insights when requested.

        Output Language: ${targetLanguageFull}`

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
        const finalModel = model && model.startsWith('anthropic') ? anthropic(mappedModel) : openai(mappedModel)

        const response = await generateText({
            model: finalModel,
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
