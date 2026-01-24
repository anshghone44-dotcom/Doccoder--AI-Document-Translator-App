import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { Logger } from "@/lib/logger";

/**
 * Generates a single embedding for a piece of text.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const { embedding } = await embed({
            model: openai.embedding("text-embedding-3-small"),
            value: text,
        });
        return embedding;
    } catch (error) {
        Logger.error("Failed to generate embedding", error);
        throw error;
    }
}

/**
 * Generates multiple embeddings for an array of texts.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
        const { embeddings } = await embedMany({
            model: openai.embedding("text-embedding-3-small"),
            values: texts,
        });
        return embeddings;
    } catch (error) {
        Logger.error("Failed to generate multiple embeddings", error);
        throw error;
    }
}
