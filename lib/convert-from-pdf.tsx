import { PDFDocument } from "pdf-lib"
import { Document, Packer, Paragraph, TextRun } from "docx"
import { extractPdfContent, formatExtractedContent } from "./pdf-ocr-processor"

export type ReverseConversionOptions = {
  targetFormat: "docx" | "txt" | "images" | "csv" | "xlsx" | "jpg" | "png" | "pptx" | "json" | "xml" | "md" | "rtf"
  prompt?: string
}

export async function convertPdfToFormat(
  pdfFile: { name: string; arrayBuffer: () => Promise<ArrayBuffer> },
  options: ReverseConversionOptions,
): Promise<{ bytes: Uint8Array; suggestedName: string; mimeType: string }> {
  console.log("[v0] Starting PDF conversion for:", pdfFile.name)

  const arrayBuffer = await pdfFile.arrayBuffer()
  const filename = stripExt(pdfFile.name)

  let extractedText = ""
  let pageCount = 0

  try {
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    pageCount = pdfDoc.getPageCount()
    console.log("[v0] PDF loaded successfully, pages:", pageCount)

    // Extract content with table preservation
    const content = await extractPdfContent(arrayBuffer, filename)
    extractedText = formatExtractedContent(content)

    console.log("[v0] Text extraction completed with table detection, length:", extractedText.length)
  } catch (err: any) {
    console.error("[v0] PDF processing error:", err?.message || err)
    throw new Error(`Failed to process PDF: ${err?.message || "The file may be corrupted or encrypted"}`)
  }

  try {
    switch (options.targetFormat) {
      case "txt":
        return await convertToText(extractedText, filename, pageCount)
      case "csv":
        return await convertToCsv(extractedText, filename, pageCount)
      case "xlsx":
        return await convertToExcel(extractedText, filename, pageCount)
      case "docx":
        return await convertToDocx(extractedText, filename, pageCount)
      case "pptx":
        return await convertToPowerPoint(extractedText, filename, pageCount)
      case "json":
        return await convertToJson(extractedText, filename, pageCount)
      case "xml":
        return await convertToXml(extractedText, filename, pageCount)
      case "md":
        return await convertToMarkdown(extractedText, filename, pageCount)
      case "rtf":
        return await convertToRtf(extractedText, filename, pageCount)
      case "jpg":
      case "png":
        return await convertToImage(filename, pageCount, options.targetFormat)
      case "images":
        return await convertToImages(filename, pageCount)
      default:
        throw new Error(`Unsupported target format: ${options.targetFormat}`)
    }
  } catch (err: any) {
    console.error("[v0] Format conversion error:", err?.message || err)
    throw new Error(`Failed to convert to ${options.targetFormat}: ${err?.message || "Unknown error"}`)
  }
}

async function convertToText(
  text: string,
  filename: string,
  pageCount: number,
): Promise<{ bytes: Uint8Array; suggestedName: string; mimeType: string }> {
  console.log("[v0] Converting to TXT")
  const textBytes = new TextEncoder().encode(text)
  return {
    bytes: textBytes,
    suggestedName: `${filename}.txt`,
    mimeType: "text/plain",
  }
}

async function convertToCsv(
  text: string,
  filename: string,
  pageCount: number,
): Promise<{ bytes: Uint8Array; suggestedName: string; mimeType: string }> {
  console.log("[v0] Converting to CSV")
  const lines = text.split("\n").filter((line) => line.trim().length > 0)
  const csvContent = [
    ["Field", "Value"],
    ["Document Name", filename],
    ["Total Pages", String(pageCount)],
    ["Conversion Date", new Date().toISOString()],
    ...lines.map((line, idx) => [`Line ${idx + 1}`, line]),
  ]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n")

  const csvBytes = new TextEncoder().encode(csvContent)
  return {
    bytes: csvBytes,
    suggestedName: `${filename}.csv`,
    mimeType: "text/csv",
  }
}

