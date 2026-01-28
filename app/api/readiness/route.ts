export async function GET() {
    return Response.json({
        status: "ok",
        openaiKeyPresent: !!process.env.OPENAI_API_KEY,
        environment: process.env.VERCEL_ENV || "local"
    });
}
