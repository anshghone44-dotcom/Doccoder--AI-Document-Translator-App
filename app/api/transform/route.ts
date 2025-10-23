import type { NextRequest } from "next/server"
import JSZip from "jszip"
import { convertAnyToPdf } from "@/lib/convert-to-pdf"
import OpenAI from "openai"

export const maxDuration = 60

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  console.log("[v0] Transform API called")

  // Parse multipart form-data
  const form = await req.formData()
  const prompt = (form.get("prompt") || "").toString()

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

  async function getCoverLineFor(filename: string) {
    if (!prompt.trim()) return undefined

    if (!process.env.OPENAI_API_KEY) {
      console.log("[v0] OpenAI API key not configured, skipping AI title generation")
      return undefined
    }

    try {
      console.log("[v0] Generating AI title for:", filename)
      const response = await client.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant and expert document analyzer.",
          },
          {
            role: "user",
            content: `Create a professional, concise one-line title for converting the file "${filename}" into a PDF.

User's transformation goal: ${prompt}

Instructions:
- Analyze the file type and purpose
- Create a clear, descriptive title that reflects the document's content
- Keep it under 60 characters
- Use professional language
- Return ONLY the title, no quotes or extra text

Title:`,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      })
      const text = response.choices[0]?.message?.content || ""
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
      const coverLine = await getCoverLineFor(f.name)
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
    return new Response(single.bytes, {
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
  return new Response(zipped, {
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
