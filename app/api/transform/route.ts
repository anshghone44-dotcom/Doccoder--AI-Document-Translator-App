import type { NextRequest } from "next/server"
import JSZip from "jszip"
import { extractPdfContent, formatExtractedContent } from "@/lib/parsing/pdf-ocr-processor"
import { convertAnyToPdf } from "@/lib/parsing/convert-to-pdf"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { xai } from "@ai-sdk/xai"
import mammoth from "mammoth"
import * as XLSX from "xlsx"
import { build_excel, build_docx } from "@/lib/parsing/document-generators"
import type { PipelineOutput } from "@/lib/parsing/document-generators"
import { build_pdf, stripExt } from "@/lib/parsing/convert-to-pdf"

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

/**
 * Splits text into chunks and processes them with the provided function.
 */
async function processInChunks(text: string, chunkSize: number, processFn: (chunk: string) => Promise<string>): Promise<string> {
  if (!text) return ""
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize))
  }

  const results = await Promise.all(chunks.map(chunk => processFn(chunk)))
  return results.join("\n")
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


export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)
  const startTime = Date.now()

  try {
    Logger.info("Transform API request started", { requestId })

    const form = await req.formData()
    const prompt = (form.get("prompt") || "").toString()
    const aiModel = (form.get("aiModel") || "openai/gpt-4-mini").toString()
    const baseLanguage = (form.get("targetLanguage") || "en").toString()

    // Validate API Keys base on model
    const modelProvider = aiModel?.split('/')[0] || 'openai'
    if (modelProvider === 'openai') {
      const key = process.env.OPENAI_API_KEY
      if (!key) {
        return new Response(JSON.stringify({
          error: "Authentication Error",
          message: "OpenAI API key is missing. Please configure OPENAI_API_KEY in your system environment.",
          code: "MISSING_KEY"
        }), { status: 500, headers: { "Content-Type": "application/json" } })
      }
      if (key === "DocTech" || key.includes("your-") || key.includes("YOUR_")) {
        return new Response(JSON.stringify({
          error: "Authentication Error",
          message: `The system is currently using a placeholder API key: '${key}'. Please update your environment variables with a valid OpenAI API key to enable document translation.`,
          code: "PLACEHOLDER_KEY"
        }), { status: 500, headers: { "Content-Type": "application/json" } })
      }
    }
    if (modelProvider === 'anthropic' && !process.env.ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({
        error: "Authentication Error",
        message: "Anthropic API key is missing. Please configure ANTHROPIC_API_KEY in your system environment.",
        code: "MISSING_KEY"
      }), { status: 500, headers: { "Content-Type": "application/json" } })
    }
    if (modelProvider === 'xai' && !process.env.XAI_API_KEY) {
      return new Response(JSON.stringify({
        error: "Authentication Error",
        message: "xAI (Grok) API key is missing. Please configure XAI_API_KEY in your system environment.",
        code: "MISSING_KEY"
      }), { status: 500, headers: { "Content-Type": "application/json" } })
    }

    // SAFE WORKFLOW - Step 1: Validate Backend Capabilities
    const SUPPORTED_FORMATS = ["pdf", "docx", "xlsx", "csv", "txt"]
    const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_MAP)

    // Detect if user explicitly requested languages or formats in the prompt
    let targetLanguages: string[] = [baseLanguage]
    let targetFormat: string = "pdf"
    let explicitGoal: string = prompt || "Process document"

    try {
      console.log("Sending metadata detection prompt to model:", prompt)
      const { text: detectionResult } = await generateText({
        model: getFinalModel(aiModel),
        prompt: `Analyze the user's transformation prompt: "${prompt}"
      Current UI Language Context: "${LANGUAGE_MAP[baseLanguage] || baseLanguage}"
      
      Tasks:
      1. Identify all requested target language(s) (ISO 639-1).
      2. Identify the requested output format.
      3. Extract the core "transformation goal" (e.g., "summarize", "translate", "extract tables", "change tone to formal").
      
      Format Mapping Rules (STRICT):
      - Keywords: ["excel", "xls", "xlsx", "spreadsheet", "table", "csv"] -> xlsx
      - Keywords: ["word", "doc", "docx", "document"] -> docx
      - Keywords: ["text", "txt", "notes", "markdown"] -> txt
      - Keywords: ["pdf", "fixed"] -> pdf
 
      Return ONLY a JSON object:
      {
        "langs": ["iso-code"], 
        "format": "pdf|docx|xlsx|csv|txt",
        "explicitGoal": "summarized description of what the user wants to do"
      }`,
        temperature: 0,
      })
      console.log("Detection response from LLM:", detectionResult)

      Logger.info("Detection result raw", { requestId, detectionResult })
      const cleaned = detectionResult.trim().replace(/^```json/, "").replace(/```$/, "").trim()
      const parsed = JSON.parse(cleaned)

      if (parsed.langs && Array.isArray(parsed.langs) && parsed.langs.length > 0) {
        targetLanguages = parsed.langs
      } else if (parsed.lang) {
        targetLanguages = [parsed.lang]
      }

      targetFormat = form.get("targetFormat")?.toString() || parsed.format || "pdf"
      explicitGoal = parsed.explicitGoal || prompt || "Process document"

      Logger.info("Detected transformation metadata", { requestId, targetLanguages, targetFormat, explicitGoal })
    } catch (err) {
      Logger.warn("Metadata detection failed, using defaults", { requestId, err: (err as any).message })
    }

    // SAFE WORKFLOW - Step 2: Check for unsupported features
    const isFormatSupported = SUPPORTED_FORMATS.includes(targetFormat)

    if (!isFormatSupported) {
      Logger.warn("Unsupported format requested", { requestId, targetFormat })
      return new Response(JSON.stringify({
        error: "Limitation detected",
        message: `System capability restricted: The requested output format '${targetFormat}' is not currently supported by the backend transformation engine.`,
        code: "UNSUPPORTED_FORMAT"
      }), { status: 400, headers: { "Content-Type": "application/json" } })
    }

    // Validate all languages
    for (const lang of targetLanguages) {
      if (!SUPPORTED_LANGUAGES.includes(lang) && lang !== "en") {
        Logger.warn("Unsupported language requested", { requestId, targetLanguage: lang })
        if (prompt.toLowerCase().includes("translate") || prompt.toLowerCase().includes("badlo")) {
          return new Response(JSON.stringify({
            error: "Limitation detected",
            message: `System capability restricted: Linguistic synchronization for '${lang}' is not available in the current environment.`,
            code: "UNSUPPORTED_LANGUAGE"
          }), { status: 400, headers: { "Content-Type": "application/json" } })
        }
      }
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
      aiModel,
      targetLanguages,
      targetFormat
    })

    if (files.length === 0) {
      return new Response(JSON.stringify({
        error: "Invalid Request",
        message: "No document objects provided for transformation."
      }), { status: 400, headers: { "Content-Type": "application/json" } })
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
        if (requestedModel && (requestedModel.startsWith('xai') || requestedModel.startsWith('grok'))) {
          return xai(mappedModel)
        }
        return openai(mappedModel)
      } catch (err) {
        Logger.error("Failed to initialize AI model, defaulting to gpt-4o-mini", err, { requestedModel })
        return openai("gpt-4o-mini")
      }
    }

    const SYSTEM_PROTOCOL = `
You are the Doccoder AI Assistant. Execute a high-precision linguistic and structural transformation.

PROTOCOL:
1. TRANSLATION: Translate the source content into the target_language first. Maintain absolute technical integrity and context.
2. RESTRUCTURE: Restructure the translated content based on the requested output_format.
3. NO REPETITION: Do NOT include source-language text in the translated_content or structure unless explicitly requested.
4. VALIDATION: Return ONLY a valid JSON object following the schema below.

SCHEMA:
{
  "source_language": "iso-code",
  "target_language": "iso-code",
  "output_format": "pdf | docx | xlsx",
  "translated_content": "Full summary of translated text",
  "structure": {
    "sections": [ 
      {
        "heading": "Section Heading",
        "paragraphs": ["Paragraph text..."],
        "tables": [
          {
            "headers": ["Header 1", "Header 2"],
            "rows": [["Cell 1", "Cell 2"]]
          }
        ]
      }
    ],
    "sheets": [ 
      {
        "name": "Sheet name",
        "headers": ["Col 1", "Col 2"],
        "rows": [["Val 1", "Val 2"]]
      }
    ]
  }
}

OUTPUT RULES:
- For Excel (xlsx): Provide 'sheets' only. No paragraphs or sections.
- For PDF/DOCX: Provide 'sections'.
- Return ONLY the JSON. No preamble. No markdown blocks.
`;

    async function translateAndStructure(text: string, lang: string, format: string): Promise<PipelineOutput> {
      if (!text || !text.trim()) throw new Error("No input text for transformation.");
      const languageFull = LANGUAGE_MAP[lang] || lang || "English"

      try {
        Logger.info("Requesting unified transformation", { aiModel, targetLanguage: lang, targetFormat: format })

        const { text: jsonResult } = await generateText({
          model: getFinalModel(aiModel),
          prompt: `${SYSTEM_PROTOCOL}
        
        USER GOAL: ${explicitGoal}
        TARGET LANGUAGE: ${languageFull}
        REQUIRED FORMAT: ${format}

        TEXT TO PROCESS:
        ${text.slice(0, 15000)}`,
          temperature: 0.2,
        })

        const cleaned = jsonResult.trim().replace(/^```json/, "").replace(/```$/, "").trim()
        const data = JSON.parse(cleaned) as PipelineOutput

        Logger.info("JSON Schema Validity Check", {
          requestId,
          isValid: !!(data.source_language && data.target_language && data.structure)
        })

        return data
      } catch (err) {
        Logger.error("Unified transformation failed", err)
        throw err
      }
    }

    async function getCoverLineFor(filename: string, languageCode: string) {
      if (!prompt.trim()) return undefined

      const languageFull = LANGUAGE_MAP[languageCode] || languageCode || "English"
      const startTime = Date.now()

      try {
        Logger.info("Requesting AI title generation", { filename, aiModel, languageFull })

        console.log("Sending title generation prompt to model for:", filename)
        const { text } = await generateText({
          model: getFinalModel(aiModel),
          prompt: `Create a technically precise, concise one-line title for the document "${filename}".
 
User's requested transformation goal: ${explicitGoal}
 
CRITICAL: If the user explicitly mentions a target language in their goal (e.g. "translate to Marathi"), prioritize that language. Otherwise, return the title in ${languageFull}.
 
Guidelines:
- Use professional, system-grade technical terminology.
- Keep the title descriptive yet under 60 characters.
- Return ONLY the title text. No quotes.
 
Title:`,
          temperature: 0.7,
        })
        console.log("Title generation response from LLM:", text)
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


    // REFACTORED PIPELINE: Extract -> Translate & Structure -> Build
    const results = []
    for (const f of files) {
      try {
        Logger.info("Processing file", { filename: f.name, targetFormat, targetLanguages })
        const arrayBuffer = await f.arrayBuffer()

        // 1. EXTRACT content (Handling multiple input types)
        let rawText = ""
        const ext = (f.name.split(".").pop() || "").toLowerCase()
        if (ext === "pdf") {
          const content = await extractPdfContent(arrayBuffer, f.name)
          rawText = formatExtractedContent(content)
        } else if (ext === "docx") {
          rawText = (await mammoth.extractRawText({ arrayBuffer })).value
        } else if (ext === "xlsx" || ext === "xls" || ext === "csv") {
          const wb = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" })
          wb.SheetNames.forEach((name) => {
            rawText += `Sheet: ${name}\n${XLSX.utils.sheet_to_csv(wb.Sheets[name])}\n\n`
          })
        } else {
          rawText = new TextDecoder("utf-8").decode(new Uint8Array(arrayBuffer))
        }

        for (const tLang of targetLanguages) {
          // 2. TRANSLATE & STRUCTURE (Unified LLM Call)
          const structuredResult = await translateAndStructure(rawText, tLang, targetFormat)

          Logger.info("Pipeline Step: Translation & Structure Complete", {
            requestId,
            target_language: structuredResult.target_language,
            output_format: structuredResult.output_format
          })

          // 3. BUILD (Routing logic)
          let finalBytes: Uint8Array
          let finalName: string
          let finalMime: string
          let builderName: string

          const coverLine = await getCoverLineFor(f.name, tLang)

          if (structuredResult.output_format === "xlsx") {
            builderName = "build_excel"
            finalBytes = await build_excel(structuredResult)
            finalName = `${stripExt(f.name)}_translated.xlsx`
            finalMime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          } else if (structuredResult.output_format === "docx") {
            builderName = "build_docx"
            finalBytes = await build_docx(structuredResult)
            finalName = `${stripExt(f.name)}_translated.docx`
            finalMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          } else if (structuredResult.output_format === "pdf") {
            builderName = "build_pdf"
            const pdfResult = await build_pdf(structuredResult, f.name, {
              coverLine,
              templateId: template.id,
              orientation: template.orientation,
              margin: template.margin
            })
            finalBytes = pdfResult.bytes
            finalName = pdfResult.suggestedName
            finalMime = "application/pdf"
          } else {
            throw new Error(`Technical restriction: Builder for format '${structuredResult.output_format}' is not initialized.`)
          }

          Logger.info("Pipeline Step: Build Complete", {
            requestId,
            builderName,
            finalMime,
            finalName
          })

          const langSuffix = tLang !== "en" ? ` (${LANGUAGE_MAP[tLang] || tLang})` : ""
          const namedWithLang = finalName.includes(".")
            ? finalName.replace(/(\.[^.]+)$/, `${langSuffix}$1`)
            : `${finalName}${langSuffix}`

          results.push({ name: namedWithLang, bytes: finalBytes, format: targetFormat, mime: finalMime })
          Logger.info("File processed successfully", { requestId, finalName: namedWithLang, targetLanguage: tLang })
        }
      } catch (err: any) {
        Logger.error("Pipeline breakdown", err, { requestId, filename: f.name })

        let customMessage = err?.message || "Internal operation interrupted."
        if (customMessage.includes("DocTech") || customMessage.includes("Incorrect API key")) {
          customMessage = "Authentication failed: The provided API key 'DocTech' is invalid. Please ensure your environment variables (OPENAI_API_KEY) are correctly configured with a valid key from platform.openai.com."
        }

        return new Response(JSON.stringify({
          error: "Pipeline Fault",
          message: `Technical failure during high-precision processing of '${f.name}': ${customMessage}`
        }), { status: 500, headers: { "Content-Type": "application/json" } })
      }
    }

    async function generateSuccessMessage(targetLanguage: string) {
      const languageFull = LANGUAGE_MAP[targetLanguage] || targetLanguage || "English"
      try {
        console.log("Sending success message prompt to model for:", targetLanguage)
        const { text } = await generateText({
          model: getFinalModel(aiModel),
          prompt: `You are the Doccoder AI Assistant. Generate a technical success confirmation in ${languageFull}.
        
        CONTEXT: 
        - Target Language: ${languageFull}
        - Status: Document synchronization successful.
        
        Return ONLY the message text (sterile, professional, system-grade).`,
          temperature: 0.7,
        })
        console.log("Success message response from LLM:", text)

        return text.trim()
      } catch (err) {
        return `Instruction execution successful. Output buffer synchronized.`
      }
    }

    const assistantMessage = await generateSuccessMessage(targetLanguages[0])

    // If single file, return it directly
    if (results.length === 1) {
      const single = results[0]
      const mimeMap: Record<string, string> = {
        pdf: "application/pdf",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        csv: "text/csv",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        txt: "text/plain"
      }

      return new Response(single.bytes as any, {
        headers: {
          "Content-Type": (single as any).mime || "application/octet-stream",
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
        "Content-Disposition": `attachment; filename="${encodeRFC5987("transformed-data.zip")}"`,
        "X-Assistant-Message": encodeURIComponent(assistantMessage),
      },
    })
  } catch (err: any) {
    Logger.error("Global Transform API failure", err, { requestId })
    return new Response(JSON.stringify({
      error: "System Fault",
      message: `Doccoder AI Assistant encountered a fatal exception: ${err?.message || "Internal synchronized operation failed."}`,
      code: "GLOBAL_FAULT"
    }), { status: 500, headers: { "Content-Type": "application/json" } })
  }
}

function encodeRFC5987(s: string) {
  // Simple filename encoder for Content-Disposition header
  return s.replace(/[^a-zA-Z0-9!#$&+.^_`|~-]/g, (c) => encodeURIComponent(c))
}
