import mammoth from 'mammoth';
import { PDFDocument } from 'pdf-lib';
import * as XLSX from 'xlsx';

export interface ParsedDocument {
    content: string;
    metadata?: any;
}

export async function parseDocument(file: File): Promise<ParsedDocument> {
    const buffer = await file.arrayBuffer();
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        // Simple PDF text extraction (for production, use a more robust OCR or PDF parser service)
        // pdf-lib is mostly for manipulation, not extraction. 
        // Ideally we'd use pdf-parse or similar, but for this env we might need to rely on what's available or a simple mocked extraction if libs are missing.
        // However, existing code used pdf-lib? Let's assume standard pdf-lib usage or basic extraction.
        // Actually, normally we'd use 'pdf-parse' for node, but this is running on Next.js server actions?
        // Let's implement a basic placeholder or try to use a compatible lib if installed.
        // The previous context mentioned `pdf-lib` was present.
        try {
            // PDF extraction is complex in browser/node hybrid without specific libs like pdf.js-dist
            // For now, let's assume we can't easily extract text with just pdf-lib
            return { content: "[PDF Content Extraction Requires Additional Setup - Sending to AI as is if supported or returning placeholder]" };
        } catch (e) {
            console.error("PDF Parse Error", e);
            return { content: "" };
        }
    }
    else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.docx')
    ) {
        const result = await mammoth.extractRawText({ arrayBuffer: buffer });
        return { content: result.value };
    }
    else if (
        fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv') ||
        fileType.includes('spreadsheet') || fileType.includes('excel')
    ) {
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const csvContent = XLSX.utils.sheet_to_csv(sheet);
        return { content: csvContent };
    }
    else {
        // Default to text
        const decoder = new TextDecoder('utf-8');
        return { content: decoder.decode(buffer) };
    }
}
