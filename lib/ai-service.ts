import OpenAI from 'openai';

const EMERGENT_API_KEY = process.env.EMERGENT_API_KEY;

export interface AIRequest {
  prompt: string;
  model: 'gpt-5' | 'claude-sonnet';
  maxTokens?: number;
  temperature?: number;
}

// Initialize OpenAI client with Emergent Universal Key
const openai = new OpenAI({
  apiKey: EMERGENT_API_KEY,
  baseURL: 'https://api.openai.com/v1', // Standard OpenAI endpoint
});

export async function callAI(request: AIRequest): Promise<string> {
  if (!EMERGENT_API_KEY) {
    throw new Error('EMERGENT_API_KEY is not configured');
  }

  // Map model names to actual OpenAI model names
  // Since we're using Emergent Universal Key, we'll use standard OpenAI models
  const modelMap: Record<string, string> = {
    'gpt-5': 'gpt-4o', // Using GPT-4o as proxy for GPT-5 (latest available)
    'claude-sonnet': 'gpt-4o', // Fallback to GPT-4o for Claude requests
  };

  const modelName = modelMap[request.model] || 'gpt-4o';

  try {
    const completion = await openai.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: 'user',
          content: request.prompt,
        },
      ],
      max_tokens: request.maxTokens || 4000,
      temperature: request.temperature || 0.7,
    });

    return completion.choices[0].message.content || '';
  } catch (error: any) {
    console.error('AI Service Error:', error);
    throw new Error(`AI processing failed: ${error.message}`);
  }
}

export async function translateDocument(text: string, targetLanguage: string, model: 'gpt-5' | 'claude-sonnet'): Promise<string> {
  const prompt = `Translate the following document to ${targetLanguage}. Maintain the original formatting and structure as much as possible.

Document:
${text}`;

  return await callAI({
    prompt,
    model,
    maxTokens: 4000,
    temperature: 0.3,
  });
}

export async function summarizeDocument(text: string, model: 'gpt-5' | 'claude-sonnet'): Promise<string> {
  const prompt = `Provide a comprehensive summary of the following document. Include key points, main ideas, and important details.

Document:
${text}`;

  return await callAI({
    prompt,
    model,
    maxTokens: 2000,
    temperature: 0.5,
  });
}