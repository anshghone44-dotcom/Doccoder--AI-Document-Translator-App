export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getModelInstance } from "@/lib/ai/models";
import { generateText } from "ai";

export const runtime = "edge";

export async function GET(req: NextRequest) {
    try {
        console.log("Edge Runtime Gemini Test Started");
        
        // Check if Gemini API key is configured
        const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
        if (!geminiKey) {
            console.warn("[v0] Gemini API key not configured");
            return NextResponse.json({
                success: false,
                error: "Gemini API key not configured. Please set GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY.",
                code: "MISSING_CONFIG"
            }, { status: 503 });
        }

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
        
        // Provide specific error context
        const isAuthError = error.message?.includes("invalid_api_key") || error.message?.includes("API key");
        
        return NextResponse.json({
            success: false,
            error: error.message,
            hint: isAuthError ? "Check your Gemini API key configuration (GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY)" : undefined
        }, { status: isAuthError ? 401 : 500 });
    }
}
