import { PDFDocument, type PDFPage } from "pdf-lib"

export interface TableData {
  headers: string[]
  rows: string[][]
}

export interface ExtractedContent {
  text: string
  tables: TableData[]
  metadata: {
    title?: string
    author?: string
    creationDate?: string
    pageCount: number
  }
}

/**
 * Advanced PDF processor with OCR simulation and table detection
 * In production, integrate with Tesseract.js or cloud OCR services
 */
export async function extractPdfContent(arrayBuffer: ArrayBuffer, filename: string): Promise<ExtractedContent> {
  const pdfDoc = await PDFDocument.load(arrayBuffer)
  const pageCount = pdfDoc.getPageCount()

  // Extract metadata
  const metadata = {
    title: pdfDoc.getTitle() || filename,
    author: pdfDoc.getAuthor(),
    creationDate: pdfDoc.getCreationDate()?.toISOString(),
    pageCount,
  }

  // Extract text and detect tables
  let fullText = ""
  const tables: TableData[] = []

  for (let i = 0; i < pageCount; i++) {
    const page = pdfDoc.getPage(i)
    const pageText = await extractPageText(page, i)
    fullText += pageText + "\n\n"

    // Detect and extract tables from page
    const pageTables = detectTablesInPage(pageText)
    tables.push(...pageTables)
  }

  return {
    text: fullText,
    tables,
    metadata,
  }
}

/**
 * Extract text from a single PDF page
 * In production, use pdfjs-dist or similar for actual text extraction
 */
async function extractPageText(page: PDFPage, pageIndex: number): Promise<string> {
  // Real text extraction from PDF stream blocks
  try {
    // @ts-ignore - accessing internal stream for simple extraction
    const contentStream = page.node.getContents()
    if (!contentStream) return ""

    let text = ""
    // Combine all streams if multiple
    const streams = Array.isArray(contentStream) ? contentStream : [contentStream]

    for (const stream of streams) {
      const bytes = stream.getContents()
      const decoded = new TextDecoder("utf-8").decode(bytes)

      // Simple scan for (string) patterns
      let inString = false
      let current = ""
      for (let i = 0; i < decoded.length; i++) {
        const char = decoded[i]
        if (char === "(" && !inString) {
          inString = true
          current = ""
        } else if (char === ")" && inString) {
          inString = false
          // Sanitize: replace the replacement character (0xfffd) if it leaked from stream
          const sanitized = current.replace(/\uFFFD/g, "")
          if (sanitized.length > 1) text += sanitized + " "
        } else if (inString) {
          current += char
        }
      }
    }

    return text.replace(/\\/g, "").trim() || `[Page ${pageIndex + 1} - No readable text detected]`
  } catch (err) {
    console.error("Text extraction failed for page", pageIndex, err)
    return `[Page ${pageIndex + 1} - extraction error]`
  }
}

/**
 * Detect and extract table structures from page text
 * Uses heuristics to identify table patterns
 */
function detectTablesInPage(pageText: string): TableData[] {
  const tables: TableData[] = []
  const lines = pageText.split("\n").filter((line) => line.trim())

  // Simple table detection heuristic: consecutive lines with similar structure
  let currentTable: string[] = []
  let inTable = false

  for (const line of lines) {
    // Check if line looks like a table row (contains multiple delimiters or aligned columns)
    if (isTableRow(line)) {
      if (!inTable) {
        inTable = true
        currentTable = []
      }
      currentTable.push(line)
    } else {
      if (inTable && currentTable.length > 0) {
        const table = parseTableRows(currentTable)
        if (table.rows.length > 0) {
          tables.push(table)
        }
        currentTable = []
        inTable = false
      }
    }
  }

  // Handle last table if exists
  if (inTable && currentTable.length > 0) {
    const table = parseTableRows(currentTable)
    if (table.rows.length > 0) {
      tables.push(table)
    }
  }

  return tables
}

/**
 * Check if a line appears to be a table row
 */
function isTableRow(line: string): boolean {
  // Heuristic: line contains multiple spaces or pipe characters
  const pipeCount = (line.match(/\|/g) || []).length
  const multipleSpaces = /\s{2,}/.test(line)

  return pipeCount >= 2 || (multipleSpaces && line.length > 20)
}

/**
 * Parse table rows into structured table data
 */
function parseTableRows(rows: string[]): TableData {
  if (rows.length === 0) {
    return { headers: [], rows: [] }
  }

  // Split by pipes or multiple spaces
  const parsedRows = rows.map((row) => {
    return row
      .split(/\||\s{2,}/)
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0)
  })

  // First row as headers
  const headers = parsedRows[0] || []
  const dataRows = parsedRows.slice(1)

  return {
    headers,
    rows: dataRows,
  }
}

/**
 * Format extracted content with preserved structure
 */
export function formatExtractedContent(content: ExtractedContent): string {
  let formatted = `# ${content.metadata.title}\n\n`

  if (content.metadata.author) {
    formatted += `**Author**: ${content.metadata.author}\n`
  }

  formatted += `**Pages**: ${content.metadata.pageCount}\n\n`

  // Add text content
  formatted += `## Content\n\n${content.text}\n\n`

  // Add tables
  if (content.tables.length > 0) {
    formatted += `## Tables\n\n`
    content.tables.forEach((table, idx) => {
      formatted += `### Table ${idx + 1}\n\n`
      formatted += formatTable(table)
      formatted += "\n\n"
    })
  }

  return formatted
}

/**
 * Format table as markdown
 */
function formatTable(table: TableData): string {
  if (table.headers.length === 0) return ""

  let markdown = `| ${table.headers.join(" | ")} |\n`
  markdown += `| ${table.headers.map(() => "---").join(" | ")} |\n`

  table.rows.forEach((row) => {
    markdown += `| ${row.join(" | ")} |\n`
  })

  return markdown
}
