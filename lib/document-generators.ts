import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from "docx"
import * as XLSX from "xlsx"

export interface PipelineOutput {
    source_language: string;
    target_language: string;
    output_format: "pdf" | "docx" | "xlsx" | "csv" | "txt";
    translated_content: string;
    structure: {
        sections?: Array<{
            heading: string;
            paragraphs: string[];
            tables?: Array<{
                headers: string[];
                rows: string[][];
            }>;
        }>;
        sheets?: Array<{
            name: string;
            headers: string[];
            rows: any[][];
        }>;
    };
}

export interface StructuredData {
    title: string
    content: string
    language: string
}

/**
 * NEW: build_excel handles structured sheet data.
 * No paragraphs allowed in Excel output.
 */
export async function build_excel(data: PipelineOutput): Promise<Uint8Array> {
    const wb = XLSX.utils.book_new()

    if (data.structure.sheets && data.structure.sheets.length > 0) {
        data.structure.sheets.forEach(sheet => {
            const wsData = [sheet.headers, ...sheet.rows]
            const ws = XLSX.utils.aoa_to_sheet(wsData)
            XLSX.utils.book_append_sheet(wb, ws, sheet.name || "Sheet1")
        })
    } else if (data.structure.sections) {
        // Fallback for sections: try to extract tables or just create a flat content sheet
        const wsData: any[][] = [["Section", "Content"]]
        data.structure.sections.forEach(s => {
            if (s.tables) {
                s.tables.forEach(t => {
                    // Create a new sheet for each table? No, let's keep it simple or follow data
                })
            }
            wsData.push([s.heading, s.paragraphs.join("\n")])
        })
        const ws = XLSX.utils.aoa_to_sheet(wsData)
        XLSX.utils.book_append_sheet(wb, ws, "Translated Data")
    }

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
    return new Uint8Array(buf)
}

/**
 * NEW: build_docx handles hierarchical structure (headings, paragraphs, tables).
 */
export async function build_docx(data: PipelineOutput): Promise<Uint8Array> {
    const sections: any[] = []

    if (data.structure.sections) {
        data.structure.sections.forEach(s => {
            const children: any[] = []

            // Heading
            children.push(new Paragraph({
                text: s.heading,
                heading: "Heading1",
                spacing: { before: 400, after: 200 }
            }))

            // Paragraphs
            s.paragraphs.forEach(p => {
                children.push(new Paragraph({
                    text: p,
                    spacing: { after: 200 }
                }))
            })

            // Tables
            if (s.tables) {
                s.tables.forEach(t => {
                    const table = new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: t.headers.map(h => new TableCell({
                                    children: [new Paragraph({
                                        children: [new TextRun({ text: h, bold: true })]
                                    })]
                                }))
                            }),
                            ...t.rows.map(row => new TableRow({
                                children: row.map(cell => new TableCell({
                                    children: [new Paragraph({ text: String(cell) })]
                                }))
                            }))
                        ]
                    })
                    children.push(table)
                })
            }

            sections.push({ children })
        })
    }

    const doc = new Document({
        title: "Translated Document",
        sections: sections.length > 0 ? sections : [{ children: [new Paragraph({ text: data.translated_content })] }]
    })

    const buf = await Packer.toBuffer(doc)
    return new Uint8Array(buf)
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
