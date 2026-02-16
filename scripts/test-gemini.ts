import { getModelInstance } from "../lib/ai/models";
import { generateText } from "ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testGemini() {
    console.log("Starting Gemini Integration Test...");

    try {
        const model = getModelInstance("google/gemini-flash");
        console.log("Model instance created successfully.");

        const { text } = await generateText({
            model,
            prompt: "Hello, Gemini! Can you confirm you are working correctly?",
        });

        console.log("Gemini Response:", text);
        console.log("Test Passed!");
    } catch (error: any) {
        console.error("Test Failed:", error.message);
        if (error.message.includes("API key missing")) {
            console.log("Note: This is expected if GOOGLE_GENERATIVE_AI_API_KEY is not set in .env.local yet.");
        }
    }
}

testGemini();
