import { PDFDocument, rgb } from "pdf-lib"
import * as XLSX from "xlsx"
import mammoth from "mammoth"
import { wrapText } from "./wrapText"
import fs from "fs"
import path from "path"
import type { PipelineOutput } from "./document-generators"

// Attempt to load sharp optionally (for WEBP/HEIC conversion). If unavailable, skip gracefully.
let sharp: any = null
try {
  // @ts-ignore
  sharp = (await import("sharp")).default
} catch {
  sharp = null
}

export type CoverOptions = {
  coverLine?: string // AI-generated one-liner for the cover
  templateId?: "minimal" | "professional" | "photo"
  orientation?: "portrait" | "landscape"
  margin?: number // points
}

const A4 = { width: 595.28, height: 841.89 } // points

function pageSize(orientation?: "portrait" | "landscape") {
  return orientation === "landscape" ? [A4.height, A4.width] : [A4.width, A4.height]
}

/**
 * NEW: build_pdf handles structured sections (headings, paragraphs, tables).
 */
export async function build_pdf(data: PipelineOutput, filename: string, cover?: CoverOptions): Promise<{ bytes: Uint8Array; suggestedName: string }> {
  const doc = await PDFDocument.create()
  if (cover?.coverLine) {
    await addCoverPage(doc, cover.coverLine, filename, cover)
  }
  await addStructuredPages(doc, data, cover)

  const bytes = await doc.save()
  return {
    bytes,
    suggestedName: `${stripExt(filename)}_translated.pdf`
  }
}

/**
 * NEW: Function to translate content into an Excel file
 * This fulfills your requirement to "translate this file into excel"
 */
export async function convertToExcel(
  text: string,
  filename: string
): Promise<{ bytes: Uint8Array; suggestedName: string }> {
  // Split text by lines to create rows
  const lines = text.split('\n').map(line => [line]);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(lines);
  XLSX.utils.book_append_sheet(wb, ws, "Translated_Content");

  // Generate buffer
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return {
    bytes: new Uint8Array(buf),
    suggestedName: `${stripExt(filename)}_translated.xlsx`
  };
}

