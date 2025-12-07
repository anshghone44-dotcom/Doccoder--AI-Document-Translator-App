import OpenAI from 'openai';

const EMERGENT_API_KEY = process.env.EMERGENT_API_KEY;

export interface AIRequest {
  prompt: string;
  model: 'gpt-5' | 'claude-sonnet';
  maxTokens?: number;
  temperature?: number;
}

// Initialize two separate clients for GPT and Claude
const gptClient = new OpenAI({
  apiKey: EMERGENT_API_KEY,
  baseURL: 'https://api.openai.com/v1',
  dangerouslyAllowBrowser: false,
});

const claudeClient = new OpenAI({
  apiKey: EMERGENT_API_KEY,
  baseURL: 'https://api.anthropic.com/v1',
  defaultHeaders: {
    'anthropic-version': '2023-06-01',
  },
  dangerouslyAllowBrowser: false,
});

export async function callAI(request: AIRequest): Promise<string> {
  if (!EMERGENT_API_KEY) {
    throw new Error('EMERGENT_API_KEY is not configured');
  }

  try {
    if (request.model === 'claude-sonnet') {
      // Use Claude client
      const completion = await claudeClient.chat.completions.create({
        model: 'claude-sonnet-4-20250514',
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
    } else {
      // Use GPT client  
      const completion = await gptClient.chat.completions.create({
        model: 'gpt-4o',
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
    }
  } catch (error: any) {
    console.error('AI Service Error:', error);
    throw new Error(`AI processing failed: ${error.message || 'Unknown error'}`);
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