async function convertToExcel(
  text: string,
  filename: string,
  pageCount: number,
): Promise<{ bytes: Uint8Array; suggestedName: string; mimeType: string }> {
  console.log("[v0] Converting to XLSX")
  const JSZip = (await import("jszip")).default

  const lines = text.split("\n").filter((line) => line.trim().length > 0)
  const rows = [
    ["Document Name", filename],
    ["Total Pages", String(pageCount)],
    ["Conversion Date", new Date().toISOString()],
    [],
    ["Content"],
    ...lines.map((line) => [line]),
  ]

  const csvContent = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n")

  const zip = new JSZip()
  zip.file("xl/worksheets/sheet1.xml", generateExcelSheet(rows))
  zip.file("xl/workbook.xml", generateExcelWorkbook())
  zip.file("[Content_Types].xml", generateContentTypes())
  zip.file("_rels/.rels", generateRels())
  zip.file("xl/_rels/workbook.xml.rels", generateWorkbookRels())

  const xlsxBytes = await zip.generateAsync({ type: "uint8array" })
  return {
    bytes: xlsxBytes,
    suggestedName: `${filename}.xlsx`,
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  }
}

async function convertToPowerPoint(
  text: string,
  filename: string,
  pageCount: number,
): Promise<{ bytes: Uint8Array; suggestedName: string; mimeType: string }> {
  console.log("[v0] Converting to PPTX")
  const JSZip = (await import("jszip")).default

  const zip = new JSZip()
  zip.file("ppt/presentation.xml", generatePptxPresentation())
  zip.file("ppt/slides/slide1.xml", generatePptxSlide(filename, pageCount, text))
  zip.file("[Content_Types].xml", generatePptxContentTypes())
  zip.file("_rels/.rels", generatePptxRels())
  zip.file("ppt/_rels/presentation.xml.rels", generatePptxPresentationRels())

  const pptxBytes = await zip.generateAsync({ type: "uint8array" })
  return {
    bytes: pptxBytes,
    suggestedName: `${filename}.pptx`,
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  }
}

async function convertToJson(
  text: string,
  filename: string,
  pageCount: number,
): Promise<{ bytes: Uint8Array; suggestedName: string; mimeType: string }> {
  console.log("[v0] Converting to JSON")
  const lines = text.split("\n").filter((line) => line.trim().length > 0)

  const jsonData = {
    document: {
      filename,
      totalPages: pageCount,
      conversionDate: new Date().toISOString(),
      content: lines,
      metadata: {
        source: "PDF",
        tool: "Doccoder",
      },
    },
  }

  const jsonString = JSON.stringify(jsonData, null, 2)
  const jsonBytes = new TextEncoder().encode(jsonString)

  return {
    bytes: jsonBytes,
    suggestedName: `${filename}.json`,
    mimeType: "application/json",
  }
}

async function convertToXml(
  text: string,
  filename: string,
  pageCount: number,
): Promise<{ bytes: Uint8Array; suggestedName: string; mimeType: string }> {
  console.log("[v0] Converting to XML")
  const lines = text.split("\n").filter((line) => line.trim().length > 0)

  let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n`
  xmlContent += `<document>\n`
  xmlContent += `  <metadata>\n`
  xmlContent += `    <filename>${escapeXml(filename)}</filename>\n`
  xmlContent += `    <totalPages>${pageCount}</totalPages>\n`
  xmlContent += `    <conversionDate>${new Date().toISOString()}</conversionDate>\n`
  xmlContent += `    <source>PDF</source>\n`
  xmlContent += `    <tool>Doccoder</tool>\n`
  xmlContent += `  </metadata>\n`
  xmlContent += `  <content>\n`

  lines.forEach((line, idx) => {
    xmlContent += `    <line index="${idx + 1}">${escapeXml(line)}</line>\n`
  })

  xmlContent += `  </content>\n`
  xmlContent += `</document>`

  const xmlBytes = new TextEncoder().encode(xmlContent)

  return {
    bytes: xmlBytes,
    suggestedName: `${filename}.xml`,
    mimeType: "application/xml",
  }
}

async function convertToMarkdown(
  text: string,
  filename: string,
  pageCount: number,
): Promise<{ bytes: Uint8Array; suggestedName: string; mimeType: string }> {
  console.log("[v0] Converting to Markdown")
  const lines = text.split("\n").filter((line) => line.trim().length > 0)

  let mdContent = `# ${filename}\n\n`
  mdContent += `## Document Information\n\n`
  mdContent += `- **Total Pages**: ${pageCount}\n`
  mdContent += `- **Conversion Date**: ${new Date().toISOString()}\n`
  mdContent += `- **Source Format**: PDF\n`
  mdContent += `- **Converted By**: Doccoder\n\n`
  mdContent += `## Content\n\n`

  lines.forEach((line) => {
    mdContent += `${line}\n\n`
  })

  const mdBytes = new TextEncoder().encode(mdContent)

  return {
    bytes: mdBytes,
    suggestedName: `${filename}.md`,
    mimeType: "text/markdown",
  }
}

