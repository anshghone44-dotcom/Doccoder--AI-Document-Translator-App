import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { xai } from "@ai-sdk/xai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Logger } from "@/lib/logger";

/**
 * Production-Safe Model Registry
 * Centralizes model mapping, provider selection, and API key validation.
 */

export type AIProvider = "openai" | "anthropic" | "xai" | "google" | "elevenlabs";

export interface ModelConfig {
    provider: AIProvider;
    actualModel: string;
}

const MODEL_MAPPING: Record<string, ModelConfig> = {
    "openai/gpt-5": { provider: "openai", actualModel: "gpt-4o" },
    "xai/grok-4": { provider: "xai", actualModel: "grok-3" },
    "anthropic/claude-4.1": { provider: "anthropic", actualModel: "claude-3-5-sonnet-latest" },
    "openai/gpt-4-mini": { provider: "openai", actualModel: "gpt-4o-mini" },
    "xai/grok-3": { provider: "xai", actualModel: "grok-3" },
    "anthropic/claude-3.1": { provider: "anthropic", actualModel: "claude-3-5-haiku-20241022" },
    "google/gemini-pro": { provider: "google", actualModel: "gemini-3.1-pro-preview" },
    "google/gemini-flash": { provider: "google", actualModel: "gemini-2.0-flash" },
    "google/gemini-1.5-pro": { provider: "google", actualModel: "gemini-3.1-pro-preview" },
    "google/gemini-1.5-flash": { provider: "google", actualModel: "gemini-2.0-flash" }
};

/**
 * Dynamically selects the best available default model based on configured API keys.
 */
export function getDefaultModel(): ModelConfig {
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (process.env.OPENAI_API_KEY) return { provider: "openai", actualModel: "gpt-4o-mini" };
    if (geminiKey) return { provider: "google", actualModel: "gemini-2.0-flash" };
    if (process.env.ANTHROPIC_API_KEY) return { provider: "anthropic", actualModel: "claude-3-5-haiku-20241022" };

    return { provider: "openai", actualModel: "gpt-4o-mini" }; // Fallback to OpenAI (will throw later if key missing)
}

/**
 * Validates the presence and format of API keys for the requested provider.
 * @throws Error if key is missing or invalid.
 */
export function validateProviderKey(provider: AIProvider): void {
    const keyMap: Record<AIProvider, { envs: string[]; name: string }> = {
        openai: { envs: ["OPENAI_API_KEY"], name: "OpenAI" },
        anthropic: { envs: ["ANTHROPIC_API_KEY"], name: "Anthropic" },
        xai: { envs: ["XAI_API_KEY"], name: "xAI (Grok)" },
        google: { envs: ["GOOGLE_GENERATIVE_AI_API_KEY", "GEMINI_API_KEY"], name: "Google Gemini" },
        elevenlabs: { envs: ["ELEVENLABS_API_KEY"], name: "ElevenLabs" }
    };

    const config = keyMap[provider];
    let key: string | undefined;
    
    // Try each environment variable in order
    for (const env of config.envs) {
        key = process.env[env]?.trim();
        if (key) break;
    }

    if (!key) {
        throw new Error(`${config.name} API key missing. Please set ${config.envs.join(" or ")}.`);
    }

    if (key.includes("your-") || key.includes("YOUR_") || key.length < 15) {
        throw new Error(`The ${config.name} API key appears to be a placeholder or is incorrectly formatted.`);
    }
}

/**
 * Checks if the primary AI services are ready for operation.
 * Now returns true if AT LEAST ONE primary provider (OpenAI or Google) is configured.
 */
export function isLLMReady(checkVoice = false): boolean {
    const hasOpenAI = !!process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("your-");
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    const hasGoogle = !!geminiKey && !geminiKey.includes("your-"); // Check for placeholder, not "AIzaSy" which is legitimate
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;

    if (checkVoice) {
        const hasVoice = !!process.env.ELEVENLABS_API_KEY;
        return (hasOpenAI || hasGoogle || hasAnthropic) && hasVoice;
    }

    return hasOpenAI || hasGoogle || hasAnthropic;
}

/**
 * Returns a configured model instance based on the requested model string.
 * Handles mapping, provider selection, and key validation.
 */
export function getModelInstance(requestedModel: string) {
    // Check if model exists in mapping
    if (!MODEL_MAPPING[requestedModel]) {
        // Log warning but don't fail - use default
        Logger.warn("Model not found in mapping, using default", { requestedModel, availableModels: Object.keys(MODEL_MAPPING) });
    }
    
    const config = MODEL_MAPPING[requestedModel] || getDefaultModel();

    try {
        validateProviderKey(config.provider);

        switch (config.provider) {
            case "anthropic":
                return anthropic(config.actualModel);
            case "xai": {
                const apiKey = process.env.XAI_API_KEY;
                if (!apiKey) {
                    throw new Error("xAI API key not found. Please set XAI_API_KEY.");
                }
                return xai(config.actualModel);
            }
            case "google": {
                const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
                if (!apiKey) {
                    throw new Error("Google Gemini API key not found. Please set GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY.");
                }
                const google = createGoogleGenerativeAI({
                    apiKey
                });
                return google(config.actualModel);
            }
            case "openai":
            default:
                return openai(config.actualModel);
        }
    } catch (error: any) {
        Logger.error("Model initialization failed", error, { requestedModel, mappedModel: config.actualModel, provider: config.provider });
        throw error;
    }
}

/**
 * Helper to parse a requested model string into it's provider and ID parts.
 */
export function parseModelString(modelStr: string): { provider: string; modelId: string } {
    const parts = modelStr.split("/");
    if (parts.length === 2) {
        return { provider: parts[0], modelId: parts[1] };
    }
    return { provider: "openai", modelId: modelStr || "gpt-4o-mini" };
}