export async function convertAnyToPdf(
  file: { name: string; type?: string; arrayBuffer: () => Promise<ArrayBuffer>; contentOverride?: string },
  cover?: CoverOptions,
  targetFormat: string = "pdf" // Added format toggle
): Promise<{ bytes: Uint8Array; suggestedName: string }> {
  const filename = file.name || "document"
  const ext = (filename.split(".").pop() || "").toLowerCase()
  const mime = file.type || mimeFromExt(ext)
  const arrayBuffer = await file.arrayBuffer()
  const u8 = new Uint8Array(arrayBuffer)

  // 1. EXTRACT OR USE OVERRIDDEN CONTENT (Translated text)
  let contentToProcess = file.contentOverride;

  // 2. IF THE USER WANTS EXCEL OUTPUT
  if (targetFormat === "xlsx" && contentToProcess) {
    return await convertToExcel(contentToProcess, filename);
  }

  // If already a PDF, pass through but optionally prepend a cover page.
  // CRITICAL: If contentOverride is provided (e.g. translation), we generate a NEW PDF from that text.
  if ((mime === "application/pdf" || ext === "pdf") && !file.contentOverride) {
    if (!cover?.coverLine && !cover?.orientation) {
      return { bytes: u8, suggestedName: stripExt(filename) + ".pdf" }
    }
    const base = await PDFDocument.load(u8)
    let out = base
    if (cover?.coverLine) {
      out = await prependCoverPage(out, cover.coverLine, filename, cover)
    }
    // no page resizing for existing PDFs (avoid layout issues)
    return { bytes: await out.save(), suggestedName: stripExt(filename) + ".pdf" }
  }

  // DOCX -> text
  if (ext === "docx") {
    const rawText = file.contentOverride || (await mammoth.extractRawText({ arrayBuffer })).value
    const doc = await createPdfFromText(rawText || "(empty document)", filename, cover)
    return { bytes: await doc.save(), suggestedName: stripExt(filename) + ".pdf" }
  }

  // XLSX/XLS/CSV -> text
  if (ext === "xlsx" || ext === "xls" || ext === "csv") {
    let combined = file.contentOverride
    if (!combined) {
      const wb = XLSX.read(u8, { type: "array" })
      combined = ""
      wb.SheetNames.forEach((sheetName, idx) => {
        const sheet = wb.Sheets[sheetName]
        const csv = XLSX.utils.sheet_to_csv(sheet)
        combined += `Sheet ${idx + 1}: ${sheetName}\n\n${csv}\n\n`
      })
    }
    // default to landscape for spreadsheets if not explicitly set
    const doc = await createPdfFromText(combined || "(empty spreadsheet)", filename, {
      ...cover,
      orientation: cover?.orientation || "landscape",
    })
    return { bytes: await doc.save(), suggestedName: stripExt(filename) + ".pdf" }
  }

  if (isCodeFile(ext)) {
    const text = new TextDecoder("utf-8").decode(u8)
    const doc = await createPdfFromCode(text || "(empty)", filename, cover)
    return { bytes: await doc.save(), suggestedName: stripExt(filename) + ".pdf" }
  }

  // Plain text / markdown fallback -> text
  if (mime.startsWith("text/") || ["txt", "md", "markdown"].includes(ext)) {
    let text = file.contentOverride
    if (!text) {
      const decoded = new TextDecoder("utf-8").decode(u8)
      text = ext === "html" || ext === "htm" ? stripHtml(decoded) : decoded
    }
    const doc = await createPdfFromText(text || "(empty)", filename, cover)
    return { bytes: await doc.save(), suggestedName: stripExt(filename) + ".pdf" }
  }

  // Images
  if (mime.startsWith("image/")) {
    let imgBytes = u8
    let format: "jpg" | "png"
    if (mime === "image/png") {
      format = "png"
    } else if (mime === "image/jpeg" || mime === "image/jpg") {
      format = "jpg"
    } else {
      // Try converting via sharp if available (e.g., WEBP/HEIC -> PNG)
      if (sharp) {
        try {
          const out = await sharp(Buffer.from(u8)).png().toBuffer()
          imgBytes = new Uint8Array(out)
          format = "png"
        } catch {
          throw new Error(`Unsupported image format: ${mime}`)
        }
      } else {
        throw new Error(`Unsupported image format: ${mime}`)
      }
    }
    const doc = await PDFDocument.create()
    if (cover?.coverLine) {
      await addCoverPage(doc, cover.coverLine, filename, cover)
    }
    const [w, h] = pageSize(cover?.orientation)
    const margin = typeof cover?.margin === "number" ? cover!.margin! : 36
    const page = doc.addPage([w, h])
    const img = format === "png" ? await doc.embedPng(imgBytes) : await doc.embedJpg(imgBytes)
    const { width, height } = fitToPage(img.width, img.height, w - margin * 2, h - margin * 2)
    const x = (w - width) / 2
    const y = (h - height) / 2
    page.drawImage(img, { x, y, width, height })
    return { bytes: await doc.save(), suggestedName: stripExt(filename) + ".pdf" }
  }

  // Fallback: dump as text if truly unknown
  const fallback = new TextDecoder("utf-8").decode(u8)
  const doc = await createPdfFromText(fallback || `(unsupported type: ${mime})`, filename, cover)
  return { bytes: await doc.save(), suggestedName: stripExt(filename) + ".pdf" }
}

function isCodeFile(ext: string): boolean {
  const codeExts = [
    "html",
    "htm",
    "css",
    "scss",
    "sass",
    "less",
    "json",
    "js",
    "jsx",
    "ts",
    "tsx",
    "py",
    "java",
    "c",
    "cpp",
    "h",
    "hpp",
    "cs",
    "php",
    "rb",
    "go",
    "rs",
    "swift",
    "kt",
    "sql",
    "sh",
    "bash",
    "yaml",
    "yml",
    "xml",
    "toml",
    "ini",
    "conf",
    "env",
  ]
  return codeExts.includes(ext)
}

function mimeFromExt(ext: string): string {
  const map: Record<string, string> = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
    csv: "text/csv",
    txt: "text/plain",
    md: "text/markdown",
    markdown: "text/markdown",
    html: "text/html",
    htm: "text/html",
    css: "text/css",
    json: "application/json",
    js: "text/javascript",
    jsx: "text/javascript",
    ts: "text/typescript",
    tsx: "text/typescript",
    py: "text/x-python",
    java: "text/x-java",
    xml: "text/xml",
    yaml: "text/yaml",
    yml: "text/yaml",
    sql: "text/x-sql",
    sh: "text/x-sh",
    bash: "text/x-sh",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    heic: "image/heic",
  }
  return map[ext] || "application/octet-stream"
}

export function stripExt(name: string) {
  const i = name.lastIndexOf(".")
  return i > 0 ? name.slice(0, i) : name
}

function sanitizeFilename(name: string) {
  return name.replace(/[^\w\-.]+/g, "_")
}

