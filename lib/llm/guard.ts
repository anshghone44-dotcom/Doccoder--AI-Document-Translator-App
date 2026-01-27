import { openai } from "./client";

export interface GuardResult {
    refuse: boolean;
    message?: string;
    messages?: any[];
}

export function buildGuardedPrompt(userText: string, documentContext?: string): GuardResult {
    // Simple safety and relevance check logic
    // If the user text is too short or clearly malicious, we can refuse.

    const messages = [
        {
            role: "system",
            content: `You are a helpful assistant. Use the following document context to answer questions: ${documentContext || "No context provided."}`
        },
        {
            role: "user",
            content: userText
        }
    ];

    // For demonstration, we'll refuse if the question is "bad" (placeholder logic)
    if (userText.toLowerCase().includes("ignore previous instructions")) {
        return {
            refuse: true,
            message: "I cannot perform that action. Please stay on topic."
        };
    }

    return {
        refuse: false,
        messages
    };
}
