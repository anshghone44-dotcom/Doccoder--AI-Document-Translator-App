// Utilities to convert various file types into PDF pages using pdf-lib.
// Supports: PDF passthrough, DOCX (via mammoth -> text), XLS/XLSX/CSV (via xlsx -> text),
// TXT/MD/HTML (text fallback), PNG/JPG/JPEG/WEBP (images; WEBP converted via sharp if available).

import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import * as XLSX from "xlsx"
import mammoth from "mammoth"
import { wrapText } from "./wrapText"

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

export async function convertAnyToPdf(
  file: { name: string; type?: string; arrayBuffer: () => Promise<ArrayBuffer>; contentOverride?: string },
  cover?: CoverOptions,
): Promise<{ bytes: Uint8Array; suggestedName: string }> {
  const filename = file.name || "document"
  const ext = (filename.split(".").pop() || "").toLowerCase()
  const mime = file.type || mimeFromExt(ext)
  const arrayBuffer = await file.arrayBuffer()
  const u8 = new Uint8Array(arrayBuffer)

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

function stripExt(name: string) {
  const i = name.lastIndexOf(".")
  return i > 0 ? name.slice(0, i) : name
}

function sanitizeFilename(name: string) {
  return name.replace(/[^\w\-.]+/g, "_")
}

/**
 * Ensures text is encodable by standard PDF fonts (WinAnsi).
 * Characters outside this range are replaced to prevent crashes.
 */
function safeText(text: string): string {
  if (!text) return ""
  // PDF Standard Fonts use WinAnsiEncoding. 
  // We'll filter for standard printable characters + some extras.
  // This is a defensive barrier against 0xfffd and other Unicode interrupts.
  return text.normalize("NFC").replace(/[^\x00-\x7F\xA0-\xFF]/g, (char) => {
    // If it's a known common special char, we can try to map it, 
    // otherwise fallback to a safe placeholder.
    return "?"
  })
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
  const font = await doc.embedFont(StandardFonts.HelveticaBold)
  const sub = await doc.embedFont(StandardFonts.Helvetica)
  const title = coverLine
  const subTitle = sanitizeFilename(filename)
  const margin = typeof cover?.margin === "number" ? cover!.margin! : 36

  // theme color depending on template
  const theme = pickTheme(cover?.templateId)

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
    font: sub,
    color: theme.subtitle,
    maxWidth: w - margin * 2,
  })

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
  const body = await doc.embedFont(StandardFonts.Helvetica)
  const fontSize = cover?.templateId === "professional" ? 11.5 : 11
  const lineGap = cover?.templateId === "photo" ? 6 : 4
  const margin = typeof cover?.margin === "number" ? cover!.margin! : 36

  const [w, h] = pageSize(cover?.orientation)
  const maxWidth = w - margin * 2
  const maxHeight = h - margin * 2

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
  const mono = await doc.embedFont(StandardFonts.Courier)
  const fontSize = 9.5 // Smaller for code to fit more content
  const lineGap = 3
  const margin = typeof cover?.margin === "number" ? cover!.margin! : 36

  const [w, h] = pageSize(cover?.orientation)
  const maxWidth = w - margin * 2
  const maxHeight = h - margin * 2

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
