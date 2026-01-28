import { runLLM } from "@/lib/llm/execute";

export async function POST(req: Request) {
    const { message } = await req.json();

    const reply = await runLLM([
        { role: "user", content: message }
    ]);

    return Response.json({ reply });
}
