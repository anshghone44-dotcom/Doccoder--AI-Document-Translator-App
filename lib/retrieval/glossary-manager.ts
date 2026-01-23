import { createClient } from "@/lib/supabase/server"

export interface GlossaryEntry {
  id?: string
  term: string
  translation: string
  languagePair: string
  context?: string
  category?: string
  createdAt?: string
}

export interface BrandStyle {
  id?: string
  tone: "formal" | "casual" | "professional" | "friendly"
  vocabulary: string[]
  avoidTerms: string[]
  preferredTerms: { [key: string]: string }
  guidelines: string[]
  createdAt?: string
}

/**
 * Add term to glossary
 */
export async function addGlossaryEntry(
  userId: string,
  entry: GlossaryEntry,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("glossary").insert({
      user_id: userId,
      term: entry.term,
      translation: entry.translation,
      language_pair: entry.languagePair,
      context: entry.context,
    })

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("[v0] Error adding glossary entry:", error)
    return { success: false, error: "Failed to add glossary entry" }
  }
}

/**
 * Get glossary entries for user
 */
export async function getGlossaryEntries(userId: string, languagePair?: string): Promise<GlossaryEntry[]> {
  try {
    const supabase = await createClient()

    let query = supabase.from("glossary").select("*").eq("user_id", userId)

    if (languagePair) {
      query = query.eq("language_pair", languagePair)
    }

    const { data, error } = await query

    if (error) throw error

    return (
      data?.map((entry) => ({
        id: entry.id,
        term: entry.term,
        translation: entry.translation,
        languagePair: entry.language_pair,
        context: entry.context,
        createdAt: entry.created_at,
      })) || []
    )
  } catch (error) {
    console.error("[v0] Error fetching glossary entries:", error)
    return []
  }
}

/**
 * Search glossary for term
 */
export async function searchGlossary(userId: string, searchTerm: string): Promise<GlossaryEntry[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("glossary")
      .select("*")
      .eq("user_id", userId)
      .ilike("term", `%${searchTerm}%`)

    if (error) throw error

    return (
      data?.map((entry) => ({
        id: entry.id,
        term: entry.term,
        translation: entry.translation,
        languagePair: entry.language_pair,
        context: entry.context,
        createdAt: entry.created_at,
      })) || []
    )
  } catch (error) {
    console.error("[v0] Error searching glossary:", error)
    return []
  }
}

/**
 * Delete glossary entry
 */
export async function deleteGlossaryEntry(entryId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("glossary").delete().eq("id", entryId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("[v0] Error deleting glossary entry:", error)
    return { success: false, error: "Failed to delete glossary entry" }
  }
}

/**
 * Apply glossary to text
 */
export function applyGlossaryToText(text: string, glossaryEntries: GlossaryEntry[]): string {
  let result = text

  // Sort by term length (longest first) to avoid partial replacements
  const sorted = [...glossaryEntries].sort((a, b) => b.term.length - a.term.length)

  sorted.forEach((entry) => {
    const regex = new RegExp(`\\b${entry.term}\\b`, "gi")
    result = result.replace(regex, entry.translation)
  })

  return result
}

/**
 * Extract new terms from text for glossary suggestion
 */
export function extractNewTerms(text: string, existingGlossary: GlossaryEntry[]): string[] {
  const words = text.split(/\s+/)
  const existingTerms = new Set(existingGlossary.map((e) => e.term.toLowerCase()))

  const newTerms = words
    .filter((word) => {
      const cleaned = word.replace(/[^\w]/g, "").toLowerCase()
      return cleaned.length > 3 && !existingTerms.has(cleaned)
    })
    .map((word) => word.replace(/[^\w]/g, ""))

  return [...new Set(newTerms)]
}
