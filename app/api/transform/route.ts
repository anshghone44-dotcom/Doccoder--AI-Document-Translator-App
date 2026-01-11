import type { NextRequest } from "next/server"
import JSZip from "jszip"
import { extractPdfContent, formatExtractedContent } from "@/lib/pdf-ocr-processor"
import { convertAnyToPdf } from "@/lib/convert-to-pdf"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import mammoth from "mammoth"
import * as XLSX from "xlsx"
import { generateExcel, generateCsv, generateWord, generateText as generateStructuredText } from "@/lib/document-generators"
import type { StructuredData } from "@/lib/document-generators"

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


export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)
  const startTime = Date.now()

  try {
    Logger.info("Transform API request started", { requestId })

    const form = await req.formData()
    // ... (logic follows)
    const prompt = (form.get("prompt") || "").toString()
    const aiModel = (form.get("aiModel") || "openai/gpt-4-mini").toString()
    const baseLanguage = (form.get("targetLanguage") || "en").toString()

    // SAFE WORKFLOW - Step 1: Validate Backend Capabilities
    const SUPPORTED_FORMATS = ["pdf", "docx", "xlsx", "csv", "txt"]
    const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_MAP)

    // Detect if user explicitly requested languages or formats in the prompt
    let targetLanguages: string[] = [baseLanguage]
    let targetFormat: string = "pdf"

    try {
      console.log("Sending metadata detection prompt to model:", prompt)
      const { text: detectionResult } = await generateText({
        model: getFinalModel(aiModel),
        prompt: `Analyze the user's transformation prompt: "${prompt}"
      Current UI Language Context: "${LANGUAGE_MAP[baseLanguage] || baseLanguage}"
      
      Tasks:
      1. Identify all requested target language(s) (ISO 639-1).
      2. Identify the requested output format based on keywords.
      
      Format Mapping Rules (STRICT):
      - Keywords: ["excel", "xls", "xlsx", "spreadsheet", "table", "csv"] -> If any of these are present, prioritize "xlsx" (or "csv" if explicitly asked for CSV).
      - Keywords: ["word", "doc", "docx", "document"] -> prioritize "docx".
      - Keywords: ["text", "txt", "notes", "markdown"] -> prioritize "txt".
      - Keywords: ["pdf", "fixed"] -> prioritize "pdf".
      
      Output format mapping:
      - Requested: "Excel", "XLS", "XLSX" -> xlsx
      - Requested: "Word", "DOC", "DOCX" -> docx
      - Requested: "CSV" -> csv
      - Requested: "Text", "TXT" -> txt
      - Default to "pdf" ONLY if no format is mentioned.
 
      Return ONLY a JSON object:
      {
        "langs": ["iso-code"], 
        "format": "pdf|docx|xlsx|csv|txt" 
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
      targetFormat = parsed.format || "pdf"

      Logger.info("Detected transformation metadata", { requestId, targetLanguages, targetFormat })
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

        console.log("Sending title generation prompt to model for:", filename)
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

    async function translateToStructuredData(text: string, lang: string): Promise<StructuredData[]> {
      if (!text || !text.trim()) return []
      const startTime = Date.now()
      const languageFull = LANGUAGE_MAP[lang] || lang || "English"

      try {
        Logger.info("Requesting structured AI translation", { lang, textSnippet: text.slice(0, 50) })

        console.log("Sending structured translation prompt to model for:", lang)
        const { text: jsonResult } = await generateText({
          model: getFinalModel(aiModel),
          prompt: `You are the System Intelligence Core. Execute the following transformation goal with absolute precision.
        
        USER DIRECTIVE: ${prompt}
        SOURCE LANGUAGE: Detect automatically
        TARGET LANGUAGE: ${languageFull}
 
        SYSTEM PROTOCOLS: 
        1. EXECUTE THE USER DIRECTIVE ABOVE WITH ABSOLUTE PRIORITY.
        2. Deliver the final synchronized content in ${languageFull}.
        3. If the user asks for a summary, professional tone, data extraction, or format-specific structure, prioritize that.
        4. Maintain absolute technical integrity and professional caliber.
        5. For structured output (Excel/Word/CSV), ensure data is logically grouped.
        
        OUTPUT FORMAT:
        [
          {
            "title": "Section Title",
            "content": "Section Content...",
            "language": "${languageFull}"
          }
        ]
        
        TEXT TO PROCESS:
        ${text.slice(0, 10000)}`,
          temperature: 0.3,
        })
        console.log("Structured translation response from LLM:", jsonResult.slice(0, 500))

        const cleaned = jsonResult.trim().replace(/^```json/, "").replace(/```$/, "").trim()
        const data = JSON.parse(cleaned) as StructuredData[]

        Logger.info("Structured translation successful", { count: data.length, durationMs: Date.now() - startTime })
        return data
      } catch (err) {
        Logger.error("Structured translation failed, falling back to simple format", err)
        return [{
          title: "Processed Document",
          content: text,
          language: languageFull
        }]
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

        console.log("Sending content translation prompt to model for:", targetLanguage)
        const { text: translated } = await generateText({
          model: getFinalModel(aiModel),
          prompt: `You are the System Intelligence Core, a voice-enabled assistant. Execute linguistic synchronization.
        
        USER GOAL: ${prompt}
        SOURCE LANGUAGE: Detect automatically
        TARGET LANGUAGE: ${languageFull}
 
        SYSTEM PROTOCOL:
        1. EXECUTE THE USER GOAL WITH ABSOLUTE PRIORITY.
        2. Deliver the final output in ${languageFull}.
        3. If the user goal involves summarization, stylistic changes, or specific modifications, follow them precisely.
        4. Prioritize audio-friendly, conversational interaction for voice mode synthesis.
        5. Maintain absolute technical precision.
        
        Return ONLY the translated/processed text.
 
        TEXT OBJECT:
        ${text.slice(0, 15000)}
 
        SYNCHRONIZED OUTPUT:`,
          temperature: 0.3,
        })
        console.log("Content translation response from LLM:", translated.slice(0, 500))

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
        Logger.info("Processing file", { filename: f.name, targetFormat, targetLanguages })
        const ext = (f.name.split(".").pop() || "").toLowerCase()
        const arrayBuffer = await f.arrayBuffer()
        const u8 = new Uint8Array(arrayBuffer)

        let rawText = ""
        if (ext === "docx") {
          const { value } = await mammoth.extractRawText({ arrayBuffer })
          rawText = value
        } else if (ext === "xlsx" || ext === "xls" || ext === "csv") {
          const wb = XLSX.read(u8, { type: "array" })
          wb.SheetNames.forEach((sheetName, idx) => {
            const sheet = wb.Sheets[sheetName]
            rawText += `Sheet ${idx + 1}: ${sheetName}\n\n${XLSX.utils.sheet_to_csv(sheet)}\n\n`
          })
        } else if (["txt", "md", "markdown", "html"].includes(ext)) {
          rawText = new TextDecoder("utf-8").decode(u8)
        } else if (ext === "pdf") {
          const content = await extractPdfContent(arrayBuffer, f.name)
          rawText = formatExtractedContent(content)
        }

        for (const tLang of targetLanguages) {
          let finalBytes: Uint8Array
          let finalName: string

          if (targetFormat === "pdf") {
            const processedContent = await translateContent(rawText, tLang)
            const coverLine = await getCoverLineFor(f.name, tLang)
            const { bytes, suggestedName } = await convertAnyToPdf({
              name: f.name,
              arrayBuffer: async () => arrayBuffer,
              contentOverride: processedContent
            }, {
              coverLine,
              templateId: template.id,
              orientation: template.orientation,
              margin: typeof template.margin === "number" ? template.margin : undefined,
            })
            finalBytes = bytes
            finalName = suggestedName
          } else {
            const structuredData = await translateToStructuredData(rawText, tLang)
            const baseName = f.name.replace(/\.[^/.]+$/, "")

            switch (targetFormat) {
              case "xlsx":
                finalBytes = await generateExcel(structuredData, f.name)
                finalName = `${baseName}.xlsx`
                break
              case "csv":
                finalBytes = await generateCsv(structuredData)
                finalName = `${baseName}.csv`
                break
              case "docx":
                finalBytes = await generateWord(structuredData, f.name)
                finalName = `${baseName}.docx`
                break
              case "txt":
                finalBytes = await generateStructuredText(structuredData)
                finalName = `${baseName}.txt`
                break
              default:
                // SAFE WORKFLOW Rule: Never return original file.
                throw new Error(`Technical restriction: Output generator for '${targetFormat}' is not initialized.`)
            }
          }

          const langSuffix = tLang !== "en" ? ` (${LANGUAGE_MAP[tLang] || tLang})` : ""
          const namedWithLang = finalName.includes(".")
            ? finalName.replace(/(\.[^.]+)$/, `${langSuffix}$1`)
            : `${finalName}${langSuffix}`

          results.push({ name: namedWithLang, bytes: finalBytes, format: targetFormat })
          Logger.info("File processed successfully", { requestId, finalName: namedWithLang, targetLanguage: tLang })
        }
      } catch (err: any) {
        Logger.error("Processing sequence interrupted", err, { requestId, filename: f.name })
        return new Response(JSON.stringify({
          error: "Processing Interrupt",
          message: `System encountered a technical barrier while processing '${f.name}': ${err?.message || "Internal operation failed."}`,
          code: "PROCESS_INTERRUPT"
        }), { status: 500, headers: { "Content-Type": "application/json" } })
      }
    }

    async function generateSuccessMessage(targetLanguage: string) {
      const languageFull = LANGUAGE_MAP[targetLanguage] || targetLanguage || "English"
      try {
        console.log("Sending success message prompt to model for:", targetLanguage)
        const { text } = await generateText({
          model: getFinalModel(aiModel),
          prompt: `You are the System Intelligence Core. Generate a technical success confirmation in ${languageFull}.
        
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
          "Content-Type": mimeMap[single.format] || "application/octet-stream",
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
      message: `System Intelligence Core encountered a fatal exception: ${err?.message || "Internal synchronized operation failed."}`,
      code: "GLOBAL_FAULT"
    }), { status: 500, headers: { "Content-Type": "application/json" } })
  }
}

function encodeRFC5987(s: string) {
  // Simple filename encoder for Content-Disposition header
  return s.replace(/[^a-zA-Z0-9!#$&+.^_`|~-]/g, (c) => encodeURIComponent(c))
}
