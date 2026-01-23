import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { xai } from "@ai-sdk/xai";
import { getGroundedPrompt } from "./prompts";
import { Logger } from "@/lib/logger";

export type GroundedResponse = {
    answer: string;
    citations: string;
    confidence: "High" | "Partial" | "Not Found";
};

export type ReasoningMode = 'strict' | 'explainer' | 'summary';

export interface ReasoningOptions {
    model: string;
    language: string;
    mode: ReasoningMode;
    messages?: { role: "user" | "assistant"; content: string }[];
}

/**
 * Generates a document-grounded response following mandatory protocols.
 */
export async function generateGroundedResponse(
    query: string,
    context: string,
    options: ReasoningOptions
): Promise<GroundedResponse> {
    const requestId = Math.random().toString(36).substring(7);

    Logger.info("Reasoning engine: Generating grounded response", {
        requestId,
        model: options.model,
        mode: options.mode,
        contextLength: context.length,
        historyLength: options.messages?.length || 0
    });

    try {
        const finalModel = getModelInstance(options.model);
        const systemPrompt = getGroundedPrompt(options.mode, options.language);

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
${context}

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

/**
 * Instantiates the appropriate provider model based on requested string.
 */
function getModelInstance(modelId: string) {
    const mapping: Record<string, string> = {
        "openai/gpt-5": "gpt-4o",
        "xai/grok-4": "gpt-4o",
        "anthropic/claude-4.1": "claude-3-5-sonnet-latest",
        "openai/gpt-4-mini": "gpt-4o-mini",
        "xai/grok-3": "gpt-4o",
        "anthropic/claude-3.1": "claude-3-5-haiku-20241022"
    };

    const requested = modelId || "openai/gpt-4-mini";
    const provider = requested.split('/')[0];
    const actualModel = mapping[requested] || requested.split('/')[1] || "gpt-4o-mini";

    if (provider === 'anthropic' || actualModel.startsWith('claude')) {
        return anthropic(actualModel);
    }
    if (provider === 'xai' || actualModel.startsWith('grok')) {
        return xai(actualModel);
    }
    return openai(actualModel);
}
