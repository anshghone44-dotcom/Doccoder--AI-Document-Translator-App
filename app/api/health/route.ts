export const runtime = "nodejs"

export async function GET() {
    console.log("ENV TEST:", {
        key: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 5)}...` : "not found",
        exists: !!process.env.OPENAI_API_KEY
    })
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
