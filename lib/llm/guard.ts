export interface GuardResult {
    refuse: boolean;
    message?: string;
    messages?: any[];
}

function isGreeting(text: string) {
    return ["hi", "hello", "hey", "greeting", "namaste", "hola"].includes(text.toLowerCase().trim());
}

export function buildGuardedPrompt(userText: string, documentContext?: string): GuardResult {
    // 0. Greeting Check
    if (isGreeting(userText)) {
        return {
            refuse: true,
            message: "Hello. Please upload a document or ask a question about it."
        };
    }

    // 1. Check for missing context
    if (!documentContext || documentContext.trim().length === 0) {
        return {
            refuse: true,
            message: "I'm sorry, I don't have any document context to answer from. Please upload a document first."
        };
    }

    // 2. Construct the strict system prompt
    const systemPrompt = `
You are a strict document-only assistant. 
Your ONLY source of truth is the provided document context below. 
If the answer to the user's question is not explicitly found in the context, you must state that you do not know.
Do NOT use any outside knowledge.
Do NOT hallucinate.

RESPONSE RULES:
- Be extremely concise.
- Provide voice-friendly responses (no markdown, no bolding, no lists, no special characters).
- Speak in natural, complete sentences.
- If the information is missing, say exactly: "I'm sorry, I couldn't find that information in the document."

DOCUMENT CONTEXT:
${documentContext}
  `.trim();

    const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userText }
    ];

    return {
        refuse: false,
        messages
    };
}
