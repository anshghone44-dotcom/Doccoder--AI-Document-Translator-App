import type { NextRequest } from "next/server"
import JSZip from "jszip"
import { convertAnyToPdf } from "@/lib/convert-to-pdf"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import mammoth from "mammoth"
import * as XLSX from "xlsx"

// Structured Logger Utility
const Logger = {
  info: (message: string, data?: any) => {
    console.log(JSON.stringify({ level: "INFO", timestamp: new Date().toISOString(), message, ...data }))
  },
  error: (message: string, error?: any, data?: any) => {
    console.error(JSON.stringify({
      level: "ERROR",
      timestamp: new Date().toISOString(),
      message,
      error: error?.message || error,
      stack: error?.stack,
      ...data
    }))
  },
  warn: (message: string, data?: any) => {
    console.warn(JSON.stringify({ level: "WARN", timestamp: new Date().toISOString(), message, ...data }))
  }
}

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

function extractSimplePdfText(u8: Uint8Array): string {
  const content = new TextDecoder("ascii").decode(u8)
  const matches = content.match(/\((.*?)\)/g)
  if (!matches) return ""
  return matches
    .map((m) => m.slice(1, -1))
    .filter((s) => s.length > 2)
    .join(" ")
    .replace(/\\/g, "")
}

export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)
  const startTime = Date.now()

  Logger.info("Transform API request started", { requestId })

  const form = await req.formData()
  const prompt = (form.get("prompt") || "").toString()
  const aiModel = (form.get("aiModel") || "openai/gpt-4-mini").toString()
  const baseLanguage = (form.get("targetLanguage") || "en").toString()

  // Detect if user explicitly requested a language in the prompt (handles typos like "trabslate")
  let targetLanguage = baseLanguage
  try {
    const { text: detectedCode } = await generateText({
      model: getFinalModel(aiModel),
      prompt: `Analyze the user's transformation prompt: "${prompt}"
      The user's current interface language is set to "${LANGUAGE_MAP[baseLanguage] || baseLanguage}".
      
      Does the user explicitly request a specific target language for translation in their prompt? 
      (Example: "translate to Marathi", "convert to French", "trabslate to Spanish")
      
      If yes, return ONLY the ISO 639-1 code for that language.
      If no, or if they just say "translate" without a language, return "${baseLanguage}".
      
      ONLY return the 2-letter code (e.g. 'mr', 'hi', 'fr', 'es'). No other text.`,
      temperature: 0,
    })
    const cleaned = detectedCode.trim().toLowerCase()
    if (cleaned.length === 2 && LANGUAGE_MAP[cleaned]) {
      targetLanguage = cleaned
      Logger.info("Overriding target language from prompt", { requestId, baseLanguage, targetLanguage })
    }
  } catch (err) {
    Logger.warn("Language detection failed, using base language", { requestId, err: (err as any).message })
  }

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

  Logger.info("Files received for processing", {
    requestId,
    fileCount: files.length,
    filenames: files.map(f => f.name),
    aiModel,
    targetLanguage
  })

  if (files.length === 0) {
    Logger.warn("No files provided in request", { requestId })
    return new Response("No files provided.", { status: 400 })
  }

  function getFinalModel(requestedModel: string) {
    try {
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

      Logger.info("Selecting AI model", { requestedModel, mappedModel })

      if (requestedModel && (requestedModel.startsWith('anthropic') || requestedModel.startsWith('claude'))) {
        return anthropic(mappedModel)
      }
      return openai(mappedModel)
    } catch (err) {
      Logger.error("Failed to initialize AI model, defaulting to gpt-4o-mini", err, { requestedModel })
      return openai("gpt-4o-mini")
    }
  }

  async function getCoverLineFor(filename: string, languageCode: string) {
    if (!prompt.trim()) return undefined

    const languageFull = LANGUAGE_MAP[languageCode] || languageCode || "English"
    const startTime = Date.now()

    try {
      Logger.info("Requesting AI title generation", { filename, aiModel, languageFull })

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

      Logger.info("AI title generated successfully", {
        filename,
        durationMs: Date.now() - startTime,
        title: single
      })

      return single || undefined
    } catch (err: any) {
      Logger.error("AI title generation failed", err, { filename, aiModel })
      return undefined
    }
  }

  async function translateContent(text: string, targetLanguage: string) {
    if (!text || !text.trim()) return text
    const startTime = Date.now()

    try {
      const languageFull = LANGUAGE_MAP[targetLanguage] || targetLanguage || "English"

      Logger.info("Requesting AI content translation", {
        preferredLanguage: languageFull,
        aiModel,
        textSnippet: text.slice(0, 50) + "..."
      })

      const { text: translated } = await generateText({
        model: getFinalModel(aiModel),
        prompt: `You are the System Intelligence Core. Execute linguistic synchronization.
        
        USER GOAL: ${prompt}
        TARGET LANGUAGE: ${languageFull}

        CRITICAL: Maintain absolute technical precision. If the user's prompt contains typos (e.g. "trabslate"), interpret them correctly as transformation directives.
        
        Return ONLY the translated/processed text.

        TEXT OBJECT:
        ${text.slice(0, 15000)}

        SYNCHRONIZED OUTPUT:`,
        temperature: 0.3,
      })

      Logger.info("AI content translation successful", {
        durationMs: Date.now() - startTime,
        translatedSnippet: translated.slice(0, 50) + "..."
      })

      return translated
    } catch (err) {
      Logger.error("AI content translation failed", err, { aiModel, targetLanguage })
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
      } else if (ext === "pdf") {
        const text = extractSimplePdfText(u8)
        if (text) {
          processedContent = await translateContent(text, targetLanguage)
        }
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
      Logger.info("File processed successfully", { requestId, filename: finalName })
    } catch (err: any) {
      Logger.error("Processing error for file", err, { requestId, filename: f.name })
      return new Response(`Error processing ${f.name}: ${err?.message || "Unknown error"}`, { status: 500 })
    }
  }

  async function generateSuccessMessage(targetLanguage: string) {
    const languageFull = LANGUAGE_MAP[targetLanguage] || targetLanguage || "English"
    const startTime = Date.now()

    try {
      Logger.info("Requesting AI success message generation", { targetLanguage, aiModel })
      const { text } = await generateText({
        model: getFinalModel(aiModel),
        prompt: `You are the System Intelligence Core. Generate a concise, technical success confirmation in ${languageFull} verifying that the document transformation and synchronization is complete.
        
        CONTEXT: 
        - Target Language: ${languageFull}
        - User Prompt: "${prompt}"
        
        CRITICAL: You MUST respond EXCLUSIVELY in ${languageFull}. 
        
        Style: Sterile, professional, system-grade technical terminology.
        Length: Under 120 characters. 
        Return ONLY the message text.`,
        temperature: 0.7,
      })

      const message = text.trim()
      Logger.info("AI success message generated successfully", {
        durationMs: Date.now() - startTime,
        message
      })
      return message
    } catch (err) {
      Logger.warn("AI success message generation failed, using default", { err: (err as any).message })
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

  Logger.info("Transform API request completed successfully", {
    requestId,
    durationMs: Date.now() - startTime,
    resultCount: results.length
  })

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