/**
 * Ensures text is valid for rendering.
 * We no longer restrict to WinAnsi as we embed a UTF-8 compatible font.
 */
function safeText(text: string): string {
  if (!text) return ""
  return text.normalize("NFC").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
}

/**
 * Loads and embeds a custom font for UTF-8 support.
 * Uses Geist-Regular as it's already in node_modules.
 */
async function getAppFont(doc: PDFDocument) {
  try {
    const fontPath = path.join(process.cwd(), "public", "fonts", "Geist-Regular.ttf")
    if (fs.existsSync(fontPath)) {
      const fontBytes = fs.readFileSync(fontPath)
      return await doc.embedFont(fontBytes)
    }
  } catch (e) {
    console.error("Failed to load custom font, falling back to Helvetica", e)
  }
  return null
}

function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim()
}

function fitToPage(w: number, h: number, maxW: number, maxH: number) {
  const ratio = Math.min(maxW / w, maxH / h)
  return { width: Math.max(1, w * ratio), height: Math.max(1, h * ratio) }
}

async function createPdfFromText(text: string, filename: string, cover?: CoverOptions) {
  const doc = await PDFDocument.create()
  if (cover?.coverLine) {
    await addCoverPage(doc, cover.coverLine, filename, cover)
  }
  await addTextPages(doc, text, cover)
  return doc
}

async function prependCoverPage(base: PDFDocument, coverLine: string, filename: string, cover?: CoverOptions) {
  const doc = await PDFDocument.create()
  await addCoverPage(doc, coverLine, filename, cover)
  const copied = await doc.copyPages(base, base.getPageIndices())
  copied.forEach((p) => doc.addPage(p))
  return doc
}

async function addCoverPage(doc: PDFDocument, coverLine: string, filename: string, cover?: CoverOptions) {
  const [w, h] = pageSize(cover?.orientation)
  const page = doc.addPage([w, h])

  const customFont = await getAppFont(doc)
  // Use custom font for everything to support UTF-8
  const font = customFont
  const sub = customFont

  const title = coverLine
  const subTitle = sanitizeFilename(filename)
  const margin = typeof cover?.margin === "number" ? cover!.margin! : 36

  // theme color depending on template
  const theme = pickTheme(cover?.templateId)

  if (font) {
    // Title
    page.drawText(safeText(title), {
      x: margin,
      y: h - margin - 48,
      size: cover?.templateId === "professional" ? 28 : 24,
      font,
      color: theme.title,
      maxWidth: w - margin * 2,
    })
    // Subtitle
    page.drawText(safeText(subTitle), {
      x: margin,
      y: h - margin - 48 - 28,
      size: 12,
      font: sub || undefined,
      color: theme.subtitle,
      maxWidth: w - margin * 2,
    })
  } else {
    // Basic fallback if font loading failed
    page.drawText("Document Transformation Result", { x: margin, y: h - margin - 48, size: 24 })
  }

  // Minimal accent rule for visual polish
  if (cover?.templateId !== "minimal") {
    page.drawLine({
      start: { x: margin, y: h - margin - 48 - 38 },
      end: { x: w - margin, y: h - margin - 48 - 38 },
      thickness: 2,
      color: theme.accent,
    })
  }
}

async function addTextPages(doc: PDFDocument, text: string, cover?: CoverOptions) {
  const customFont = await getAppFont(doc)
  const body = customFont
  const fontSize = cover?.templateId === "professional" ? 11.5 : 11
  const lineGap = cover?.templateId === "photo" ? 6 : 4
  const margin = typeof cover?.margin === "number" ? cover!.margin! : 36

  const [w, h] = pageSize(cover?.orientation)
  const maxWidth = w - margin * 2
  const maxHeight = h - margin * 2

  if (!body) {
    const page = doc.addPage([w, h])
    page.drawText("Error: Custom UTF-8 font could not be loaded. Please ensure Geist font is available in node_modules.", { x: margin, y: h - margin, size: 10 })
    return
  }

  const lines = wrapText(text.replace(/\r\n/g, "\n"), body, fontSize, maxWidth)
  let page = doc.addPage([w, h])
  let y = h - margin

  for (const line of lines) {
    const hLine = fontSize + lineGap
    if (y - hLine < margin) {
      page = doc.addPage([w, h])
      y = h - margin
    }
    page.drawText(safeText(line), {
      x: margin,
      y: y - fontSize,
      font: body,
      size: fontSize,
      color: rgb(0, 0, 0),
      maxWidth,
    })
    y -= hLine
  }
}

