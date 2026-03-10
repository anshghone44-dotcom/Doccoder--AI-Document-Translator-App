export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getModelInstance } from "@/lib/ai/models";
import { generateText } from "ai";

export const runtime = "edge";

export async function GET(req: NextRequest) {
    try {
        console.log("Gemini Test Started");

        // Check if Gemini API key is configured
        const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
        if (!geminiKey) {
            console.warn("[v0] Gemini API key not integrated");
            return NextResponse.json({
                success: false,
                error: "Gemini API key not intergrated properly. Please set GEMINI_API_KEY.",
                code: "MISSING_INTEGRATION"
            }, { status: 503 });
        }

        const model = getModelInstance("gemini-flash");

        const { text } = await generateText({
            model,
            prompt: "Say 'Edge Check Passed' if you can read this.",
        });

        return NextResponse.json({
            success: true,
            message: "Gemini Test Passed",
            response: text
        });
    } catch (error: any) {
        console.error("Gemini Test Failed:", error.message);

        // Provide specific error context
        const isAuthError = error.message?.includes("invalid_api_key") || error.message?.includes("API key");

        return NextResponse.json({
            success: false,
            error: error.message,
            hint: isAuthError ? "Check your Gemini API key integration (GEMINI_API_KEY)" : undefined
        }, { status: isAuthError ? 401 : 500 });
    }
}
