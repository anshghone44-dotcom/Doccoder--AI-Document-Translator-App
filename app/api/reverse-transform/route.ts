import type { NextRequest } from "next/server"
import { convertPdfToFormat } from "@/lib/convert-from-pdf"
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
    const targetFormat = (form.get("targetFormat") || "txt").toString() as "docx" | "txt" | "images"
    const aiModel = (form.get("aiModel") || "openai/gpt-4-mini").toString()
    const targetLanguage = (form.get("targetLanguage") || "en").toString()
    const languageFull = LANGUAGE_MAP[targetLanguage] || targetLanguage || "English"

    const files: File[] = []
    for (const [key, value] of form.entries()) {
      if (key === "files" && value instanceof File) {
        files.push(value)
      }
    }

    console.log("[v0] PDF files received:", files.length)
    console.log("[v0] Target format:", targetFormat)

    Logger.info("Files received for reverse transform", {
      requestId,
      fileCount: files.length,
      targetFormat,
      aiModel
    })

    if (files.length === 0) {
      Logger.warn("No PDF files provided", { requestId })
      return new Response("No PDF files provided.", { status: 400 })
    }

    // Validate that all files are PDFs
    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase()
      if (ext !== "pdf" && file.type !== "application/pdf") {
        return new Response(`File ${file.name} is not a PDF.`, { status: 400 })
      }
    }

    // Optional: Use AI to enhance the conversion based on prompt
    let conversionInstructions = ""
    if (prompt.trim()) {
      try {
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

            Logger.info("Selecting AI model for reverse directives", { requestId, requestedModel: model, mappedModel })

            if (model && (model.startsWith('anthropic') || model.startsWith('claude'))) {
              return anthropic(mappedModel)
            }
            return openai(mappedModel)
          } catch (err) {
            Logger.error("Failed to initialize model for reverse directives", err, { requestId, requestedModel: model })
            return openai("gpt-4o-mini")
          }
        }

        const finalModel = getFinalModel(aiModel)

        Logger.info("Requesting AI conversion instructions", { requestId })
        const { text } = await generateText({
          model: finalModel,
          prompt: `The user wants to convert PDF files to ${targetFormat} format.

User's technical goal: ${prompt}

CRITICAL: If the document contains text, ensure it is optimized for ${languageFull} linguistic patterns. If specific instructions are given, follow them with technical precision.

Provide a brief one-line technical directive for optimal architecture of the output.

Directive:`,
          temperature: 0.7,
        })
        conversionInstructions = text.trim()
        Logger.info("AI instructions generated successfully", { requestId, instructions: conversionInstructions })
      } catch (err: any) {
        Logger.error("AI instruction generation failed", err, { requestId })
      }
    }

    // Convert all PDF files
    const results = []
    for (const file of files) {
      try {
        Logger.info("Converting PDF", { requestId, filename: file.name })
        const { bytes, suggestedName, mimeType } = await convertPdfToFormat(file, {
          targetFormat,
          prompt: conversionInstructions,
        })
        results.push({ name: suggestedName, bytes, mimeType })
        Logger.info("PDF converted successfully", { requestId, filename: suggestedName })
      } catch (err: any) {
        Logger.error("Conversion error for file", err, { requestId, filename: file.name })
        return new Response(
          `Error converting ${file.name}: ${err.message || "Unknown error occurred"}. Please ensure the PDF is not encrypted or corrupted.`,
          { status: 500 },
        )
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
        "Content-Disposition": `attachment; filename="${encodeRFC5987("converted-files.zip")}"`,
      },
    })
  } catch (err: any) {
    Logger.error("Reverse transform API fatal error", err, { requestId })
    return new Response(`Internal server error: ${err?.message || "Unknown error"}`, { status: 500 })
  }
}

function encodeRFC5987(s: string) {
  return s.replace(/[^a-zA-Z0-9!#$&+.^_`|~-]/g, (c) => encodeURIComponent(c))
}
