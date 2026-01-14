import type { NextRequest } from "next/server"
import { convertPdfToFormat } from "@/lib/convert-from-pdf"
import { extractPdfContent, formatExtractedContent } from "@/lib/pdf-ocr-processor"
import JSZip from "jszip"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { Logger } from "@/lib/logger"

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
  const requestId = Math.random().toString(36).substring(7)
  const startTime = Date.now()

  Logger.info("Reverse transform API request started", { requestId })

  try {
    const form = await req.formData()
    const prompt = (form.get("prompt") || "").toString()
    const rawFormat = (form.get("targetFormat") || "txt").toString()
    const aiModel = (form.get("aiModel") || "openai/gpt-4-mini").toString()
    const targetLanguage = (form.get("targetLanguage") || "en").toString()
    const languageFull = LANGUAGE_MAP[targetLanguage] || targetLanguage || "English"

    // SAFE WORKFLOW - Step 1: Validate Backend Capabilities
    const SUPPORTED_FORMATS = ["docx", "txt", "images", "csv", "xlsx", "pptx", "json", "xml", "md", "rtf"]
    const targetFormat = rawFormat as any

    if (!SUPPORTED_FORMATS.includes(targetFormat)) {
      Logger.warn("Unsupported reverse transform format requested", { requestId, targetFormat })
      return new Response(JSON.stringify({
        error: "Limitation detected",
        message: `System capability restricted: Decomposition to '${targetFormat}' is not currently available in this environment.`,
        code: "UNSUPPORTED_FORMAT"
      }), { status: 400, headers: { "Content-Type": "application/json" } })
    }

    const files: File[] = []
    for (const [key, value] of form.entries()) {
      if (key === "files" && value instanceof File) {
        files.push(value)
      }
    }

    Logger.info("Files received for reverse transform", {
      requestId,
      fileCount: files.length,
      targetFormat,
      aiModel
    })

    if (files.length === 0) {
      Logger.warn("No PDF files provided", { requestId })
      return new Response(JSON.stringify({
        error: "Invalid Request",
        message: "No document objects provided for reverse transformation."
      }), { status: 400, headers: { "Content-Type": "application/json" } })
    }

    // Validate that all files are PDFs
    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase()
      if (ext !== "pdf" && file.type !== "application/pdf") {
        return new Response(JSON.stringify({
          error: "Invalid Request",
          message: `Technical restriction: '${file.name}' is not in a format compatible with reverse transformation (PDF required).`,
          code: "INVALID_SOURCE_FORMAT"
        }), { status: 400, headers: { "Content-Type": "application/json" } })
      }
    }

    // AI Logic for individual file transformation
    const getFinalModel = (model: string) => {
      try {
        const modelMapping: Record<string, string> = {
          "openai/gpt-5": "gpt-4o",
          "xai/grok-4": "gpt-4o",
          "anthropic/claude-4.1": "claude-3-5-sonnet-latest",
          "openai/gpt-4-mini": "gpt-4o-mini",
        }

        const modelId = model && model.includes('/') ? model.split('/')[1] : (model || "gpt-4o-mini")
        const mappedModel = modelMapping[model] || modelId

        if (model && (model.startsWith('anthropic') || model.startsWith('claude'))) {
          return anthropic(mappedModel)
        }
        return openai(mappedModel)
      } catch (err) {
        return openai("gpt-4o-mini")
      }
    }

    const finalModel = getFinalModel(aiModel)

    // Convert all PDF files
    const results = []
    for (const file of files) {
      try {
        Logger.info("Executing reverse transformation and synthesis", { requestId, filename: file.name })

        const arrayBuffer = await file.arrayBuffer()
        const content = await extractPdfContent(arrayBuffer, file.name)
        let extractedText = formatExtractedContent(content)

        // If a prompt is provided, transform the extracted text using AI
        if (prompt.trim()) {
          Logger.info("Applying AI transformation directive", { requestId, prompt })
          const { text: transformed } = await generateText({
            model: finalModel,
            prompt: `You are the Doccoder AI Assistant. Execute a technical transformation on the following extracted document text.
             
             USER DIRECTIVE: ${prompt}
             OUTPUT FORMAT: ${targetFormat}
             TARGET LANGUAGE: ${languageFull}

             INSTRUCTIONS:
             1. EXECUTE THE USER DIRECTIVE WITH ABSOLUTE PRIORITY. 
             2. If the user asks for a summary, extract specific data (like names/dates), or change the tone, do so with precision.
             3. Deliver the final content in ${languageFull}.
             4. Preserve any tabular or structured data if compatible with the directive.
             5. Return ONLY the transformed text. No preamble.

             EXTRACTED TEXT:
             ${extractedText.slice(0, 20000)}

             TRANSFORMED OUTPUT:`,
            temperature: 0.3,
          })
          extractedText = transformed.trim()
        }

        const { bytes, suggestedName, mimeType } = await convertPdfToFormat(file, {
          targetFormat,
          textOverride: extractedText,
        })

        // SAFE WORKFLOW check: Ensure we didn't just get the same PDF back (if not explicitly requested)
        if (mimeType === "application/pdf" && targetFormat !== "pdf") {
          throw new Error("Transformation engine failed to generate new format buffer.")
        }

        results.push({ name: suggestedName, bytes, mimeType })
        Logger.info("Reverse transformation successful", { requestId, filename: suggestedName })
      } catch (err: any) {
        Logger.error("Processing sequence interrupted", err, { requestId, filename: file.name })
        return new Response(JSON.stringify({
          error: "Processing Interrupt",
          message: `System encountered a technical barrier while decomposing '${file.name}': ${err?.message || "Internal operation failed."}`,
          code: "PROCESS_INTERRUPT"
        }), { status: 500, headers: { "Content-Type": "application/json" } })
      }
    }

    // If single file, return directly
    if (results.length === 1) {
      const single = results[0]
      return new Response(single.bytes as any, {
        headers: {
          "Content-Type": single.mimeType,
          "Content-Disposition": `attachment; filename="${encodeRFC5987(single.name)}"`,
        },
      })
    }

    // Multiple files: create ZIP
    const zip = new JSZip()
    for (const r of results) {
      zip.file(r.name, r.bytes)
    }
    const zipped = await zip.generateAsync({ type: "uint8array" })

    Logger.info("Reverse transform API completed successfully", {
      requestId,
      durationMs: Date.now() - startTime,
      resultCount: results.length
    })

    return new Response(zipped as any, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${encodeRFC5987("converted-data.zip")}"`,
      },
    })
  } catch (err: any) {
    Logger.error("Reverse transform API fatal error", err, { requestId })
    return new Response(JSON.stringify({
      error: "System Fault",
      message: `Critical interrupt in transformation pipe: ${err?.message || "Internal environment breakdown."}`,
      code: "SYSTEM_FAULT"
    }), { status: 500, headers: { "Content-Type": "application/json" } })
  }
}

function encodeRFC5987(s: string) {
  return s.replace(/[^a-zA-Z0-9!#$&+.^_`|~-]/g, (c) => encodeURIComponent(c))
}
