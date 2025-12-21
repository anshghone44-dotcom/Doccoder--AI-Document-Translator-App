import mammoth from 'mammoth';
import { PDFDocument } from 'pdf-lib';
import * as XLSX from 'xlsx';

export async function parseDocument(file: Buffer, fileType: string): Promise<string> {
  try {
    const type = fileType.toLowerCase();
    if (type === 'application/pdf' || type === 'pdf') {
      return await parsePDF(file);
    } else if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || type === 'docx') {
      return await parseDOCX(file);
    } else if (type === 'text/plain' || type === 'txt') {
      return file.toString('utf-8');
    } else if (
      type === 'application/vnd.ms-excel' ||
      type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      type === 'xlsx' ||
      type === 'xls' ||
      type === 'text/csv' ||
      type === 'csv'
    ) {
      return await parseExcelOrCSS(file);
    } else {
      throw new Error(`Unsupported file type: ${type}`);
    }
  } catch (error) {
    console.error('Document parsing error:', error);
    throw new Error('Failed to parse document');
  }
}

async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    const pdfDoc = await PDFDocument.load(buffer);
    const pages = pdfDoc.getPages();
    let text = '';

    // Simple text extraction - for production, use a more robust library
    for (let i = 0; i < pages.length; i++) {
      text += `\n--- Page ${i + 1} ---\n`;
    }

    // Note: pdf-lib doesn't extract text directly. For a full solution, use pdf-parse or pdf2json
    // For MVP, we'll accept the limitation and suggest using plain text or DOCX
    return text || 'PDF text extraction requires additional setup. Please use TXT or DOCX files for now.';
  } catch (error) {
    throw new Error('Failed to parse PDF');
  }
}

async function parseDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    throw new Error('Failed to parse DOCX');
  }
}

async function parseExcelOrCSS(buffer: Buffer): Promise<string> {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    let text = '';
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      text += `--- Sheet: ${sheetName} ---\n`;
      text += XLSX.utils.sheet_to_csv(sheet);
      text += '\n\n';
    });
    return text;
  } catch (error) {
    throw new Error('Failed to parse Excel/CSV file');
  }
}
