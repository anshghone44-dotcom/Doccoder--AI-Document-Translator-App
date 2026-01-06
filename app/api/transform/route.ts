import type { NextRequest } from "next/server"
import JSZip from "jszip"
import { convertAnyToPdf } from "@/lib/convert-to-pdf"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"

export const maxDuration = 60

const LANGUAGE_MAP: Record<string, string> = {
  bn: "Bengali",
  zh: "Chinese (Simplified)",
  da: "Danish",
  nl: "Dutch",
  en: "English (United States)",
  "en-GB": "English (United Kingdom)",
  "en-IN": "English (India)",
  et: "Estonian",
  fil: "Filipino",
  fi: "Finnish",
  "fr-CA": "French (Canada)",
  "fr-FR": "French (France)",
  de: "German",
  el: "Greek",
  gu: "Gujarati",
  hi: "Hindi",
  it: "Italian",
  ja: "Japanese",
  ko: "Korean",
  mr: "Marathi",
  fa: "Persian",
  pt: "Portuguese",
  ru: "Russian",
  es: "Spanish",
  ta: "Tamil",
  te: "Telugu",
  tr: "Turkish",
  vi: "Vietnamese",
}

export async function POST(req: NextRequest) {
  console.log("[v0] Transform API called")

  const form = await req.formData()
  const prompt = (form.get("prompt") || "").toString()
  const aiModel = (form.get("aiModel") || "openai/gpt-4-mini").toString()
  const targetLanguage = (form.get("targetLanguage") || "en").toString()

  // Parse template selection
  let template: {
    id?: "minimal" | "professional" | "photo"
    orientation?: "portrait" | "landscape"
    margin?: number
  } = {}
  try {
    const raw = form.get("template")
    if (typeof raw === "string") {
      template = JSON.parse(raw)
    }
  } catch {
    // ignore malformed template
  }

  const files: File[] = []
  for (const [key, value] of form.entries()) {
    if (key === "files" && value instanceof File) {
      files.push(value)
    }
  }

  console.log("[v0] Files received:", files.length)

  if (files.length === 0) {
    return new Response("No files provided.", { status: 400 })
  }

  async function getCoverLineFor(filename: string, languageCode: string) {
    if (!prompt.trim()) return undefined

    const languageFull = LANGUAGE_MAP[languageCode] || languageCode || "English"

    try {
      console.log("[v0] Generating AI title for:", filename, "using model:", aiModel)

      const modelMapping: Record<string, string> = {
        "openai/gpt-5": "gpt-4o",
        "xai/grok-4": "gpt-4o",
        "anthropic/claude-4.1": "claude-3-5-sonnet-latest",
        "openai/gpt-4-mini": "gpt-4o-mini",
        "xai/grok-3": "gpt-4o",
        "anthropic/claude-3.1": "claude-3-5-haiku-20241022"
      }

      const modelId = aiModel && aiModel.includes('/') ? aiModel.split('/')[1] : (aiModel || "gpt-4o-mini")
      const mappedModel = modelMapping[aiModel] || modelId
      const finalModel = aiModel && aiModel.startsWith('anthropic') ? anthropic(mappedModel) : openai(mappedModel)

      const { text } = await generateText({
        model: finalModel,
        prompt: `Create a technically precise, concise one-line title for the document "${filename}".

User's goal for this document: ${prompt}

CRITICAL: Return the title ENTIRELY in ${languageFull}.

Guidelines:
- Analyze the document purpose and content architecture.
- Use professional, enterprise-grade terminology.
- Keep the title descriptive yet under 60 characters.
- Return ONLY the title text. No quotes.

Title:`,
        temperature: 0.7,
      })
      const single = text.split("\n").filter(Boolean)[0]?.trim()
      console.log("[v0] AI title generated:", single)
      return single || undefined
    } catch (err: any) {
      console.error("[v0] AI title generation failed:", err?.message || err)
      return undefined
    }
  }

  // Convert all files
  const results = []
  for (const f of files) {
    try {
      console.log("[v0] Converting file:", f.name)
      const coverLine = await getCoverLineFor(f.name, targetLanguage)
      // Pass through template options
      const { bytes, suggestedName } = await convertAnyToPdf(f, {
        coverLine,
        templateId: template.id,
        orientation: template.orientation,
        margin: typeof template.margin === "number" ? template.margin : undefined,
      })
      results.push({ name: suggestedName, bytes })
      console.log("[v0] File converted successfully:", suggestedName)
    } catch (err: any) {
      console.error("[v0] Conversion error for", f.name, ":", err?.message || err)
      return new Response(`Error converting ${f.name}: ${err?.message || "Unknown error"}`, { status: 500 })
    }
  }

  // If single file, return PDF directly
  if (results.length === 1) {
    const single = results[0]
    return new Response(single.bytes as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeRFC5987(single.name)}"`,
      },
    })
  }

  // Otherwise zip them
  const zip = new JSZip()
  for (const r of results) {
    zip.file(r.name, r.bytes)
  }
  const zipped = await zip.generateAsync({ type: "uint8array" })
  return new Response(zipped as any, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${encodeRFC5987("transformed-pdfs.zip")}"`,
    },
  })
}

function encodeRFC5987(s: string) {
  // Simple filename encoder for Content-Disposition header
  return s.replace(/[^a-zA-Z0-9!#$&+.^_`|~-]/g, (c) => encodeURIComponent(c))
}
