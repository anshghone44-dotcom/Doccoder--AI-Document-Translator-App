import { generateText } from "ai"

export interface GrammarError {
  type: "grammar" | "spelling" | "punctuation" | "style"
  position: number
  original: string
  suggestion: string
  explanation: string
  severity: "low" | "medium" | "high"
}

export interface ComplianceIssue {
  type: "cultural" | "legal" | "sensitive" | "brand"
  text: string
  issue: string
  suggestion: string
  severity: "low" | "medium" | "high"
}

export interface ReviewResult {
  grammarErrors: GrammarError[]
  complianceIssues: ComplianceIssue[]
  overallScore: number
  recommendations: string[]
}

/**
 * Detect grammar and spelling errors in translated text
 */
export async function detectGrammarErrors(text: string, language: string): Promise<GrammarError[]> {
  try {
    const { text: response } = await generateText({
      model: "openai/gpt-4-mini",
      prompt: `Review the following ${language} text for grammar, spelling, punctuation, and style errors.
      For each error found, provide:
      1. Error type (grammar/spelling/punctuation/style)
      2. The incorrect text
      3. The correction
      4. Brief explanation
      5. Severity (low/medium/high)
      
      Format as JSON array with objects containing: type, original, suggestion, explanation, severity
      
      Text: "${text}"
      
      Errors (JSON):`,
      temperature: 0.7,
    })

    try {
      const errors = JSON.parse(response)
      return Array.isArray(errors)
        ? errors.map((err, idx) => ({
            ...err,
            position: idx,
          }))
        : []
    } catch {
      return []
    }
  } catch (error) {
    console.error("[v0] Error detecting grammar errors:", error)
    return []
  }
}

/**
 * Check for cultural sensitivity and compliance issues
 */
export async function checkCompliance(
  text: string,
  targetLanguage: string,
  targetCulture?: string,
): Promise<ComplianceIssue[]> {
  try {
    const { text: response } = await generateText({
      model: "openai/gpt-4-mini",
      prompt: `Review the following text for cultural sensitivity, legal compliance, and potential issues in ${targetLanguage}${targetCulture ? ` (${targetCulture} context)` : ""}.
      
      Check for:
      1. Culturally insensitive language
      2. Potentially offensive terms
      3. Legal or regulatory concerns
      4. Brand safety issues
      
      For each issue found, provide:
      1. Issue type (cultural/legal/sensitive/brand)
      2. The problematic text
      3. Description of the issue
      4. Suggested replacement
      5. Severity (low/medium/high)
      
      Format as JSON array with objects containing: type, text, issue, suggestion, severity
      
      Text: "${text}"
      
      Issues (JSON):`,
      temperature: 0.7,
    })

    try {
      const issues = JSON.parse(response)
      return Array.isArray(issues) ? issues : []
    } catch {
      return []
    }
  } catch (error) {
    console.error("[v0] Error checking compliance:", error)
    return []
  }
}

/**
 * Generate overall quality score
 */
function calculateQualityScore(grammarErrors: GrammarError[], complianceIssues: ComplianceIssue[]): number {
  let score = 100

  // Deduct points for grammar errors
  grammarErrors.forEach((error) => {
    const deduction = error.severity === "high" ? 5 : error.severity === "medium" ? 3 : 1
    score -= deduction
  })

  // Deduct points for compliance issues
  complianceIssues.forEach((issue) => {
    const deduction = issue.severity === "high" ? 10 : issue.severity === "medium" ? 5 : 2
    score -= deduction
  })

  return Math.max(0, Math.min(100, score))
}

/**
 * Generate recommendations based on review
 */
function generateRecommendations(grammarErrors: GrammarError[], complianceIssues: ComplianceIssue[]): string[] {
  const recommendations: string[] = []

  // Grammar recommendations
  const highGrammarErrors = grammarErrors.filter((e) => e.severity === "high")
  if (highGrammarErrors.length > 0) {
    recommendations.push(`Fix ${highGrammarErrors.length} critical grammar error(s) before publishing`)
  }

  const mediumGrammarErrors = grammarErrors.filter((e) => e.severity === "medium")
  if (mediumGrammarErrors.length > 0) {
    recommendations.push(`Review ${mediumGrammarErrors.length} grammar issue(s) for better clarity`)
  }

  // Compliance recommendations
  const highComplianceIssues = complianceIssues.filter((i) => i.severity === "high")
  if (highComplianceIssues.length > 0) {
    recommendations.push(`Address ${highComplianceIssues.length} critical compliance issue(s)`)
  }

  const culturalIssues = complianceIssues.filter((i) => i.type === "cultural")
  if (culturalIssues.length > 0) {
    recommendations.push(`Review ${culturalIssues.length} cultural sensitivity concern(s)`)
  }

  if (recommendations.length === 0) {
    recommendations.push("Translation looks good! Minor style improvements could enhance readability.")
  }

  return recommendations
}

/**
 * Perform comprehensive AI review
 */
export async function performAIReview(text: string, language: string, targetCulture?: string): Promise<ReviewResult> {
  try {
    const [grammarErrors, complianceIssues] = await Promise.all([
      detectGrammarErrors(text, language),
      checkCompliance(text, language, targetCulture),
    ])

    const overallScore = calculateQualityScore(grammarErrors, complianceIssues)
    const recommendations = generateRecommendations(grammarErrors, complianceIssues)

    return {
      grammarErrors,
      complianceIssues,
      overallScore,
      recommendations,
    }
  } catch (error) {
    console.error("[v0] Error performing AI review:", error)
    throw new Error("Failed to perform AI review")
  }
}
