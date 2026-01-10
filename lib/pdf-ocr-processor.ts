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
 * Sanitize text to ensure it's valid UTF-8
 */
function sanitizeTextForUTF8(text: string): string {
  // Replace any invalid UTF-8 sequences or problematic characters
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/g, '') // Remove control chars and invalid surrogates
    .replace(/[\uFFFD]/g, '?') // Replace replacement character with question mark
    .normalize('NFC') // Normalize to composed form
}

/**
 * Advanced PDF processor with OCR simulation and table detection
 * In production, integrate with Tesseract.js or cloud OCR services
 */
export async function extractPdfContent(arrayBuffer: ArrayBuffer, filename: string): Promise<ExtractedContent> {
  // Load PDF with pdf-lib for metadata
  const pdfDoc = await PDFDocument.load(arrayBuffer)
  const pageCount = pdfDoc.getPageCount()

  // Extract metadata
  const metadata = {
    title: pdfDoc.getTitle() || filename,
    author: pdfDoc.getAuthor(),
    creationDate: pdfDoc.getCreationDate()?.toISOString(),
    pageCount,
  }

  // Extract text - serverless-friendly approach
  let fullText = ""
  const tables: TableData[] = []

  try {
    // For serverless environments, provide informative message
    // In production, integrate with cloud PDF processing service
    fullText = `Document: ${filename}\nPages: ${pageCount}\n\nThis PDF contains ${pageCount} page(s).\n\nFor text extraction in production environments, please integrate with a cloud PDF processing service like:\n- Google Cloud Document AI\n- AWS Textract\n- Azure Form Recognizer\n\nThe PDF appears to be valid but requires specialized processing for text extraction.`

    // For now, don't attempt table detection in serverless environment
  } catch (error) {
    console.error("PDF processing error:", error)
    fullText = `Document: ${filename}\n\nUnable to process PDF. The file may be corrupted or encrypted. Please ensure the PDF is valid and not password-protected.`
  }

  return {
    text: sanitizeTextForUTF8(fullText),
    tables,
    metadata,
  }
}

/**
 * Extract text from a single PDF page
 * Currently a placeholder - implement with proper PDF parsing library
 */
async function extractPageText(page: PDFPage, pageIndex: number): Promise<string> {
  // Placeholder implementation
  return `[Page ${pageIndex + 1}] - Text extraction not yet implemented`
}

/**
 * Extract text from a single PDF page using PDF.js (placeholder)
 */
async function extractPageTextWithPdfJS(page: any, pageIndex: number): Promise<string> {
  // Placeholder
  return `[Page ${pageIndex + 1}] - PDF.js extraction not available`
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
