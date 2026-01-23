import { NextRequest, NextResponse } from "next/server";
import { generateGroundedResponse, ReasoningMode } from "@/lib/ai/reasoning";
import { Logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
    const requestId = Math.random().toString(36).substring(7);

    try {
        const { query, context, language, mode, model, messages } = await req.json();

        Logger.info("Grounded Chat API: Request received", {
            requestId,
            language,
            mode,
            contextAvailable: !!context,
            historyLength: messages?.length || 0
        });

        if (!query) {
            return NextResponse.json({
                error: "Invalid Request",
                message: "User query is required for document intelligence analysis."
            }, { status: 400 });
        }

        // Validate Reasoning Mode
        const validModes: ReasoningMode[] = ['strict', 'explainer', 'summary'];
        const reasoningMode = validModes.includes(mode) ? (mode as ReasoningMode) : 'strict';

        // Interface with Reasoning Layer
        const result = await generateGroundedResponse(query, context || "No document context provided.", {
            model: model || "openai/gpt-4-mini",
            language: language || "en",
            mode: reasoningMode,
            messages: messages || []
        });

        Logger.info("Grounded Chat API: Success", { requestId });

        return NextResponse.json(result);

    } catch (error: any) {
        Logger.error("Grounded Chat API: Fatal exception", error, { requestId });
        return NextResponse.json({
            error: "System Fault",
            message: "The intelligence engine encountered a critical interrupt."
        }, { status: 500 });
    }
}
