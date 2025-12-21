import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import DocumentModel from '@/lib/models/Document';
import { parseDocument } from '@/lib/document-parser';
import { translateDocument, summarizeDocument, editDocument, analyzeImage, TranslationResult } from '@/lib/ai-service';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const glossaryFile = formData.get('glossary') as File | null;
    const operation = formData.get('operation') as 'translate' | 'summarize' | 'edit' | 'ocr';
    const model = formData.get('model') as 'gpt-5' | 'claude-sonnet';
    const language = formData.get('language') as string;
    const instructions = formData.get('instructions') as string; // For edit mode

    if (!file || !operation || !model) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (operation === 'translate' && !language) {
      return NextResponse.json(
        { error: 'Language is required for translation' },
        { status: 400 }
      );
    }

    // Read file
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.type || file.name.split('.').pop() || '';
    const isImage = fileType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp'].includes(fileType);

    // Parse glossary if provided
    let glossaryContext = '';
    if (glossaryFile) {
      try {
        const glossaryBuffer = Buffer.from(await glossaryFile.arrayBuffer());
        const glossaryType = glossaryFile.type || glossaryFile.name.split('.').pop() || '';
        glossaryContext = await parseDocument(glossaryBuffer, glossaryType);
      } catch (e) {
        console.error("Glossary parsing failed", e);
        // We continue without glossary if parsing fails, but warn?
      }
    }

    let result: string | TranslationResult;
    let content: string = '';

    // Handle Image / OCR
    if (isImage || operation === 'ocr') {
      // for images, content is the base64 string for analysis
      const base64Image = buffer.toString('base64');
      content = "[Image Content]"; // Placeholder for DB text content

      const promptText = instructions || "Analyze this image. If it contains text, transcribe it exactly (OCR). If it contains charts or visual data, summarize the insights.";
      // For OCR/Scan, we treat the result as the extraction
      try {
        const analysis = await analyzeImage(base64Image, promptText, model);
        result = analysis;
        content = analysis; // Store the extracted text as content
      } catch (error) {
        console.error('OCR processing error:', error);
        return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
      }

    } else {
      // Parse standard document
      try {
        content = await parseDocument(buffer, fileType);
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to parse document. Please ensure it\'s a valid TXT, DOCX, CSV, Excel or PDF file.' },
          { status: 400 }
        );
      }

      // Process document with AI
      try {
        if (operation === 'translate') {
          result = await translateDocument(content, language, model, glossaryContext);
        } else if (operation === 'edit') {
          if (!instructions) {
            return NextResponse.json({ error: 'Instructions required for edit mode' }, { status: 400 });
          }
          result = await editDocument(content, instructions, model);
        } else {
          result = await summarizeDocument(content, model);
        }
      } catch (error) {
        console.error('AI processing error:', error);
        return NextResponse.json(
          { error: 'Failed to process document with AI' },
          { status: 500 }
        );
      }
    }

    // Create document record
    const document = await DocumentModel.create({
      userId: user.userId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      content, // For OCR, this is extracted text; for docs, it's parsed text
      operation,
      model,
      language: operation === 'translate' ? language : undefined,
      status: 'completed',
      result: typeof result === 'string' ? result : JSON.stringify(result), // Store JSON string for structured
    });

    return NextResponse.json({
      success: true,
      document: {
        documentId: document.documentId,
        fileName: document.fileName,
        operation: document.operation,
        model: document.model,
        result: document.result,
        status: document.status,
        createdAt: document.createdAt,
      },
    });
  } catch (error) {
    console.error('Process document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}