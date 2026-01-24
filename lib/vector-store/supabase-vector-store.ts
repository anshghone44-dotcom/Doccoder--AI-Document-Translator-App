import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/ai/embeddings";
import { DocumentChunk } from "@/lib/parsing/chunker";
import { Logger } from "@/lib/logger";

export interface SearchResult extends DocumentChunk {
    similarity: number;
}

/**
 * Service for interacting with the Supabase Vector Store.
 */
export const SupabaseVectorStore = {
    /**
     * Saves a set of chunks with their embeddings to the database.
     */
    async saveChunks(documentId: string, chunks: DocumentChunk[]) {
        const supabase = createClient();

        Logger.info("Saving chunks to vector store", {
            documentId,
            chunkCount: chunks.length
        });

        try {
            // Generate embeddings for all chunks (ideally batched)
            const rows = await Promise.all(chunks.map(async (chunk) => {
                const embedding = await generateEmbedding(chunk.content);
                return {
                    document_id: documentId,
                    content: chunk.content,
                    embedding,
                    metadata: chunk.metadata
                };
            }));

            const { error } = await supabase
                .from("document_sections")
                .insert(rows);

            if (error) throw error;

            Logger.info("Success: Chunks persisted to vector store", { documentId });
        } catch (error) {
            Logger.error("Failed to save chunks to vector store", error);
            throw error;
        }
    },

    /**
     * Performs a similarity search for a given query.
     */
    async similaritySearch(query: string, limit: number = 5, matchThreshold: number = 0.5): Promise<SearchResult[]> {
        const supabase = createClient();

        Logger.info("Performing similarity search", { query, limit });

        try {
            const embedding = await generateEmbedding(query);

            const { data, error } = await supabase.rpc("match_document_sections", {
                query_embedding: embedding,
                match_threshold: matchThreshold,
                match_count: limit
            });

            if (error) throw error;

            return (data as any[]).map(row => ({
                content: row.content,
                metadata: row.metadata,
                similarity: row.similarity
            }));
        } catch (error) {
            Logger.error("Similarity search failed", error);
            throw error;
        }
    }
};
