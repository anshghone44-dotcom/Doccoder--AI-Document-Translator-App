import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseDocument } from '@/lib/document-parser';
import { translateDocument, summarizeDocument, editDocument, analyzeImage, TranslationResult } from '@/lib/ai-service';

export const maxDuration = 60; // Allow longer timeout for AI

export async function POST(request: NextRequest) {
    try {
        // Authenticate user with Supabase
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('Auth error:', authError);
            return NextResponse.json(
                { error: 'Unauthorized', details: authError?.message || 'Access denied' },
                { status: 401 }
            );
        }

        // Parse form data
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const operation = formData.get('operation') as string;
        const model = (formData.get('model') as string) || 'gpt-4o';
        const language = formData.get('language') as string;
        const instructions = formData.get('instructions') as string;
        const glossary = formData.get('glossary') as File | null;

        if (!file || !operation) {
            return NextResponse.json(
                { error: 'File and operation are required' },
                { status: 400 }
            );
        }

        // Parse glossary if provided
        let glossaryContext = undefined;
        if (glossary) {
            try {
                const glossaryContent = await parseDocument(glossary);
                glossaryContext = glossaryContent.content;
            } catch (e) {
                console.warn('Failed to parse glossary:', e);
            }
        }

        let content = '';
        let result: string | TranslationResult = '';

        // Handle Image OCR separately
        if (operation === 'ocr' || (file.type && file.type.startsWith('image/'))) {
            // Convert file to base64
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64 = buffer.toString('base64');
            const mimeType = file.type || 'image/jpeg';

            const ocrResult = await analyzeImage(base64, mimeType, instructions || "Extract all text from this image and format it typically.");
            content = '[Image Content]'; // We don't have raw text yet
            result = ocrResult;
        }
        // Handle Interactive Edit separately
        else if (operation === 'edit') {
            // Parse the file to get the content to edit
            const docContent = await parseDocument(file);
            content = docContent.content;

            if (!instructions) {
                return NextResponse.json({ error: 'Instructions are required for edit operation' }, { status: 400 });
            }

            result = await editDocument(content, instructions, model);
        }
        // Standard Translation/Summarization
        else {
            const docContent = await parseDocument(file);
            content = docContent.content;

            if (operation === 'translate') {
                if (!language) {
                    return NextResponse.json(
                        { error: 'Language is required for translation' },
                        { status: 400 }
                    );
                }
                result = await translateDocument(content, language, model, glossaryContext);
            } else if (operation === 'summarize') {
                result = await summarizeDocument(content, model);
            } else {
                return NextResponse.json(
                    { error: 'Invalid operation' },
                    { status: 400 }
                );
            }
        }

        // Create document record (MOCKED for now as DB is missing)
        const document = {
            documentId: 'mock-id-' + Date.now(),
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            content: content.substring(0, 100) + '...', // Truncate for preview
            operation,
            model,
            language: operation === 'translate' ? language : undefined,
            status: 'completed',
            result: typeof result === 'string' ? result : JSON.stringify(result),
            createdAt: new Date(),
        };

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

    } catch (error: any) {
        console.error('Processing error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process document' },
            { status: 500 }
        );
    }
}
