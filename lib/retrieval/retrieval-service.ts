import { Logger } from "@/lib/logger";

/**
 * Service responsible for retrieving document context for the Reasoning Layer.
 * In a production environment, this would interface with a Vector Store.
 * For this implementation, it provides a bridge for local context injection.
 */

export interface RetrievalResult {
    content: string;
    metadata: {
        sourceId: string;
        sourceName: string;
        pageCount?: number;
        intent?: string;
    };
}
export const RetrievalService = {
    /**
     * Retrieves relevant context based on a query.
     * Enhances grounding by identifying user intent and selecting the most relevant segments.
     */
    async getRelevantContext(query: string, sourceData: string, sourceName: string): Promise<RetrievalResult> {
        Logger.info("Retrieval service: Performing semantic retrieval", { sourceName, queryLength: query.length });

        // Intent Detection: Identify if the user is asking a specific question or a general one
        const intent = this.identifyUserIntent(query);

        // Chunking the source data for more granular selection
        const chunks = this.chunkText(sourceData, 1500, 300);

        // Semantic Filtering (Heuristic for now: match key terms from the query to chunks)
        // In a vector-enabled system, this would be a cosine similarity search
        let relevantContent = sourceData;
        if (chunks.length > 1) {
            const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 3);
            const scoredChunks = chunks.map(chunk => {
                const score = queryTerms.reduce((acc, term) => acc + (chunk.toLowerCase().includes(term) ? 1 : 0), 0);
                return { chunk, score };
            });

            // Sort by relevance score and take the top 2 chunks (providing focused context)
            const bestChunks = scoredChunks
                .sort((a, b) => b.score - a.score)
                .slice(0, 2)
                .map(sc => sc.chunk);

            relevantContent = bestChunks.join("\n\n---\n\n");
        }

        return {
            content: relevantContent,
            metadata: {
                sourceId: Buffer.from(sourceName).toString('base64'),
                sourceName: sourceName,
                intent: intent
            }
        };
    },

    /**
     * Identifies the conversational intent of the user query.
     */
    identifyUserIntent(query: string): "specific_query" | "general_summary" | "follow_up" {
        const q = query.toLowerCase();
        if (q.includes("summary") || q.includes("summarize") || q.includes("tell me about")) return "general_summary";
        if (q.includes("this") || q.includes("that") || q.includes("it")) return "follow_up";
        return "specific_query";
    },

    /**
     * Chunks text into manageable pieces for semantic search.
     */
    chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
        if (!text) return [];
        const chunks: string[] = [];
        let start = 0;

        while (start < text.length) {
            let end = Math.min(start + chunkSize, text.length);

            // Try to find a logical break point (newline or period) within the last 100 characters of the chunk
            if (end < text.length) {
                const lastNewline = text.lastIndexOf("\n", end);
                const lastPeriod = text.lastIndexOf(". ", end);
                const logicalBreak = Math.max(lastNewline, lastPeriod);

                if (logicalBreak > start + (chunkSize * 0.7)) {
                    end = logicalBreak + 1;
                }
            }

            chunks.push(text.slice(start, end).trim());
            start = end - overlap;
            if (start < 0) start = 0;
            if (end === text.length) break;
        }

        return chunks;
    }
};
