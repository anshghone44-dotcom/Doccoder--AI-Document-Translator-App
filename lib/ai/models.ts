import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { xai } from "@ai-sdk/xai";
import { Logger } from "@/lib/logger";

/**
 * Production-Safe Model Registry
 * Centralizes model mapping, provider selection, and API key validation.
 */

export type AIProvider = "openai" | "anthropic" | "xai" | "elevenlabs";

export interface ModelConfig {
    provider: AIProvider;
    actualModel: string;
}

const MODEL_MAPPING: Record<string, ModelConfig> = {
    "openai/gpt-5": { provider: "openai", actualModel: "gpt-4o" },
    "xai/grok-4": { provider: "openai", actualModel: "gpt-4o" },
    "anthropic/claude-4.1": { provider: "anthropic", actualModel: "claude-3-5-sonnet-latest" },
    "openai/gpt-4-mini": { provider: "openai", actualModel: "gpt-4o-mini" },
    "xai/grok-3": { provider: "openai", actualModel: "gpt-4o" },
    "anthropic/claude-3.1": { provider: "anthropic", actualModel: "claude-3-5-haiku-20241022" }
};

const DEFAULT_MODEL: ModelConfig = { provider: "openai", actualModel: "gpt-4o-mini" };

/**
 * Validates the presence and format of API keys for the requested provider.
 * @throws Error if key is missing or invalid.
 */
export function validateProviderKey(provider: AIProvider): void {
    const keyMap: Record<AIProvider, { env: string; name: string }> = {
        openai: { env: "OPENAI_API_KEY", name: "OpenAI" },
        anthropic: { env: "ANTHROPIC_API_KEY", name: "Anthropic" },
        xai: { env: "XAI_API_KEY", name: "xAI (Grok)" },
        elevenlabs: { env: "ELEVENLABS_API_KEY", name: "ElevenLabs" }
    };

    const config = keyMap[provider];
    const key = process.env[config.env]?.trim();

    if (!key) {
        throw new Error(`${config.name} API key missing.`);
    }

    if (key.includes("your-") || key.includes("YOUR_") || key.length < 15) {
        throw new Error(`The ${config.name} API key appears to be a placeholder or is incorrectly formatted.`);
    }
}

/**
 * Checks if the primary AI services are ready for operation.
 */
export function isLLMReady(checkVoice = false): boolean {
    try {
        validateProviderKey("openai");
        if (checkVoice) validateProviderKey("elevenlabs");

        console.log("LLM READY: PASS");
        return true;
    } catch (err: any) {
        console.error("LLM READY: FAIL →", err.message);
        return false;
    }
}

/**
 * Returns a configured model instance based on the requested model string.
 * Handles mapping, provider selection, and key validation.
 */
export function getModelInstance(requestedModel: string) {
    const config = MODEL_MAPPING[requestedModel] || DEFAULT_MODEL;

    try {
        validateProviderKey(config.provider);

        switch (config.provider) {
            case "anthropic":
                return anthropic(config.actualModel);
            case "xai":
                return xai(config.actualModel);
            case "openai":
            default:
                return openai(config.actualModel);
        }
    } catch (error: any) {
        Logger.error("Model initialization failed", error, { requestedModel, provider: config.provider });
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
