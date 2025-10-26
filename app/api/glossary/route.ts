import { getGlossaryEntries, addGlossaryEntry, searchGlossary } from "@/lib/glossary-manager"
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const searchTerm = searchParams.get("search")
    const languagePair = searchParams.get("languagePair")

    let entries
    if (searchTerm) {
      entries = await searchGlossary(user.id, searchTerm)
    } else {
      entries = await getGlossaryEntries(user.id, languagePair || undefined)
    }

    return NextResponse.json(entries)
  } catch (error) {
    console.error("[v0] Glossary API error:", error)
    return NextResponse.json({ error: "Failed to fetch glossary" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { term, translation, languagePair, context } = await request.json()

    const result = await addGlossaryEntry(user.id, {
      term,
      translation,
      languagePair,
      context,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Glossary API error:", error)
    return NextResponse.json({ error: "Failed to add glossary entry" }, { status: 500 })
  }
}
