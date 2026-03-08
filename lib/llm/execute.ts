import { generateText } from "ai";
import { getModelInstance } from "@/lib/ai/models";

export interface LLMMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface LLMOptions {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    system?: string;
}

/**
 * Single LLM execution function for all chatbot calls.
 * Centralizes configuration, SDK interaction, and deterministic safety settings.
 */
export async function runLLM(
    messages: LLMMessage[],
    options: LLMOptions = {}
): Promise<string> {
    const {
        model = "openai/gpt-4-mini",
        temperature = 0,
        max_tokens = 4096,
        system
    } = options;

    try {
        const modelInstance = getModelInstance(model);
        const lastMessage = messages[messages.length - 1]?.content || "";

        const { text } = await generateText({
            model: modelInstance,
            system: system || messages.find(m => m.role === "system")?.content,
            prompt: lastMessage,
            temperature,
        });

        return text || "I'm sorry, I couldn't generate a response.";
    } catch (error: any) {
        console.error(`[LLM Execution Error] [Model: ${model}]:`, error);

        // Fail-safe response to prevent hallucinations or system exposure
        if (error.status === 401) {
            throw new Error("AI configuration error: Invalid API key.");
        }

        return "I'm sorry, I encountered a technical issue while processing your request. Please try again later.";
    }
}
