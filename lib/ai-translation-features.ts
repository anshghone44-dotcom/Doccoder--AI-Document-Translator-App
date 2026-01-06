import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export type TranslationTone = "formal" | "casual" | "legal" | "academic"
export type RewriteStyle = "professional" | "simple" | "creative"

export interface TranslationEnhancement {
  originalText: string
  translatedText: string
  explanation?: string
  summary?: string
  keyPoints?: string[]
  tone?: TranslationTone
}

/**
 * Explain a paragraph with context-aware translation
 */
export async function explainParagraph(
  text: string,
  targetLanguage: string,
  tone: TranslationTone = "formal",
): Promise<string> {
  try {
    const { text: explanation } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `Explain the following text in a ${tone} tone for translation to ${targetLanguage}.
      Provide a clear, concise explanation that helps understand the context and nuances:

      "${text}"

      Explanation:`,
      temperature: 0.7,
    })

    return explanation
  } catch (error) {
    console.error("[v0] Error explaining paragraph:", error)
    throw new Error("Failed to generate explanation")
  }
}

/**
 * Summarize a document or long text
 */
export async function summarizeDocument(text: string, maxLength = 200): Promise<string> {
  try {
    const { text: summary } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `Summarize the following document in approximately ${maxLength} words. 
      Focus on key points and main ideas:
      
      "${text}"
      
      Summary:`,
      temperature: 0.7,
    })

    return summary
  } catch (error) {
    console.error("[v0] Error summarizing document:", error)
    throw new Error("Failed to generate summary")
  }
}

/**
 * Extract key points from text
 */
export async function extractKeyPoints(text: string, maxPoints = 5): Promise<string[]> {
  try {
    const { text: response } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `Extract the ${maxPoints} most important key points from the following text.
      Return them as a numbered list:
      
      "${text}"
      
      Key Points:`,
      temperature: 0.7,
    })

    return response
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
  } catch (error) {
    console.error("[v0] Error extracting key points:", error)
    throw new Error("Failed to extract key points")
  }
}

/**
 * Rewrite text in a specific style
 */
export async function rewriteInStyle(text: string, style: RewriteStyle, targetLanguage: string): Promise<string> {
  const styleDescriptions = {
    professional: "professional and formal business language",
    simple: "simple, easy-to-understand language suitable for general audiences",
    creative: "creative and engaging language with vivid descriptions",
  }

  try {
    const { text: rewritten } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `Rewrite the following text in ${styleDescriptions[style]} for translation to ${targetLanguage}.
      Maintain the original meaning while adapting the tone and style:
      
      "${text}"
      
      Rewritten Text:`,
      temperature: 0.8,
    })

    return rewritten
  } catch (error) {
    console.error("[v0] Error rewriting text:", error)
    throw new Error("Failed to rewrite text")
  }
}

/**
 * Apply tone to translated text
 */
export async function applyToneToTranslation(
  originalText: string,
  translatedText: string,
  tone: TranslationTone,
  targetLanguage: string,
): Promise<string> {
  const toneDescriptions = {
    formal: "formal and professional",
    casual: "casual and conversational",
    legal: "legal and precise with proper terminology",
    academic: "academic and scholarly",
  }

  try {
    const { text: tonedTranslation } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `Adjust the following ${targetLanguage} translation to be ${toneDescriptions[tone]}.
      Keep the meaning intact but adjust the tone and word choice:
      
      Original: "${originalText}"
      Current Translation: "${translatedText}"
      
      Adjusted Translation:`,
      temperature: 0.7,
    })

    return tonedTranslation
  } catch (error) {
    console.error("[v0] Error applying tone:", error)
    throw new Error("Failed to apply tone to translation")
  }
}

/**
 * Generate comprehensive translation enhancement
 */
export async function enhanceTranslation(
  originalText: string,
  translatedText: string,
  tone: TranslationTone = "formal",
  targetLanguage = "Spanish",
): Promise<TranslationEnhancement> {
  try {
    const [explanation, summary, keyPoints] = await Promise.all([
      explainParagraph(originalText, targetLanguage, tone),
      summarizeDocument(originalText, 150),
      extractKeyPoints(originalText, 3),
    ])

    const tonedTranslation = await applyToneToTranslation(originalText, translatedText, tone, targetLanguage)

    return {
      originalText,
      translatedText: tonedTranslation,
      explanation,
      summary,
      keyPoints,
      tone,
    }
  } catch (error) {
    console.error("[v0] Error enhancing translation:", error)
    return {
      originalText,
      translatedText,
      tone,
    }
  }
}
