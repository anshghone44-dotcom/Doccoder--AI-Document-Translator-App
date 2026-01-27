import { openai } from "@/lib/llm/client";

export async function speechToText(audio: File) {
    const transcript = await openai.audio.transcriptions.create({
        file: audio,
        model: "whisper-1",
    });

    return transcript.text;
}
