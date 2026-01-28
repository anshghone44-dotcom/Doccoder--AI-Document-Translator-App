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

        // 0️⃣ Validation
        if (!audio) {
            return NextResponse.json({ error: "Missing audio data" }, { status: 400 });
        }

        // 1️⃣ Voice → Text
        console.log("[Voice Orchestrator] Converting speech to text...");
        let userText;
        try {
            userText = await speechToText(audio);
        } catch (err) {
            console.error("[Voice Orchestrator] STT Error:", err);
            // Fail safely with voice feedback
            const errorAudio = await textToSpeech("I'm sorry, I couldn't understand the audio. Please try speaking clearer.");
            return new Response(errorAudio, { headers: { "Content-Type": "audio/mpeg" } });
        }

        if (!userText || userText.trim().length === 0) {
            const errorAudio = await textToSpeech("I didn't hear anything. Could you please repeat that?");
            return new Response(errorAudio, { headers: { "Content-Type": "audio/mpeg" } });
        }

        console.log("[Voice Orchestrator] User input:", userText);

        // 2️⃣ Guard: Strictly Document-Only
        console.log("[Voice Orchestrator] Applying guardrails...");
        const guard = buildGuardedPrompt(userText, documentContext);

        if (guard.refuse) {
            console.log("[Voice Orchestrator] Request refused:", guard.message);
            const refusalAudio = await textToSpeech(guard.message || "I cannot answer that.");
            return new Response(refusalAudio, { headers: { "Content-Type": "audio/mpeg" } });
        }

        // 3️⃣ LLM: Deterministic answer (Temperature 0)
        console.log("[Voice Orchestrator] Running LLM inference...");
        const answer = await runLLM(guard.messages || []);
        console.log("[Voice Orchestrator] LLM output:", answer);

        // 4️⃣ Text → Voice: High-speed TTS
        console.log("[Voice Orchestrator] Converting response to speech...");
        const audioReply = await textToSpeech(answer);

        console.log("[Voice Orchestrator] Orchestration complete.");
        return new Response(audioReply, {
            headers: { "Content-Type": "audio/mpeg" },
        });

    } catch (error: any) {
        console.error("[Voice Orchestrator] Critical System Fault:", error);
        // Ultimate safety valve
        try {
            const fallbackAudio = await textToSpeech("I'm sorry, my voice system is having some technical difficulties right now.");
            return new Response(fallbackAudio, { headers: { "Content-Type": "audio/mpeg" } });
        } catch {
            return NextResponse.json({ error: "Critical interrupt" }, { status: 500 });
        }
    }
}
