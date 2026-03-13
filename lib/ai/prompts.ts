/**
 * MANDATORY SYSTEM PROMPTS FOR DOCODER AI ASSISTANT
 * These prompts are loaded from external files to avoid webpack caching issues.
 */

let cachedGroundedPrompt: string | null = null;
let cachedTranslationPrompt: string | null = null;

async function loadPrompt(filename: string): Promise<string> {
  try {
    const response = await fetch(`/lib/ai/prompts/${filename}`);
    if (!response.ok) throw new Error(`Failed to load ${filename}`);
    return await response.text();
  } catch (error) {
    console.error(`Error loading prompt ${filename}:`, error);
    // Fallback to hardcoded prompt if file loading fails
    return filename === 'grounded-chat.txt' ? getDefaultGroundedPrompt() : getDefaultTranslationPrompt();
  }
}

function getDefaultGroundedPrompt(): string {
  return `You are the Voice-Native Document Agent—a conversational expert designed to transform static documents into interactive knowledge.
Your intelligence is grounded solely in the provided document evidence.

Your goal is to provide fluid, helpful, and expert guidance. You should behave like a professional assistant who has mastered the document.

CORE RULES:
1. SOURCE OF TRUTH: You may ONLY use the retrieved document context provided to you.
2. HALLUCINATION CONTROL: Never guess, infer beyond the document, or fill gaps with assumptions.
3. REFUSAL BEHAVIOR: If the document does not contain the answer, respond with "This document does not contain that information."

OUTPUT STRUCTURE:
- Answer: A clear, direct response OR a refusal statement.
- Citations: Explicit references to page numbers, sections, or source IDs.
- Confidence Level: High, Partial, or Not Found`;
}

function getDefaultTranslationPrompt(): string {
  return `You are an AI assistant that translates documents while preserving meaning and formatting.
Handle PDF, DOCX, and TXT files. All processing occurs within the app or server.

Instructions:
1. Detect the original language automatically or use the specified language.
2. Translate accurately into the target language.
3. Preserve formatting (headings, bullet points, tables, numbered lists).
4. Keep images and diagrams unchanged.
5. Convert to the user-specified output format.`;
}

export async function getGroundedChatSystemPrompt(): Promise<string> {
  if (cachedGroundedPrompt) return cachedGroundedPrompt;
  cachedGroundedPrompt = await loadPrompt('grounded-chat.txt');
  return cachedGroundedPrompt;
}

export async function getDocumentTranslationSystemPrompt(): Promise<string> {
  if (cachedTranslationPrompt) return cachedTranslationPrompt;
  cachedTranslationPrompt = await loadPrompt('document-translation.txt');
  return cachedTranslationPrompt;
}

export async function getGroundedPrompt(mode: 'strict' | 'explainer' | 'summary', language: string): Promise<string> {
  let modeInstruction = "";

  if (mode === 'explainer') {
    modeInstruction = "- Mode: EXPLAINER. Provide slightly more detail and context while staying strictly within document bounds.";
  } else if (mode === 'summary') {
    modeInstruction = "- Mode: SUMMARY. Provide a high-level overview of the document evidence pertaining to the query.";
  } else {
    modeInstruction = "- Mode: STRICT. Provide a direct, minimal answer with maximum accuracy.";
  }

  const basePrompt = await getGroundedChatSystemPrompt();

  return `
${basePrompt}

CURRENT CONFIGURATION:
- Language: ${language}
${modeInstruction}

REMEMBER: If it is not in the document, it does not exist.
`;
}
