import OpenAI from "openai";

if (typeof window !== "undefined") {
    throw new Error("OpenAI client can only be used on the server side.");
}

console.log("OpenAI key exists:", !!process.env.OPENAI_API_KEY);

const getApiKey = () => process.env.OPENAI_API_KEY?.trim();

export const openai = new Proxy({} as OpenAI, {
    get(target, prop, receiver) {
        const key = getApiKey();
        if (!key) {
            throw new Error("OpenAI API key missing. Please check your environment variables.");
        }

        // Initialize real client on first access
        const client = new OpenAI({ apiKey: key });
        return Reflect.get(client, prop, receiver);
    }
});
