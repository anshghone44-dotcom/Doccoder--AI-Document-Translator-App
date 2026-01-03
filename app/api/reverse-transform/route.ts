import type { NextRequest } from "next/server"
import { convertPdfToFormat } from "@/lib/convert-from-pdf"
import JSZip from "jszip"
import { generateText } from "ai"

export const maxDuration = 60

export async function POST(req: NextRequest) {
  console.log("[v0] Reverse transform API called")

  try {
    const form = await req.formData()
    const prompt = (form.get("prompt") || "").toString()
    const targetFormat = (form.get("targetFormat") || "txt").toString() as "docx" | "txt" | "images"
    const aiModel = (form.get("aiModel") || "openai/gpt-5").toString()

    const files: File[] = []
    for (const [key, value] of form.entries()) {
      if (key === "files" && value instanceof File) {
        files.push(value)
      }
    }

    console.log("[v0] PDF files received:", files.length)
    console.log("[v0] Target format:", targetFormat)

    if (files.length === 0) {
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
        console.log("[v0] Generating AI conversion instructions using model:", aiModel)
        const { text } = await generateText({
          model: aiModel,
          prompt: `The user wants to convert PDF files to ${targetFormat} format.

User's goal: ${prompt}

Provide a brief one-line instruction for optimal conversion (e.g., "Preserve formatting and structure" or "Extract main text content only").

Instruction:`,
          temperature: 0.7,
        })
        conversionInstructions = text.trim()
        console.log("[v0] AI instructions generated:", conversionInstructions)
      } catch (err: any) {
        console.error("[v0] AI instruction generation failed:", err?.message || err)
      }
    }

    // Convert all PDF files
    const results = []
    for (const file of files) {
      try {
        console.log("[v0] Converting PDF:", file.name)
        const { bytes, suggestedName, mimeType } = await convertPdfToFormat(file, {
          targetFormat,
          prompt: conversionInstructions,
        })
        results.push({ name: suggestedName, bytes, mimeType })
        console.log("[v0] PDF converted successfully:", suggestedName)
      } catch (err: any) {
        console.error("[v0] Conversion error for", file.name, ":", err?.message || err)
        return new Response(
          `Error converting ${file.name}: ${err.message || "Unknown error occurred"}. Please ensure the PDF is not encrypted or corrupted.`,
          { status: 500 },
        )
      }
    }

    // If single file, return directly
    if (results.length === 1) {
      const single = results[0]
      return new Response(Buffer.from(single.bytes), {
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
    return new Response(Buffer.from(zipped), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${encodeRFC5987("converted-files.zip")}"`,
      },
    })
  } catch (err: any) {
    console.error("[v0] Reverse transform API error:", err?.message || err)
    return new Response(`Internal server error: ${err?.message || "Unknown error"}`, { status: 500 })
  }
}

function encodeRFC5987(s: string) {
  return s.replace(/[^a-zA-Z0-9!#$&+.^_`|~-]/g, (c) => encodeURIComponent(c))
}
