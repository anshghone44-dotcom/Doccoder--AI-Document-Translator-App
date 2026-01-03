import { generateText } from "ai"

export interface DiffSegment {
  type: "added" | "removed" | "unchanged" | "modified"
  original: string
  translated: string
  similarity: number
}

export interface ComparisonResult {
  segments: DiffSegment[]
  changedMeanings: string[]
  synonyms: { original: string; alternatives: string[] }[]
  overallSimilarity: number
}

/**
 * Compare original and translated text with AI analysis
 */
export async function compareTranslations(
  originalText: string,
  translatedText: string,
  targetLanguage: string,
): Promise<ComparisonResult> {
  try {
    // Segment the texts
    const segments = segmentTexts(originalText, translatedText)

    // Analyze meaning changes
    const changedMeanings = await analyzeChangedMeanings(originalText, translatedText, targetLanguage)

    // Find synonyms and alternatives
    const synonyms = await findSynonymAlternatives(originalText, targetLanguage)

    // Calculate overall similarity
    const overallSimilarity = calculateSimilarity(originalText, translatedText)

    return {
      segments,
      changedMeanings,
      synonyms,
      overallSimilarity,
    }
  } catch (error) {
    console.error("[v0] Error comparing translations:", error)
    throw new Error("Failed to compare translations")
  }
}

/**
 * Segment texts into comparable chunks
 */
function segmentTexts(original: string, translated: string): DiffSegment[] {
  const originalSentences = original.split(/[.!?]+/).filter((s) => s.trim())
  const translatedSentences = translated.split(/[.!?]+/).filter((s) => s.trim())

  const segments: DiffSegment[] = []
  const maxLength = Math.max(originalSentences.length, translatedSentences.length)

  for (let i = 0; i < maxLength; i++) {
    const orig = originalSentences[i]?.trim() || ""
    const trans = translatedSentences[i]?.trim() || ""

    if (!orig && trans) {
      segments.push({
        type: "added",
        original: "",
        translated: trans,
        similarity: 0,
      })
    } else if (orig && !trans) {
      segments.push({
        type: "removed",
        original: orig,
        translated: "",
        similarity: 0,
      })
    } else if (orig && trans) {
      const similarity = calculateStringSimilarity(orig, trans)
      segments.push({
        type: similarity > 0.8 ? "unchanged" : "modified",
        original: orig,
        translated: trans,
        similarity,
      })
    }
  }

  return segments
}

/**
 * Analyze meaning changes between original and translation
 */
async function analyzeChangedMeanings(original: string, translated: string, targetLanguage: string): Promise<string[]> {
  try {
    const { text: analysis } = await generateText({
      model: "openai/gpt-4-mini",
      prompt: `Analyze the following original text and its ${targetLanguage} translation.
      Identify any significant changes in meaning, tone, or emphasis.
      List each change as a separate point:
      
      Original: "${original}"
      Translation: "${translated}"
      
      Meaning Changes:`,
      temperature: 0.7,
    })

    return analysis
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => line.replace(/^[-•*]\s*/, "").trim())
  } catch (error) {
    console.error("[v0] Error analyzing meaning changes:", error)
    return []
  }
}

/**
 * Find synonym alternatives for key terms
 */
async function findSynonymAlternatives(
  text: string,
  targetLanguage: string,
): Promise<{ original: string; alternatives: string[] }[]> {
  try {
    // Extract key terms (simple approach: words longer than 5 chars)
    const keyTerms = text
      .split(/\s+/)
      .filter((word) => word.length > 5 && !isCommonWord(word))
      .slice(0, 5)

    const synonymResults: { original: string; alternatives: string[] }[] = []

    for (const term of keyTerms) {
      const { text: synonymsText } = await generateText({
        model: "openai/gpt-4-mini",
        prompt: `Provide 3 alternative ${targetLanguage} translations for the word "${term}".
        Return them as a comma-separated list:`,
        temperature: 0.7,
      })

      synonymResults.push({
        original: term,
        alternatives: synonymsText
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
      })
    }

    return synonymResults
  } catch (error) {
    console.error("[v0] Error finding synonyms:", error)
    return []
  }
}

/**
 * Calculate string similarity using Levenshtein distance
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) return 1.0

  const editDistance = getEditDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

/**
 * Calculate Levenshtein distance
 */
function getEditDistance(s1: string, s2: string): number {
  const costs: number[] = []

  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j
      } else if (j > 0) {
        let newValue = costs[j - 1]
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
        }
        costs[j - 1] = lastValue
        lastValue = newValue
      }
    }
    if (i > 0) costs[s2.length] = lastValue
  }

  return costs[s2.length]
}

/**
 * Calculate overall similarity between two texts
 */
function calculateSimilarity(text1: string, text2: string): number {
  const similarity = calculateStringSimilarity(text1, text2)
  return Math.round(similarity * 100) / 100
}

/**
 * Check if word is common (stop word)
 */
function isCommonWord(word: string): boolean {
  const commonWords = [
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
  ]
  return commonWords.includes(word.toLowerCase())
}
