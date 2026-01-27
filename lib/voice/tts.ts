import { openai } from "@/lib/llm/client";

export async function textToSpeech(text: string) {
    const audio = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: text,
    });

    return Buffer.from(await audio.arrayBuffer());
}
