import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
    dangerouslyAllowBrowser: true, // Allow for client-side usage if needed, though typically server-side
});

export interface ReviewPoint {
    original: string;
    translation: string;
    confidence: number;
    alternatives: string[];
    reason: string;
}

export interface TranslationResult {
    translated_text: string;
    review_points: ReviewPoint[];
}

export async function translateDocument(
    content: string,
    targetLanguage: string,
    model: string = 'gpt-5',
    glossaryContext?: string
): Promise<TranslationResult> {
    // Map 'gpt-5' to a real model alias or use gpt-4o as placeholder for "Next Gen"
    const aiModel = model === 'gpt-5' ? 'gpt-4o' : 'gpt-4-turbo';

    let systemPrompt = `You are an expert translator specializing in high-accuracy professional and technical translations.
Translate the following text into ${targetLanguage}.
Output a JSON object with the following structure:
{
  "translated_text": "The full translated document text...",
  "review_points": [
    {
      "original": "source phrase",
      "translation": "translated phrase",
      "confidence": 0.0-1.0,
      "alternatives": ["alt1", "alt2"],
      "reason": "Explain any ambiguity or specific terminology choice."
    }
  ]
}
Identify key terms, ambiguous phrases, or culturally specific idioms and add them to "review_points".
`;

    if (glossaryContext) {
        systemPrompt += `\nUse the following glossary for consistent terminology:\n${glossaryContext}`;
    }

    try {
        const response = await openai.chat.completions.create({
            model: aiModel,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: content }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3,
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');
        return result as TranslationResult;

    } catch (error) {
        console.error("AI Translation Error:", error);
        // Fallback if JSON parse fails or other error
        return {
            translated_text: "Error generating translation. Please try again.",
            review_points: []
        };
    }
}

export async function summarizeDocument(content: string, model: string = 'gpt-5'): Promise<string> {
    const aiModel = model === 'gpt-5' ? 'gpt-4o' : 'gpt-4-turbo';

    try {
        const response = await openai.chat.completions.create({
            model: aiModel,
            messages: [
                { role: 'system', content: "Summarize the following document efficiently, capturing key points and action items." },
                { role: 'user', content: content }
            ],
            temperature: 0.5,
        });

        return response.choices[0].message.content || "No summary generated.";
    } catch (error) {
        console.error("AI Summary Error:", error);
        return "Failed to generate summary.";
    }
}

export async function editDocument(content: string, instructions: string, model: string = 'gpt-5'): Promise<TranslationResult> {
    const aiModel = model === 'gpt-5' ? 'gpt-4o' : 'gpt-4-turbo';

    const systemPrompt = `You are an intelligent document editor. 
Modify the text below according to the user's instructions: "${instructions}".
Return a JSON object:
{
  "translated_text": "The modified text...",
  "review_points": [
      {
      "original": "original segment changed",
      "translation": "new segment",
      "confidence": 1.0,
      "alternatives": [],
      "reason": "Why this change was made based on instructions."
    }
  ]
}`;

    try {
        const response = await openai.chat.completions.create({
            model: aiModel,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: content }
            ],
            response_format: { type: "json_object" },
        });

        return JSON.parse(response.choices[0].message.content || '{}') as TranslationResult;
    } catch (error) {
        console.error("AI Edit Error:", error);
        return { translated_text: "Editing failed.", review_points: [] };
    }
}

export async function analyzeImage(base64Image: string, mimeType: string, prompt: string): Promise<string> {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o", // Vision model
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${mimeType};base64,${base64Image}`,
                            },
                        },
                    ],
                },
            ],
        });

        return response.choices[0].message.content || "";
    } catch (error) {
        console.error("Vision API Error:", error);
        return "Failed to analyze image.";
    }
}
