import mammoth from 'mammoth';
import { PDFDocument } from 'pdf-lib';

export async function parseDocument(file: Buffer, fileType: string): Promise<string> {
  try {
    if (fileType === 'application/pdf' || fileType === 'pdf') {
      return await parsePDF(file);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileType === 'docx') {
      return await parseDOCX(file);
    } else if (fileType === 'text/plain' || fileType === 'txt') {
      return file.toString('utf-8');
    } else {
      throw new Error('Unsupported file type');
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