export const dynamic = "force-dynamic";
export async function GET() {
    return Response.json({
        status: "ok",
        openaiKeyPresent: !!process.env.GEMINI_API_KEY,
        vercelTokenPresent: !!process.env.VERCEL_TOKEN,
        environment: process.env.VERCEL_ENV || "local"
    });
}
