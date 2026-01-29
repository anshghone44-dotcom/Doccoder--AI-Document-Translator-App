export const runtime = "nodejs"

export async function GET() {
    return new Response(
        JSON.stringify({
            status: "ok",
            openaiKeyPresent: !!process.env.OPENAI_API_KEY,
            environment: process.env.VERCEL_ENV || "local"
        }),
        {
            headers: { "Content-Type": "application/json" }
        }
    );
}
