import { NextRequest, NextResponse } from "next/server";
import { generateGroundedResponse } from "@/lib/ai/reasoning";
import { Logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
    const requestId = Math.random().toString(36).substring(7);

    try {
        const {
            query,
            context,
            language,
            mode,
            model,
            messages
        } = await req.json();

        const response = await generateGroundedResponse(query, context, {
            language,
            mode,
            model,
            messages
        });

        return NextResponse.json(response);
    } catch (error: any) {
        Logger.error("Chat API: Fatal exception", error, { requestId });
        return NextResponse.json({
            error: "Intelligence engine breakdown",
            message: `The reasoning engine encountered a fatal error: ${error.message}`
        }, { status: 500 });
    }
}
