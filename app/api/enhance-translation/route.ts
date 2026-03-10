export const dynamic = "force-dynamic";
import { enhanceTranslation, type TranslationTone } from "@/lib/ai/ai-translation-features"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { originalText, translatedText, tone, targetLanguage } = await request.json()

    if (!originalText || !translatedText) {
      return NextResponse.json({ error: "Required fields in the app are missing" }, { status: 400 })
    }

    const enhancement = await enhanceTranslation(
      originalText,
      translatedText,
      (tone as TranslationTone) || "formal",
      targetLanguage || "Marathi",
    )

    return NextResponse.json(enhancement)
  } catch (error) {
    console.error("[v0] Translation enhancement error:", error)
    return NextResponse.json({ error: "Failed to enhance translation" }, { status: 500 })
  }
}