function pickTheme(templateId?: "minimal" | "professional" | "photo") {
  // Map to semantic colors. Keep a restrained palette.
  // Title uses near-black, accent uses a blue aligned with brand.
  const blue = rgb(0.12, 0.28, 0.98) // visually saturated, used sparingly
  const dark = rgb(0, 0, 0)
  const mid = rgb(0.2, 0.2, 0.2)
  switch (templateId) {
    case "professional":
      return { title: dark, subtitle: mid, accent: blue }
    case "photo":
      return { title: dark, subtitle: mid, accent: blue }
    default:
      return { title: dark, subtitle: mid, accent: blue }
  }
}

async function createPdfFromCode(text: string, filename: string, cover?: CoverOptions) {
  const doc = await PDFDocument.create()
  if (cover?.coverLine) {
    await addCoverPage(doc, cover.coverLine, filename, cover)
  }
  await addCodePages(doc, text, cover)
  return doc
}

async function addCodePages(doc: PDFDocument, text: string, cover?: CoverOptions) {
  const customFont = await getAppFont(doc)
  const mono = customFont // Using same font for now, or could find a mono ttf
  const fontSize = 9.5 // Smaller for code to fit more content
  const lineGap = 3
  const margin = typeof cover?.margin === "number" ? cover!.margin! : 36

  const [w, h] = pageSize(cover?.orientation)
  const maxWidth = w - margin * 2
  const maxHeight = h - margin * 2

  if (!mono) return

  const lines = wrapText(text.replace(/\r\n/g, "\n"), mono, fontSize, maxWidth)
  let page = doc.addPage([w, h])
  let y = h - margin

  for (const line of lines) {
    const hLine = fontSize + lineGap
    if (y - hLine < margin) {
      page = doc.addPage([w, h])
      y = h - margin
    }
    page.drawText(safeText(line), {
      x: margin,
      y: y - fontSize,
      font: mono,
      size: fontSize,
      color: rgb(0, 0, 0),
      maxWidth,
    })
    y -= hLine
  }
}
async function addStructuredPages(doc: PDFDocument, data: PipelineOutput, cover?: CoverOptions) {
  const customFont = await getAppFont(doc)
  const body = customFont
  const bold = customFont // Geist has different weights usually, but we'll use same for now or fallback

  const fontSize = 11
  const headingSize = 16
  const lineGap = 4
  const margin = typeof cover?.margin === "number" ? cover!.margin! : 36

  const [w, h] = pageSize(cover?.orientation)
  const maxWidth = w - margin * 2

  if (!body) return

  let page = doc.addPage([w, h])
  let y = h - margin

  const checkPage = (heightNeeded: number) => {
    if (y - heightNeeded < margin) {
      page = doc.addPage([w, h])
      y = h - margin
    }
  }

  if (data.structure.sections) {
    for (const s of data.structure.sections) {
      // Heading
      checkPage(headingSize + 20)
      page.drawText(safeText(s.heading), {
        x: margin,
        y: y - headingSize,
        font: body,
        size: headingSize,
        color: rgb(0, 0, 0),
      })
      y -= (headingSize + 15)

      // Paragraphs
      for (const p of s.paragraphs) {
        const lines = wrapText(p.replace(/\r\n/g, "\n"), body, fontSize, maxWidth)
        for (const line of lines) {
          checkPage(fontSize + lineGap)
          page.drawText(safeText(line), {
            x: margin,
            y: y - fontSize,
            font: body,
            size: fontSize,
            color: rgb(0, 0, 0),
          })
          y -= (fontSize + lineGap)
        }
        y -= 10 // extra space between paragraphs
      }

      // Tables
      if (s.tables) {
        for (const t of s.tables) {
          const colWidth = maxWidth / t.headers.length
          const rowHeight = fontSize + 10

          // Draw Headers
          checkPage(rowHeight)
          t.headers.forEach((header, i) => {
            page.drawText(safeText(header), {
              x: margin + (i * colWidth),
              y: y - fontSize,
              font: body,
              size: fontSize,
              color: rgb(0, 0, 0),
            })
          })
          y -= rowHeight

          // Draw Rows
          for (const row of t.rows) {
            checkPage(rowHeight)
            row.forEach((cell, i) => {
              page.drawText(safeText(String(cell)), {
                x: margin + (i * colWidth),
                y: y - fontSize,
                font: body,
                size: fontSize,
                color: rgb(0.2, 0.2, 0.2),
              })
            })
            y -= rowHeight
          }
          y -= 20 // space after table
        }
      }
    }
  }
}
