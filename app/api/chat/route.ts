import { generateGroundedResponse } from "@/lib/ai/reasoning";

export async function POST(req: Request) {
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

    return Response.json(response);
}
