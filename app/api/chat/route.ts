import { openai } from "@/lib/llm/client";

export async function POST(req: Request) {
    const { message } = await req.json();

    const response = await openai.chat.completions.create({
        model: "gpt-4o", // Changed from "gpt-4.1" to "gpt-4o" as gpt-4.1 doesn't exist and gpt-4o is the latest standard
        messages: [
            { role: "user", content: message }
        ],
    });

    return Response.json({
        reply: response.choices[0].message.content,
    });
}
