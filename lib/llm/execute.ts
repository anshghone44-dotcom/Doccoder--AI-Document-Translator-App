import { openai } from "./client";

export interface LLMMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface LLMOptions {
    model?: string;
    temperature?: number;
    max_tokens?: number;
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
        model = "gpt-4o",
        temperature = 0,
        max_tokens = 4096
    } = options;

    try {
        const response = await openai.chat.completions.create({
            model,
            messages,
            temperature,
            max_tokens,
        });

        return response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
    } catch (error: any) {
        console.error(`[LLM Execution Error] [Model: ${model}]:`, error);

        // Fail-safe response to prevent hallucinations or system exposure
        if (error.status === 401) {
            throw new Error("AI configuration error: Invalid API key.");
        }

        return "I'm sorry, I encountered a technical issue while processing your request. Please try again later.";
    }
}
