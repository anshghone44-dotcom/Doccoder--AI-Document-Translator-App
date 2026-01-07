import type { NextRequest } from "next/server"
import JSZip from "jszip"
import { convertAnyToPdf } from "@/lib/convert-to-pdf"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import mammoth from "mammoth"
import * as XLSX from "xlsx"

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

  function getFinalModel(requestedModel: string) {
    const modelMapping: Record<string, string> = {
      "openai/gpt-5": "gpt-4o",
      "xai/grok-4": "gpt-4o",
      "anthropic/claude-4.1": "claude-3-5-sonnet-latest",
      "openai/gpt-4-mini": "gpt-4o-mini",
      "xai/grok-3": "gpt-4o",
      "anthropic/claude-3.1": "claude-3-5-haiku-20241022"
    }

    const modelId = requestedModel && requestedModel.includes('/') ? requestedModel.split('/')[1] : (requestedModel || "gpt-4o-mini")
    const mappedModel = modelMapping[requestedModel] || modelId

    if (requestedModel && (requestedModel.startsWith('anthropic') || requestedModel.startsWith('claude'))) {
      return anthropic(mappedModel)
    }
    return openai(mappedModel)
  }

  async function getCoverLineFor(filename: string, languageCode: string) {
    if (!prompt.trim()) return undefined

    const languageFull = LANGUAGE_MAP[languageCode] || languageCode || "English"

    try {
      console.log("[v0] Generating AI title for:", filename, "using model:", aiModel)

      const { text } = await generateText({
        model: getFinalModel(aiModel),
        prompt: `Create a technically precise, concise one-line title for the document "${filename}".

User's requested transformation goal: ${prompt}

CRITICAL: If the user explicitly mentions a target language in their goal (e.g. "translate to Marathi"), prioritize that language. Otherwise, return the title in ${languageFull}.

Guidelines:
- Use professional, system-grade technical terminology.
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

  async function translateContent(text: string, targetLanguage: string) {
    if (!text || !text.trim()) return text

    try {
      const languageFull = LANGUAGE_MAP[targetLanguage] || targetLanguage || "English"

      console.log("[v0] Translating content. Preferred lang:", languageFull)

      const { text: translated } = await generateText({
        model: getFinalModel(aiModel),
        prompt: `You are a high-performance technical translation node. Translate the following data.
        
        USER GOAL: ${prompt}
        TARGET LANGUAGE PREFERENCE: ${languageFull}

        CRITICAL: If the user's goal specifies a language (e.g. "translate to Marathi"), use that. Otherwise use the preference: ${languageFull}.

        Return ONLY the translated text. Maintain formatting and technical accuracy.

        TEXT TO TRANSLATE:
        ${text.slice(0, 15000)}

        TRANSLATION:`,
        temperature: 0.3,
      })

      return translated
    } catch (err) {
      console.error("[v0] Translation failed:", err)
      return text
    }
  }

  // Convert all files
  const results = []
  for (const f of files) {
    try {
      console.log("[v0] Processing file:", f.name)
      const ext = (f.name.split(".").pop() || "").toLowerCase()
      const arrayBuffer = await f.arrayBuffer()
      const u8 = new Uint8Array(arrayBuffer)

      let processedContent: string | undefined
      let type: "text" | "pdf" | "image" = "text"

      // Handle translation before PDF generation
      if (ext === "docx") {
        const { value: rawText } = await mammoth.extractRawText({ arrayBuffer })
        processedContent = await translateContent(rawText, targetLanguage)
      } else if (ext === "xlsx" || ext === "xls" || ext === "csv") {
        const wb = XLSX.read(u8, { type: "array" })
        let combined = ""
        wb.SheetNames.forEach((sheetName, idx) => {
          const sheet = wb.Sheets[sheetName]
          const csv = XLSX.utils.sheet_to_csv(sheet)
          combined += `Sheet ${idx + 1}: ${sheetName}\n\n${csv}\n\n`
        })
        processedContent = await translateContent(combined, targetLanguage)
      } else if (["txt", "md", "markdown", "html"].includes(ext)) {
        const text = new TextDecoder("utf-8").decode(u8)
        processedContent = await translateContent(text, targetLanguage)
      }

      const coverLine = await getCoverLineFor(f.name, targetLanguage)

      // Conversion with translated content if available
      const { bytes, suggestedName } = await convertAnyToPdf({
        name: f.name,
        type: f.type,
        arrayBuffer: async () => arrayBuffer,
        contentOverride: processedContent
      }, {
        coverLine,
        templateId: template.id,
        orientation: template.orientation,
        margin: typeof template.margin === "number" ? template.margin : undefined,
      })

      const langSuffix = targetLanguage !== "en" ? ` (${LANGUAGE_MAP[targetLanguage] || targetLanguage})` : ""
      const finalName = suggestedName.replace(".pdf", `${langSuffix}.pdf`)

      results.push({ name: finalName, bytes })
      console.log("[v0] File processed successfully:", finalName)
    } catch (err: any) {
      console.error("[v0] processing error for", f.name, ":", err?.message || err)
      return new Response(`Error processing ${f.name}: ${err?.message || "Unknown error"}`, { status: 500 })
    }
  }

  async function generateSuccessMessage(targetLanguage: string) {
    const languageFull = LANGUAGE_MAP[targetLanguage] || targetLanguage || "English"
    try {
      const { text } = await generateText({
        model: getFinalModel(aiModel),
        prompt: `Generate a concise, technical success confirmation in ${languageFull} verifying that the data object has been successfully synchronized and processed.
        
        CRITICAL: If the user's prompt "${prompt}" asked for a specific language translation, provide this confirmation in that language.
        
        Keep it under 150 characters. Return ONLY the message text.`,
        temperature: 0.7,
      })
      return text.trim()
    } catch {
      return `Document processing complete. The output has been generated.`
    }
  }

  const assistantMessage = await generateSuccessMessage(targetLanguage)

  // If single file, return PDF directly
  if (results.length === 1) {
    const single = results[0]
    return new Response(single.bytes as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeRFC5987(single.name)}"`,
        "X-Assistant-Message": encodeURIComponent(assistantMessage),
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
      "X-Assistant-Message": encodeURIComponent(assistantMessage),
    },
  })
}

function encodeRFC5987(s: string) {
  // Simple filename encoder for Content-Disposition header
  return s.replace(/[^a-zA-Z0-9!#$&+.^_`|~-]/g, (c) => encodeURIComponent(c))
}
