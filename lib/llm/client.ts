import OpenAI from "openai";

if (typeof window !== "undefined") {
    throw new Error("OpenAI client can only be used on the server side.");
}

if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is missing. Please configure it in your environment settings.");
}

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
