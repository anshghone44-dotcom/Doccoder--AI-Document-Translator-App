import { NextRequest, NextResponse } from "next/server";
import { getModelInstance } from "@/lib/ai/models";
import { generateText } from "ai";

export const runtime = "edge";

export async function GET(req: NextRequest) {
    try {
        console.log("Edge Runtime Gemini Test Started");

        const model = getModelInstance("google/gemini-flash");

        const { text } = await generateText({
            model,
            prompt: "Say 'Edge Check Passed' if you can read this.",
        });

        return NextResponse.json({
            success: true,
            message: "Edge Runtime Gemini Test Passed",
            response: text
        });
    } catch (error: any) {
        console.error("Edge Runtime Gemini Test Failed:", error.message);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
