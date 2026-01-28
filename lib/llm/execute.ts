import { openai } from "./client";

/**
 * Runs the LLM with strict settings for deterministic results.
 * Temperature is set to 0 to prevent hallucinations and ensure consistency.
 */
export async function runLLM(messages: any[]) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages,
            temperature: 0, // Ensure deterministic results
        });

        return response.choices[0].message.content || "I'm sorry, I couldn't find an answer to that.";
    } catch (error: any) {
        console.error("[LLM Execution] Error:", error);
        return "I'm sorry, I encountered an error while trying to read the document.";
    }
}
