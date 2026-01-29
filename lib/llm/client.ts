import OpenAI from "openai";

if (typeof window !== "undefined") {
    throw new Error("OpenAI client can only be used on the server side.");
}

console.log("OpenAI key exists:", !!process.env.OPENAI_API_KEY);

const key = process.env.OPENAI_API_KEY?.trim();

if (!key) {
    throw new Error("OpenAI API key missing.");
}

export const openai = new OpenAI({
    apiKey: key,
});
