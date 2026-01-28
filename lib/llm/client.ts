import OpenAI from "openai";

if (typeof window !== "undefined") {
    throw new Error("OpenAI client can only be used on the server side.");
}

console.log("OpenAI key exists:", !!process.env.OPENAI_API_KEY);

if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not found in environment");
}

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
