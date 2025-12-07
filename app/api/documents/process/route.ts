import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import DocumentModel from '@/lib/models/Document';
import { parseDocument } from '@/lib/document-parser';
import { translateDocument, summarizeDocument } from '@/lib/ai-service';

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
    const operation = formData.get('operation') as 'translate' | 'summarize';
    const model = formData.get('model') as 'gpt-5' | 'claude-sonnet';
    const language = formData.get('language') as string;

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

    // Parse document
    let content: string;
    try {
      content = await parseDocument(buffer, fileType);
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to parse document. Please ensure it\'s a valid TXT, DOCX, or PDF file.' },
        { status: 400 }
      );
    }

    // Create document record
    const document = await DocumentModel.create({
      userId: user.userId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      content,
      operation,
      model,
      language: operation === 'translate' ? language : undefined,
      status: 'processing',
    });

    // Process document with AI
    let result: string;
    try {
      if (operation === 'translate') {
        result = await translateDocument(content, language, model);
      } else {
        result = await summarizeDocument(content, model);
      }

      // Update document with result
      document.result = result;
      document.status = 'completed';
      await document.save();
    } catch (error) {
      console.error('AI processing error:', error);
      document.status = 'failed';
      await document.save();
      
      return NextResponse.json(
        { error: 'Failed to process document with AI' },
        { status: 500 }
      );
    }

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