async function convertToRtf(
  text: string,
  filename: string,
  pageCount: number,
): Promise<{ bytes: Uint8Array; suggestedName: string; mimeType: string }> {
  console.log("[v0] Converting to RTF")
  const lines = text.split("\n").filter((line) => line.trim().length > 0)

  let rtfContent = `{\\rtf1\\ansi\\ansicpg1252\\cocoartf2\n`
  rtfContent += `{\\fonttbl\\f0\\fswiss Helvetica;}\n`
  rtfContent += `{\\colortbl;\\red255\\green255\\blue255;}\n`
  rtfContent += `{\\*\\expandedcolortbl;;}\n`
  rtfContent += `\\margl1440\\margr1440\\margtsxn1440\\margbsxn1440\\mghdr720\\mgft720\\dghspace120\\dgvspace120\\dghorigin1440\\dgvorigin1440\\dghshow0\\dgvshow0\\jcompress\\viewkind4\\viewzk2\\uc1\\pard\\plain\\deftab720\\sl360\\slmult1\\pardirnatural\\partightenfactor100\n`
  rtfContent += `\\f0\\fs24\\cf0 {\\*\\colortbl;\\red0\\green0\\blue0;}\\marglsxn0\\margrsxn0\\pard\\plain\\f0\\fs24\\cf0\\sb0\\sa0\\par\n`
  rtfContent += `\\b ${filename}\\b0\\par\n`
  rtfContent += `\\par\n`
  rtfContent += `Total Pages: ${pageCount}\\par\n`
  rtfContent += `Conversion Date: ${new Date().toISOString()}\\par\n`
  rtfContent += `\\par\n`

  lines.forEach((line) => {
    rtfContent += `${line}\\par\n`
  })

  rtfContent += `}`

  const rtfBytes = new TextEncoder().encode(rtfContent)

  return {
    bytes: rtfBytes,
    suggestedName: `${filename}.rtf`,
    mimeType: "application/rtf",
  }
}

async function convertToImage(
  filename: string,
  pageCount: number,
  format: "jpg" | "png",
): Promise<{ bytes: Uint8Array; suggestedName: string; mimeType: string }> {
  console.log(`[v0] Converting to ${format.toUpperCase()}`)

  const canvas = typeof document !== "undefined" ? document.createElement("canvas") : null
  if (!canvas) {
    throw new Error("Canvas not available in this environment")
  }

  canvas.width = 800
  canvas.height = 600
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Could not get canvas context")

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "#333333"
  ctx.font = "24px Arial"
  ctx.fillText(`PDF: ${filename}`, 50, 100)
  ctx.fillText(`Pages: ${pageCount}`, 50, 150)
  ctx.fillText("Converted with Doccoder", 50, 200)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("Failed to create image"))
      else {
        blob.arrayBuffer().then((buffer) => {
          resolve({
            bytes: new Uint8Array(buffer),
            suggestedName: `${filename}.${format}`,
            mimeType: `image/${format}`,
          })
        })
      }
    }, `image/${format}`)
  })
}

