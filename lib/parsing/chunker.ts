import { Logger } from "@/lib/logger";

export interface ChunkMetadata {
    sourceId: string;
    sourceName: string;
    pageNumber?: number;
    sectionTitle?: string;
    [key: string]: any;
}

export interface DocumentChunk {
    content: string;
    metadata: ChunkMetadata;
}

/**
 * Chunks text into overlapping segments while preserving metadata.
 */
export async function chunkDocument(
    text: string,
    metadata: ChunkMetadata,
    chunkSize: number = 1000,
    overlap: number = 200
): Promise<DocumentChunk[]> {
    if (!text) return [];

    const chunks: DocumentChunk[] = [];
    let start = 0;

    let currentPage = metadata.pageNumber || 1;

    while (start < text.length) {
        let end = Math.min(start + chunkSize, text.length);

        // Detect page markers in the current window
        const windowText = text.slice(start, end);
        const pageMatch = windowText.match(/\[PAGE_(\d+)\]/);
        if (pageMatch) {
            currentPage = parseInt(pageMatch[1], 10);
        }

        // Try to find a logical break point (newline or period) within the last 20% of the chunk
        if (end < text.length) {
            const buffer = text.slice(start + (chunkSize * 0.8), end);
            const lastNewline = buffer.lastIndexOf("\n");
            const lastPeriod = buffer.lastIndexOf(". ");

            const logicalBreak = Math.max(lastNewline, lastPeriod);
            if (logicalBreak !== -1) {
                end = start + (chunkSize * 0.8) + logicalBreak + 1;
            }
        }

        const chunkContent = text.slice(start, end).replace(/\[PAGE_\d+\]\n?/g, "").trim();
        if (chunkContent.length > 0) {
            chunks.push({
                content: chunkContent,
                metadata: {
                    ...metadata,
                    pageNumber: currentPage
                }
            });
        }

        start = end - overlap;
        if (start < 0) start = 0;
        if (end === text.length) break;
    }

    Logger.info("Document chunked successfully", {
        sourceName: metadata.sourceName,
        chunkCount: chunks.length
    });

    return chunks;
}
