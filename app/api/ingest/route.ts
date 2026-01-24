import { NextRequest, NextResponse } from "next/server";
import { IngestionService } from "@/lib/parsing/ingestion-service";
import { Logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
    const requestId = Math.random().toString(36).substring(7);

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({
                error: "Invalid Request",
                message: "A document file is required for ingestion."
            }, { status: 400 });
        }

        Logger.info("Ingest API: Starting document ingestion", {
            requestId,
            filename: file.name,
            size: file.size
        });

        const { documentId, document } = await IngestionService.processForRAG(file);

        Logger.info("Ingest API: Ingestion complete", { requestId, documentId });

        return NextResponse.json({
            documentId,
            filename: file.name,
            content: document.content.slice(0, 10000), // Return partial content for client-side fallback if needed
            fullContent: document.content // Optional but helpful for local experiments
        });

    } catch (error: any) {
        Logger.error("Ingest API: Fatal exception", error, { requestId });
        return NextResponse.json({
            error: "Ingestion Fault",
            message: `The document intelligence engine failed to process the file: ${error.message}`
        }, { status: 500 });
    }
}
