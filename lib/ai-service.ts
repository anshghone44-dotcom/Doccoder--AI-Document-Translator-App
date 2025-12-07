const EMERGENT_API_KEY = process.env.EMERGENT_API_KEY;
const EMERGENT_API_URL = 'https://api.emergent.sh/v1';

export interface AIRequest {
  prompt: string;
  model: 'gpt-5' | 'claude-sonnet';
  maxTokens?: number;
  temperature?: number;
}

export async function callAI(request: AIRequest): Promise<string> {
  if (!EMERGENT_API_KEY) {
    throw new Error('EMERGENT_API_KEY is not configured');
  }

  try {
    const response = await fetch(`${EMERGENT_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EMERGENT_API_KEY}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: [
          {
            role: 'user',
            content: request.prompt,
          },
        ],
        max_tokens: request.maxTokens || 4000,
        temperature: request.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`AI API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI Service Error:', error);
    throw error;
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