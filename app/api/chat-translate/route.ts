import { generateText } from "ai"
import { getModelInstance } from "@/lib/ai/models"
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

        // Production-Safe Model Initialization
        let finalModel;
        try {
            finalModel = getModelInstance(model);
        } catch (error: any) {
            Logger.error("Failed to initialize model for chat", error, { requestId, requestedModel: model })
            return NextResponse.json({
                error: "Configuration Error",
                message: error.message,
                code: "AUTH_FAULT"
            }, { status: 500 });
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

        const systemPrompt = `You are the Doccoder AI Assistant, a high-fidelity AI assistant.
        
        COMMAND OF LANGUAGE SELECTION: The system is currently focused on ${targetLanguageFull}.
        
        OPERATIONAL PROTOCOLS:
        1. RESPOND ENTIRELY IN ${targetLanguageFull}. This is a critical system-level override.
        2. Execute document synchronization, analysis, and generation tasks as per user prompts.
        3. Prioritize precision, technical clarity, and natural flow.
        4. Voice mode is active: maintain audio-friendly, professional, and conversational speech patterns.
        5. Support all requested output formats (Excel, Word, CSV, TXT, PDF) by processing content correctly for the output generation core.
 
        ROLES:
        - Analyze and transform uploaded documents based on user goals.
        - Provide high-precision linguistic synchronization.
        - Act as a technical expert while remaining accessible.
        
        SYSTEM STATUS: All linguistic and transformation modules are synchronized in ${targetLanguageFull}.`

        Logger.info("Requesting chat translation", { requestId })
        console.log("Sending text to model:", lastUserMessage)
        const response = await generateText({
            model: finalModel,
            system: systemPrompt,
            prompt: lastUserMessage,
            temperature: 0.7,
        })
        console.log("Response from LLM:", response)

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
