import { openai } from "./client";

export async function runLLM(messages: any[]) {
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
}
