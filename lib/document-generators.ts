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
    const wsData = [
        ["Title", "Content", "Language"],
        ...data.map(item => [item.title, item.content, item.language])
    ]
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

    return new TextEncoder().encode(csvContent)
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

    return new TextEncoder().encode(textContent)
}
