import { generateText } from "ai";
import { getModelInstance, isLLMReady } from "./models";
import { getGroundedPrompt } from "./prompts";
import { Logger } from "@/lib/logger";

export type ReasoningMode = 'strict' | 'explainer' | 'summary';

export interface GroundedOptions {
    model?: string;
    language?: string;
    mode?: ReasoningMode;
    messages?: { role: string; content: string }[];
}

export interface GroundedResponse {
    answer: string;
    citations: string;
    confidence: "High" | "Partial" | "Not Found";
}

/**
 * Generates a response strictly grounded in provided document context.
 * Enforces Hard-Locking: If no context or unconfigured, it refuses to respond using general knowledge.
 */
export async function generateGroundedResponse(
    query: string,
    documentContext: string,
    options: GroundedOptions = {}
): Promise<GroundedResponse> {
    const requestId = Math.random().toString(36).substring(7);

    // 1. System Readiness Check
    if (!isLLMReady()) {
        return {
            answer: "Document intelligence is not configured yet. Please provide a valid API key in the system environment.",
            citations: "None",
            confidence: "Not Found"
        };
    }

    // 2. Hard-Lock: Reject empty or insufficient context (User snippet implemented)
    if (!documentContext || documentContext.length < 50) {
        return {
            answer: "The document is not ready yet.",
            citations: "None",
            confidence: "Not Found"
        };
    }

    Logger.info("Reasoning engine: Generating grounded response", {
        requestId,
        model: options.model,
        mode: options.mode,
        contextLength: documentContext.length,
        historyLength: options.messages?.length || 0
    });

    try {
        const finalModel = getModelInstance(options.model || "openai/gpt-4-mini");
        const systemPrompt = getGroundedPrompt(options.mode || "strict", options.language || "en");

        const { text } = await generateText({
            model: finalModel,
            system: systemPrompt,
            messages: [
                ...(options.messages || []).map(m => ({
                    role: m.role as "user" | "assistant",
                    content: m.content
                })),
                {
                    role: "user",
                    content: `
Retrieved Document Evidence:
${documentContext}

User Question:
${query}
`
                }
            ],
            temperature: 0.2, // Low temperature for higher accuracy and hallucination control
        });

        const parsed = parseAIOutput(text);

        Logger.info("Reasoning engine: Response generated successfully", {
            requestId,
            confidence: parsed.confidence
        });

        return parsed;
    } catch (error: any) {
        Logger.error("Reasoning engine breakdown", error, { requestId });
        return {
            answer: "An internal intelligence processing error occurred. Document synchronization failed.",
            citations: "None",
            confidence: "Not Found"
        };
    }
}

/**
 * Parses the raw text output from the LLM into the structured GroundedResponse.
 */
function parseAIOutput(text: string): GroundedResponse {
    const lines = text.split("\n");
    let answer = "";
    let citations = "";
    let confidence: GroundedResponse["confidence"] = "Not Found";

    let currentSection: "answer" | "citations" | "confidence" | null = null;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Handle variations like "Answer:", "- Answer:", "• Answer:"
        const cleanLine = trimmed.replace(/^[-•]\s*/, "");

        if (cleanLine.toLowerCase().startsWith("answer:")) {
            currentSection = "answer";
            answer = cleanLine.substring(7).trim();
            continue;
        } else if (cleanLine.toLowerCase().startsWith("citations:")) {
            currentSection = "citations";
            citations = cleanLine.substring(10).trim();
            continue;
        } else if (cleanLine.toLowerCase().startsWith("confidence level:")) {
            currentSection = "confidence";
            const level = cleanLine.substring(17).trim();
            if (level.includes("High")) confidence = "High";
            else if (level.includes("Partial")) confidence = "Partial";
            else if (level.includes("Not Found")) confidence = "Not Found";
            continue;
        }

        if (currentSection === "answer") {
            answer += (answer ? "\n" : "") + trimmed;
        } else if (currentSection === "citations") {
            citations += (citations ? "\n" : "") + trimmed;
        } else if (currentSection === "confidence") {
            if (trimmed.includes("High")) confidence = "High";
            else if (trimmed.includes("Partial")) confidence = "Partial";
            else if (trimmed.includes("Not Found")) confidence = "Not Found";
        }
    }

    return {
        answer: answer.trim() || "This document does not contain that information.",
        citations: citations.trim() || "None",
        confidence: confidence
    };
}
