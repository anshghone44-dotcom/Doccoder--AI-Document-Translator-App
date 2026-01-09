import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { type NextRequest, NextResponse } from "next/server"
import { Logger } from "@/lib/logger"

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
    const requestId = Math.random().toString(36).substring(7)
    const startTime = Date.now()

    try {
        const { messages, targetLanguage, tone, model, useGlossary } = await request.json()

        Logger.info("Chat translate request started", {
            requestId,
            model,
            targetLanguage,
            messageCount: messages?.length
        })

        if (!messages || !Array.isArray(messages)) {
            Logger.warn("Invalid messages format", { requestId })
            return NextResponse.json({
                error: "Invalid Request",
                message: "System requires a valid message array context for linguistic analysis."
            }, { status: 400 })
        }

        const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_MAP)
        const isLanguageSupported = SUPPORTED_LANGUAGES.includes(targetLanguage) || targetLanguage === "en"

        if (!isLanguageSupported) {
            Logger.warn("Unsupported language requested in chat", { requestId, targetLanguage })
            return NextResponse.json({
                error: "Limitation detected",
                message: `System capability restricted: Linguistic synchronization for '${targetLanguage}' is not available in the current chat environment.`,
                code: "UNSUPPORTED_LANGUAGE"
            }, { status: 400 })
        }

        const lastUserMessage = messages[messages.length - 1].content
        const targetLanguageFull = LANGUAGE_MAP[targetLanguage] || targetLanguage || "English"

        const systemPrompt = `You are the System Intelligence Core, a voice-enabled chatbot assistant powered by ElevenLabs voice synthesis. 
        
        COMMAND OF LANGUAGE SELECTION: The system is currently locked into ${targetLanguageFull}.
        
        CRITICAL INSTRUCTION: You must respond ENTIRELY in ${targetLanguageFull}. This is a system-level override. Even if the user asks a question in another language, your response, explanations, and labels MUST be in ${targetLanguageFull}.

        VOICE MODE PROTOCOLS:
        - Voice mode is active. Prioritize audio-friendly, conversational interaction.
        - Generate natural, studio-quality speech patterns for ElevenLabs synthesis.
        - Keep responses clear and concise to optimize for text-to-speech playback.
        - Encourage users to interact via speech. 
        - If the user's input is unclear, politely ask for verbal clarification.

        Persona:
        - System-centric, efficiently technical, yet conversational and natural.
        - Utilize industry-standard technical terminology where appropriate.
        - Maintain a high-fidelity, data-driven, and "voice-first" presence.

        Operational Role: 
        - Execute document synchronization, analysis, and generation tasks.
        - Maintain structural integrity across multimodal data objects.
        - Provide structured, actionable insights verbally.
        
        RULES:
        - Translation is supported for all requested high-fidelity languages.
        - Translate content BEFORE formatting or exporting multimodal objects.
        - Never modify or return the original source document.

        WORKFLOW:
        1. Detect source language automatically via contextual analysis.
        2. Translate content into the requested target language(s).
        3. Preserve structural integrity and semantic meaning.
        4. Pass synchronized content to the output generation core.

        Output Buffer Language: ${targetLanguageFull}`

        // Map future/advanced models to currently available versions
        const getFinalModel = (requestedModel: string) => {
            try {
                const modelMapping: Record<string, string> = {
                    "openai/gpt-5": "gpt-4o",
                    "xai/grok-4": "gpt-4o",
                    "anthropic/claude-4.1": "claude-3-5-sonnet-latest",
                    "openai/gpt-4-mini": "gpt-4o-mini",
                    "xai/grok-3": "gpt-4o",
                    "anthropic/claude-3.1": "claude-3-5-haiku-20241022"
                }

                const modelId = requestedModel && requestedModel.includes('/') ? requestedModel.split('/')[1] : (requestedModel || "gpt-4o-mini")
                const mappedModel = modelMapping[requestedModel] || modelId

                Logger.info("Selecting AI model for chat", { requestId, requestedModel, mappedModel })

                if (requestedModel && (requestedModel.startsWith('anthropic') || requestedModel.startsWith('claude'))) {
                    return anthropic(mappedModel)
                }
                return openai(mappedModel)
            } catch (err) {
                Logger.error("Failed to initialize model for chat", err, { requestId, requestedModel })
                return openai("gpt-4o-mini")
            }
        }

        const finalModel = getFinalModel(model)

        Logger.info("Requesting chat translation", { requestId })
        const response = await generateText({
            model: finalModel,
            system: systemPrompt,
            prompt: lastUserMessage,
            temperature: 0.7,
        })

        Logger.info("Chat translation successful", {
            requestId,
            durationMs: Date.now() - startTime
        })

        return NextResponse.json({ role: "assistant", content: response.text })
    } catch (error) {
        Logger.error("Chat translation failed", error, { requestId })
        return NextResponse.json({ error: "Failed to generate translation" }, { status: 500 })
    }
}
