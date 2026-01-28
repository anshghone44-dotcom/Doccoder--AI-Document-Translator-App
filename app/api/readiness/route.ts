import { NextResponse } from "next/server";
import { isLLMReady } from "@/lib/ai/models";

export async function GET() {
    return NextResponse.json({
        ready: isLLMReady(),
        openai: !!process.env.OPENAI_API_KEY,
        elevenlabs: !!process.env.ELEVENLABS_API_KEY
    });
}
