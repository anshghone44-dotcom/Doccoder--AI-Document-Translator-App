import { speechToText } from "@/lib/voice/stt";
import { textToSpeech } from "@/lib/voice/tts";
import { buildGuardedPrompt } from "@/lib/llm/guard";
import { runLLM } from "@/lib/llm/execute";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const audio = formData.get("audio") as File;
        const documentContext = formData.get("context") as string;

        if (!audio) {
            return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
        }

        // 1️⃣ Voice → Text
        console.log("[Orchestrator] Transcribing audio...");
        const userText = await speechToText(audio);
        console.log("[Orchestrator] Transcribed text:", userText);

        // 2️⃣ Guard
        console.log("[Orchestrator] Running guardrails...");
        const guard = buildGuardedPrompt(userText, documentContext);

        if (guard.refuse) {
            console.log("[Orchestrator] Prompt refused:", guard.message);
            const refusalAudio = await textToSpeech(guard.message || "I cannot perform that action.");
            return new Response(refusalAudio, {
                headers: { "Content-Type": "audio/mpeg" },
            });
        }

        // 3️⃣ LLM
        console.log("[Orchestrator] Executing LLM...");
        const answer = await runLLM(guard.messages || []);
        console.log("[Orchestrator] LLM Response complete.");

        // 4️⃣ Text → Voice
        console.log("[Orchestrator] Generating response audio...");
        const audioReply = await textToSpeech(answer);

        return new Response(audioReply, {
            headers: { "Content-Type": "audio/mpeg" },
        });
    } catch (error: any) {
        console.error("[Orchestrator] Error during orchestrated voice chat:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
