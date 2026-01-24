import { NextRequest, NextResponse } from "next/server";
import { generateGroundedResponse, ReasoningMode } from "@/lib/ai/reasoning";
import { getModelInstance, isLLMReady } from "@/lib/ai/models";
import { RetrievalService } from "@/lib/retrieval/retrieval-service";
import { Logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
    const requestId = Math.random().toString(36).substring(7);

    try {
        const { query, context, language, mode, model, messages, documentId, sourceName } = await req.json();

        // 1. Production-Safe Readiness Check
        if (!isLLMReady()) {
            return NextResponse.json({
                answer: "Document intelligence is not configured yet. Please provide a valid API key in the system environment.",
                citations: "None",
                confidence: "Not Found",
                metadata: {}
            });
        }

        if (!query) {
            return NextResponse.json({
                error: "Invalid Request",
                message: "User query is required for document intelligence analysis."
            }, { status: 400 });
        }

        // 1. Semantic Retrieval
        let groundedContext = context || "";
        let retrievalMetadata = {};

        if (documentId || context) {
            const retrievalResult = await RetrievalService.getRelevantContext(
                query,
                context || "",
                sourceName || "Document",
                documentId
            );
            groundedContext = retrievalResult.content;
            retrievalMetadata = retrievalResult.metadata;
        }

        // 2. Validate Reasoning Mode
        const validModes: ReasoningMode[] = ['strict', 'explainer', 'summary'];
        const reasoningMode = validModes.includes(mode) ? (mode as ReasoningMode) : 'strict';

        // 3. Interface with Reasoning Layer
        const result = await generateGroundedResponse(query, groundedContext || "No document context provided.", {
            model: model || "openai/gpt-4-mini",
            language: language || "en",
            mode: reasoningMode,
            messages: messages || []
        });

        Logger.info("Grounded Chat API: Success", { requestId, intent: (retrievalMetadata as any).intent });

        return NextResponse.json({
            ...result,
            metadata: retrievalMetadata
        });
    } catch (error: any) {
        Logger.error("Grounded Chat API: Fatal exception", error, { requestId });
        return NextResponse.json({
            error: "System Fault",
            message: "The intelligence engine encountered a critical interrupt."
        }, { status: 500 });
    }
}
