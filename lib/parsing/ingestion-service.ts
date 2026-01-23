import { extractPdfContent, formatExtractedContent } from "./pdf-ocr-processor";
import mammoth from "mammoth";
import { Logger } from "@/lib/logger";

export interface IngestedDocument {
    content: string;
    metadata: {
        sourceName: string;
        pageCount?: number;
        author?: string;
        [key: string]: any;
    };
}

/**
 * Unified service for ingesting different document formats.
 */
export const IngestionService = {
    /**
     * Extracts text and metadata from a file.
     */
    async ingestFile(file: File): Promise<IngestedDocument> {
        const arrayBuffer = await file.arrayBuffer();
        const ext = (file.name.split(".").pop() || "").toLowerCase();

        Logger.info("Ingesting file", { filename: file.name, extension: ext });

        switch (ext) {
            case "pdf":
                return this.ingestPdf(arrayBuffer, file.name);
            case "docx":
                return this.ingestDocx(arrayBuffer, file.name);
            case "txt":
                return this.ingestTxt(arrayBuffer, file.name);
            default:
                throw new Error(`Unsupported file format for ingestion: ${ext}`);
        }
    },

    private async ingestPdf(arrayBuffer: ArrayBuffer, filename: string): Promise<IngestedDocument> {
        const result = await extractPdfContent(arrayBuffer, filename);
        return {
            content: result.text,
            metadata: {
                sourceName: filename,
                pageCount: result.metadata.pageCount,
                author: result.metadata.author
            }
        };
    },

    private async ingestDocx(arrayBuffer: ArrayBuffer, filename: string): Promise<IngestedDocument> {
        const result = await mammoth.extractRawText({ arrayBuffer });
        return {
            content: result.value,
            metadata: {
                sourceName: filename
            }
        };
    },

    private async ingestTxt(arrayBuffer: ArrayBuffer, filename: string): Promise<IngestedDocument> {
        const content = new TextDecoder("utf-8").decode(new Uint8Array(arrayBuffer));
        return {
            content,
            metadata: {
                sourceName: filename
            }
        };
    }
};