async function convertToDocx(
  text: string,
  filename: string,
  pageCount: number,
): Promise<{ bytes: Uint8Array; suggestedName: string; mimeType: string }> {
  console.log("[v0] Converting to DOCX")

  try {
    const lines = text.split("\n").filter((line) => line.trim().length > 0)
    const paragraphs: Paragraph[] = []

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Converted from PDF: ${filename}`,
            bold: true,
            size: 32,
          }),
        ],
        spacing: { after: 400 },
      }),
    )

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Pages: ${pageCount}`,
            size: 24,
            italics: true,
          }),
        ],
        spacing: { after: 600 },
      }),
    )

    for (const line of lines) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              size: 24,
            }),
          ],
          spacing: { after: 200 },
        }),
      )
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    })

    const docxBytes = await Packer.toBuffer(doc)
    console.log("[v0] DOCX created successfully, size:", docxBytes.length)

    return {
      bytes: new Uint8Array(docxBytes),
      suggestedName: `${filename}.docx`,
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }
  } catch (err: any) {
    console.error("[v0] DOCX generation error:", err?.message || err)
    throw new Error(`DOCX generation failed: ${err?.message || "Unknown error"}`)
  }
}

async function convertToImages(
  filename: string,
  pageCount: number,
): Promise<{ bytes: Uint8Array; suggestedName: string; mimeType: string }> {
  console.log("[v0] Creating images placeholder")

  const JSZip = (await import("jszip")).default
  const zip = new JSZip()

  zip.file(
    "README.txt",
    `PDF Image Extraction Information\n\n` +
      `Original PDF: ${filename}.pdf\n` +
      `Total Pages: ${pageCount}\n\n` +
      `Note: Full image extraction from PDFs requires specialized server-side tools like:\n` +
      `- pdf2pic\n` +
      `- ImageMagick\n` +
      `- Poppler\n\n` +
      `These tools are not available in browser-based environments.\n` +
      `For complete image extraction, please use desktop PDF software or specialized services.`,
  )

  const zipBytes = await zip.generateAsync({ type: "uint8array" })
  return {
    bytes: zipBytes,
    suggestedName: `${filename}-images.zip`,
    mimeType: "application/zip",
  }
}

function stripExt(name: string) {
  const i = name.lastIndexOf(".")
  return i > 0 ? name.slice(0, i) : name
}

// Helper functions for Excel generation
function generateExcelSheet(rows: string[][]): string {
  let xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetData>`

  rows.forEach((row, rowIdx) => {
    xml += `<row r="${rowIdx + 1}">`
    row.forEach((cell, colIdx) => {
      const colLetter = String.fromCharCode(65 + colIdx)
      xml += `<c r="${colLetter}${rowIdx + 1}" t="inlineStr"><is><t>${escapeXml(cell)}</t></is></c>`
    })
    xml += `</row>`
  })

  xml += `</sheetData></worksheet>`
  return xml
}

function generateExcelWorkbook(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheets><sheet name="Sheet1" sheetId="1" r:id="rId1" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/></sheets>
</workbook>`
}

function generateContentTypes(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`
}

function generateRels(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
}

function generateWorkbookRels(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`
}

function generatePptxPresentation(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
<p:sldIdLst><p:sldId id="256" r:id="rId2" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/></p:sldIdLst>
</p:presentation>`
}

function generatePptxSlide(filename: string, pageCount: number, text: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
<p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill></p:bgPr></p:bg>
<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name="Title 1"/></p:nvGrpSpPr>
<p:sp><p:nvSpPr><p:cNvPr id="2" name="Title 2"/></p:nvSpPr>
<p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="en-US" sz="4400"/><a:t>${escapeXml(filename)}</a:t></a:r></a:p></p:txBody></p:sp>
</p:spTree></p:cSld></p:sld>`
}

function generatePptxContentTypes(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
<Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
</Types>`
}

function generatePptxRels(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`
}

function generatePptxPresentationRels(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
</Relationships>`
}

function escapeXml(str: string): string {
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;"
      case ">":
        return "&gt;"
      case "&":
        return "&amp;"
      case "'":
        return "&apos;"
      case '"':
        return "&quot;"
      default:
        return c
    }
  })
}
