import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from "docx"
import * as XLSX from "xlsx"

export interface StructuredData {
    title: string
    content: string
    language: string
}

/**
 * Generates an Excel file buffer from structured data.
 */
export async function generateExcel(data: StructuredData[], filename: string): Promise<Uint8Array> {
    const wb = XLSX.utils.book_new()

    // Attempt to detect if content is CSV-like to spread across columns
    const wsData: any[][] = [["Title", "Content/Data", "Language"]]

    data.forEach(item => {
        // Simple heuristic: if content has commas and no newlines, or multiple lines with same comma count
        const lines = item.content.split("\n").filter(l => l.trim())
        if (lines.length > 1 && lines[0].includes(",")) {
            lines.forEach(line => {
                const cells = line.split(",").map(c => c.trim())
                wsData.push([item.title, ...cells, item.language])
            })
        } else {
            wsData.push([item.title, item.content, item.language])
        }
    })

    const ws = XLSX.utils.aoa_to_sheet(wsData)
    XLSX.utils.book_append_sheet(wb, ws, "Translated Data")
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
    return new Uint8Array(buf)
}

/**
 * Generates a CSV file buffer from structured data.
 */
export async function generateCsv(data: StructuredData[]): Promise<Uint8Array> {
    const csvContent = [
        ["Title", "Content", "Language"],
        ...data.map(item => [
            `"${item.title.replace(/"/g, '""')}"`,
            `"${item.content.replace(/"/g, '""')}"`,
            item.language
        ])
    ]
        .map(row => row.join(","))
        .join("\n")

    const BOM = new Uint8Array([0xEF, 0xBB, 0xBF])
    const content = new TextEncoder().encode(csvContent)
    const combined = new Uint8Array(BOM.length + content.length)
    combined.set(BOM)
    combined.set(content, BOM.length)
    return combined
}

/**
 * Generates a Word file buffer from structured data.
 */
export async function generateWord(data: StructuredData[], filename: string): Promise<Uint8Array> {
    const sections = data.map(item => {
        return {
            properties: {},
            children: [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: item.title,
                            bold: true,
                            size: 32,
                        }),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Language: ${item.language}`,
                            italics: true,
                            size: 20,
                        }),
                    ],
                    spacing: { after: 400 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: item.content,
                            size: 24,
                        }),
                    ],
                    spacing: { after: 600 },
                }),
            ],
        }
    })

    const doc = new Document({
        sections: sections
    })

    const buf = await Packer.toBuffer(doc)
    return new Uint8Array(buf)
}

/**
 * Generates a Plain Text file buffer from structured data.
 */
export async function generateText(data: StructuredData[]): Promise<Uint8Array> {
    const textContent = data.map(item => {
        return `Title: ${item.title}\nLanguage: ${item.language}\n\n${item.content}\n\n${"=".repeat(50)}\n`
    }).join("\n")

    const BOM = new Uint8Array([0xEF, 0xBB, 0xBF])
    const content = new TextEncoder().encode(textContent)
    const combined = new Uint8Array(BOM.length + content.length)
    combined.set(BOM)
    combined.set(content, BOM.length)
    return combined
}
